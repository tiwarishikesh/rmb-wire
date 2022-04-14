<?php
include('sys/comms.php');

function create_order($conn,$payload){
    include('stock.php');
    $av = check_availability($conn,$payload->cart,'1');
    $id = $_SESSION['id'];
    if($av['status']){
        ///////////////////////////VERIFY ORDER/////////////////////////////
        /* ------------------------CREATE BASKET------------------------- */
        $basket = json_decode(file_get_contents('../src/assets/json/cart_config.json'));
        $basket->cart = array();
        $basket->money = new stdClass();
        $basket->money->subtotal = 0;
        $basket->money->shipping = 0;
        $basket->money->membership_savings = 0;
        $basket->money->savings = 0;
        $basket->user = mysqli_getarray(mysqli_query($conn,"SELECT COUNT(orders.id) as `total_orders`,user_status.bcash_bal, user_status.membership_status,user_status.membership_plan, user_status.membership_expiry FROM orders JOIN user_status ON orders.user = user_status.id WHERE user_status.id = '$id'"))[0];
        /* ------------------ MATCH PRICES OF PRODUCTS ------------------ */
        $get_prices_q = '(';
        foreach($payload->cart as $value) {
            if(is_numeric($value->id)){
                $get_prices_q .= $value->id.',';
            }
        }
        $get_prices_q = substr($get_prices_q,0,-1). ')';
        $cart_products = mysqli_getarray(mysqli_query($conn,"SELECT `id`,`unit_price` FROM `branch_stock` WHERE `id` in $get_prices_q"));
        foreach ($cart_products as $db_products) {
            foreach($payload->cart as $order_products){
                if($db_products->id == $order_products->id){
                    $db_products->units = $order_products->units;
                    $db_products->amount = $db_products->unit_price * $order_products->units;
                    if($db_products->amount !== $order_products->amount){
                        return array("status"=>"conflict",'details'=>"product price mismatch");
                    }
                    $basket->money->subtotal += $order_products->amount;
                }
            }
        }
        $basket->cart = $cart_products;
        /* -------------------MATCH SHIPPING-------------------- */
        if($basket->money->subtotal == 0){return false;}
        if(!$basket->user->membership_status){
            if($basket->money->subtotal < $basket->config->shipping_charges[0]->threshold){
                $basket->money->shipping = $basket->config->shipping_charges[0]->charge;
            }else{
                $basket->money->savings += $basket->config->shipping_charges[0]->charge;
            }
        }else{
            if($basket->money->subtotal < $basket->config->shipping_charges[1]->threshold){
                $basket->money->membership_savings += $basket->config->shipping_charges[0]->charge - $basket->config->shipping_charges[1]->charge;
                $basket->money->savings += $basket->config->shipping_charges[0]->charge - $basket->config->shipping_charges[1]->charge;
                $basket->money->shipping = $basket->config->shipping_charges[1]->charge;
            }else if($basket->money->subtotal < $basket->config->shipping_charges[1]->threshold){
                $basket->money->savings += $basket->config->shipping_charges[0]->charge;
                $basket->money->membership_savings += $basket->config->shipping_charges[0]->charge;
            }else{
                $basket->money->savings += $basket->config->shipping_charges[0]->charge;
            }
        }
        /* -------------------MATCH COUPON-------------------- */
        if(!empty($payload->coupon_code)){
            foreach ($basket->coupons as $coupon) {
                if(strtolower($coupon->code) == strtolower($payload->coupon_code)){
                    $constraint_flags = array();
                    foreach($coupon->constraints as $constraint=>$condition){
                        switch ($constraint) {
                            case 'no_of_orders':
                                switch ($condition[0]){
                                    case "initial":
                                        if($basket->user->total_orders <= $condition[1]){
                                            $constraint_flags[] = true;
                                        }else{
                                            $constraint_flags[] = false;
                                        }
                                        break;
                                    case "equalto":
                                        if($basket->user->total_orders+1 == $condition[1]){
                                            $constraint_flags[] = true;
                                        }else{
                                            $constraint_flags[] = false;
                                        }
                                }
                                break;
                            case 'min_amount':
                                if($basket->money->subtotal >= $condition){
                                    $constraint_flags[] = true;
                                }else{
                                    $constraint_flags[] = false;
                                }
                                break;
                            case 'max_amount':
                                if($basket->money->subtotal <= $condition){
                                    $constraint_flags[] = true;
                                }else{
                                    $constraint_flags[] = false;
                                }
                                break;
                            case 'specific_products':
                                foreach($condition as $sp){
                                    $flag = false;
                                    foreach($basket->cart as $scp){
                                        if($scp->id == $sp){
                                            $flag = true;
                                        }
                                    }
                                    $constraint_flags[] = $flag;
                                }
                                break;
                            default:
                                # code...
                                break;
                        }
                    }
                    foreach ($constraint_flags as $flag) {
                        if(!$flag){
                            return array("status"=>"conflict","details"=>"Coupon code validation failed at contraints");
                        }
                    }
                    /* -------------------CONSTRAINTS CHECKED-------------------- */
                    /* -------------------CHECK COUPON ACTION-------------------- */
                    foreach($coupon->actions as $action=>$deets){
                        switch ($action) {
                            case 'freedelivery':
                                $basket->money->shipping = 0;
                                break;
                            case 'percentage_off':
                                $basket->money->subtotal = $basket->money->subtotal*(100 - $deets)*0.01;
                                break;
                            case 'amount_off':
                                $basket->money->subtotal -= $basket->money->amount;
                                break;
                            case "specific_products":
                                $dis = 0;
                                foreach($deets[0] as $coupon_si){
                                    foreach($cart_products as $server_single) {
                                        if($coupon_si == $server_single->id){
                                            if($server_single->units >= $deets[2][0]){
                                                switch ($deets[1]) {
                                                    case 'type1':
                                                        $dis += intval(intval($server_single->units/$deets[2][0]) * ($deets[2][1] * ($server_single->amount / $server_single->units)));
                                                        break;
                                                    case 'type2':
                                                        $dis += intval($server_single->amount * $deets[2][2] * 0.01);
                                                        break;
                                                    case 'type3':
                                                        $dis += intval(intval($server_single->units/$deets[2][0]) * ($deets[2][2]));
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            }
                                        }
                                    }
                                }
                                $basket->money->subtotal -= $dis;
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        }
        /* -------------------CALCULATE TOTAL-------------------- */
        if(empty($payload->money->membership_fees)){
            $basket->money->membership_fees = 0;
        }
        $basket->money->total = $basket->money->subtotal + $basket->money->shipping + $payload->membership_fees;
        if($payload->use_env_pack){
            $basket->money->total += $basket->config->env_friendly_pack;
        }
        if($payload->use_bcash){
            $basket->money->total_payable -= ($basket->config->total - $basket->user->bcash_bal) <= 0 ? "0" : ($basket->config->total - $basket->user->bcash_bal);
        }
        /* return $basket; */
        /* remove_stock($conn,$payload->cart,'1'); */
        $ts = getdate()[0];
        $payloade = json_encode($payload);
        $a = $payload->money->total;
        $conn_new = getConnection();
        $address_id = $payload->address->id;
        if(mysqli_query($conn_new,"INSERT INTO `orders`(`user`,`details`, `address`, `branch`, `ts`, `payment_amount`, `payment_type`, `payment_details`, `payment_status`, `order_status`, `notes`) 
        VALUES ('$id','$payloade','$address_id','1','$ts','$a','$payload->payment_method','na','0','0','na')")===TRUE){
            http_response_code(201);
            if($payload->payment_method == '1'){
                return array("status"=>"success","details"=>$conn_new->insert_id,"sms"=>send_comm('order_placed',$conn_new->insert_id));
            }else{
                include('razorpay_func.php');
                $id = $conn_new->insert_id;
                $client = getRazorPay_client();
                $order  = $client->order->create([
                    'receipt'         => $id,
                    'amount'          => $a*100, // amount in the smallest currency unit
                    'currency'        => 'INR',// <a href="/docs/payment-gateway/payments/international-payments/#supported-currencies" target="_blank">See the list of supported currencies</a>.)
                ]);
                $order_id = $order['id'];
                mysqli_query($conn_new,"UPDATE `orders` SET `payment_details` = '$order_id' WHERE `id`= '$id'");      
                return (array("status"=>"success","details"=>$id,"orderdetails"=>$order['id']));
            }
        }else{
            return ($payload);
        }
    }else{
        return array("status"=>"failed","details"=>$av);
    }
}

function verify_payment($conn,$payload){
    include('razorpay_func.php');
    if(verify_payment_sign($payload)["status"]=="success"){
        mysqli_query($conn,"UPDATE `orders` SET `payment_status`='1' WHERE `payment_details` = '$payload->razorpay_order_id'");
        $result = mysqli_query($conn,"SELECT * FROM `orders` WHERE `payment_details`='$payload->razorpay_order_id'");
        if(mysqli_num_rows($result)>0){
            while($row = mysqli_fetch_object($result)){
                $row->details = json_decode($row->details);
                return array("status"=>"success","order"=>$row,"sms"=>send_comm('order_placed',$row->id));
            }
        }
    }else{
        die("Payment Verification failed");
    }
}

function get_my_orders($conn,$payload){
    $id = $_SESSION['id'];
    $orders = array();
    $result = '';
    if(empty($payload->order_id)){
        $result = mysqli_query($conn,"SELECT * FROM `orders` WHERE `user` = '$id' ORDER BY `id` DESC");
    }else{
        $result = mysqli_query($conn,"SELECT * FROM `orders` WHERE `user` = '$id' AND `id` = '$payload->order_id'");;
    }
    if(mysqli_num_rows($result)>0){
        while($x = mysqli_fetch_object($result)){
            $x->details = json_decode($x->details);
            $orders[] = $x;
        }
    }
    return $orders;
}

function get_all_branch($conn,$payload){
    if(empty($_SESSION['branch'])){
        die();
    }
    $branch = $_SESSION['branch'];
    $orders = array();
    $result = mysqli_query($conn,"SELECT *, orders.id AS `order_id` FROM orders JOIN user ON user.id = orders.user JOIN user_address ON user_address.id = orders.address WHERE branch = '$branch' ORDER BY orders.ts DESC");
    if(mysqli_num_rows($result)>0){
        while ($row = mysqli_fetch_object($result)) {
            $row->details = json_decode($row->details);
            unset($row->password);
            $orders[] = $row;
        }
    }
    return $orders;
}

function cancel_order($conn,$payload){
    if(empty($payload->from) || empty($payload->order_id)){
        die(array("status"=>"aborted","details"=>"Bad Request"));
    }
    $query_part = '';
    $branch = '';
    if($payload->from == 'branch'){
        if(empty($_SESSION['branch'])){
            die();
        }
        $branch = $_SESSION['branch'];
        $query_part = "`branch` = '$branch'";
    }else if($payload->from == 'user'){
        if(empty($_SESSION['branch'])){
            die();
        }
        $id = $_SESSION['id'];
        $query_part = "`user` = '$id'";
    }
    $order = mysqli_query($conn,"SELECT * FROM `orders` WHERE `order_id`='$payload->order_id' AND ".$query_part);
        $o = array();
        if(mysqli_num_rows($order)>0){
            while($r = mysqli_fetch_object($order)){
            $o = $r;
            $branch = $r->branch;
        }
    }
    $o->details = json_decode($o->details);
    $t = json_decode($o->delivery_details);
    $t->cancelled = getdate()[0];
    $t = json_encode($t);
    foreach ($o->details->cart as $si) {
        mysqli_query($conn,"UPDATE branch_stock SET units = units + $si->units WHERE product=$si->id AND branch=$branch");  
    }
    mysqli_query($conn,"UPDATE ORDERS SET order_status= 4, SET notes = '$payload->notes',delivery_details = '$t' WHERE order_id = '$payload->notes'");
}

function confirm_order($conn,$payload){
    if(empty($_SESSION['branch'])){
        die();
    }
    $d = json_encode(array("confirmed"=>getdate()[0]));
    if(mysqli_query($conn,"UPDATE `orders` SET `order_status`='1',`delivery_details`='$d' WHERE `id`='$payload->id'")===TRUE){
        /* respond_with((array("status"=>"success","payload"=>"success"))); */
        $invoice_generated = generate_invoice($conn,$payload);
        if($invoice_generated["status"]=="success"){
            send_comm('confirm',$payload);
        }
    }
}

function dispatch_order($conn,$payload){
    if(empty($_SESSION['branch'])){
        die('no branch');
    }
    $d='';
    $x = mysqli_query($conn,"SELECT * FROM `orders` WHERE `id` = '$payload->id'");
    if(mysqli_num_rows($x)>0){
        while($row = mysqli_fetch_object($x)){
            $d = json_decode($row->delivery_details);
            $d->dispatched = getdate()[0];
            $d = json_encode($d);
        }
    }
    if(mysqli_query($conn,"UPDATE `orders` SET `order_status`='2',`delivery_agent`='$payload->delivery',`delivery_details`='$d' WHERE `id`='$payload->id'")===TRUE){
        send_comm('dispatch',$payload);
        return array("status"=>"success");
    }
}
function deliver_order($conn,$payload){
    if(empty($_SESSION['branch'])){
        die();
    }
    $d='';
    $x = mysqli_query($conn,"SELECT * FROM `orders` WHERE `id` = '$payload->id'");
    if(mysqli_num_rows($x)>0){
        while($row = mysqli_fetch_object($x)){
            $d = json_decode($row->delivery_details);
            $d->delivered = getdate()[0];
            $d = json_encode($d);
        }
    }
    if(mysqli_query($conn,"UPDATE `orders` SET `order_status`='3',`payment_status`='1',`delivery_details`='$d' WHERE `id`='$payload->id'")===TRUE){
        send_comm('delivered',$payload);
        return array("status"=>"success");
    }
}

function update_quantities($conn,$payload){
    $details = json_encode($payload->details);
    if(mysqli_query($conn,"UPDATE orders SET details='$details',revised_amount='$payload->revised_amount' WHERE id='$payload->order_id'")===TRUE){
        return "success";
    }else{
        return "failed";
    }
}

function get_all_delivery($conn,$payload){
    if(empty($_SESSION['is_agent'])){
        die(json_encode(array("status"=>"aborted","details"=>"Unauthorized Request")));
    }
    $id = $_SESSION['is_agent'];
    $order = mysqli_query($conn,"SELECT *, orders.id AS `order_id` FROM orders JOIN user ON user.id = orders.user JOIN user_address ON user_address.id = orders.address WHERE delivery_agent = '$id' ORDER BY orders.ts DESC");
    return array("status"=>"success","orders"=>mysqli_getarray(mysqli_query($conn,"SELECT *, orders.id AS `order_id` FROM orders JOIN user ON user.id = orders.user JOIN user_address ON user_address.id = orders.address WHERE delivery_agent = '$id' ORDER BY orders.ts DESC")));
}

function deliver_order_by_agent($conn,$payload){
    if(empty($_SESSION['is_agent'])){
        die(json_encode(array("status"=>"aborted","details"=>"Unauthorized Request")));
    }
    $id = $_SESSION['is_agent'];
    $x = mysqli_query($conn,"SELECT * FROM `orders` WHERE `id` = '$payload->id' AND `delivery_agent`='$id'");
    if(mysqli_num_rows($x)>0){
        while($row = mysqli_fetch_object($x)){
            $d = json_decode($row->delivery_details);
            $d->delivered = getdate()[0];
            $d = json_encode($d);
        }
    }
    if(mysqli_query($conn,"UPDATE `orders` SET `order_status`='3',`payment_status`='1',`delivery_details`='$d' WHERE `id`='$payload->id' AND `delivery_agent`='$id'")===TRUE){
        send_comm('delivered',$payload);
        return array("status"=>"success");
    }
}

function generate_invoice($conn,$payload){
    check_params($payload,['id']);
    $url = 'http://ec2-3-19-222-240.us-east-2.compute.amazonaws.com:4000/generate-invoice';
    $variables = mysqli_getarray(mysqli_query($conn,"SELECT user.fname, user.lname, user.number as phone, user.email,single_order.ts, single_order.details, single_order.revised_amount, single_order.payment_amount,single_order.payment_type, single_order.id as order_id,single_order.payment_status, single_order.payment_details, user_address.line_1, user_address.line_2, user_address.line_3, user_address.landmark, user_address.pin, user_address.number as shipping_number,user_address.name as shipping_name  FROM user JOIN (SELECT * FROM orders WHERE id ='$payload->id' ) AS single_order ON single_order.user = user.id JOIN user_address ON user_address.id = single_order.address"))[0];
    if(!isset($variables->shipping_name)){
        $variables->shipping_name = $variables->phone;
    }
    $details =  json_decode($variables->details);
    $variables->invoice_name = $variables->shipping_name.'-Invoice for Order '.$payload->id;
    $variables->subtotal = number_format($details->money->subtotal,2);
    $variables->shipping = number_format($details->money->shipping,2);
    $variables->savings = number_format($details->money->savings,2);
    $variables->paid_by_bcash = number_format($details->money->paid_by_bcash,2);
    $variables->revised_amount = number_format($variables->revised_amount ? $variables->revised_amount : $variables->payment_amount,2);
    $variables->adjusted_amount = number_format($variables->revised_amount - $variables->payment_amount,2);;
    $variables->use_env_pack = $details->use_env_pack ? "10.00" : "00.00";
    $variables->ts = getdate($variables->ts);
    $variables->date_month = $variables->ts["month"];
    $variables->date_day = $variables->ts["mday"];
    $variables->date_year = $variables->ts["year"];
    unset($variables->ts);
    $variables->items = "";
    if($variables->payment_type=="1"){
        $variables->payment_type_and_details = "CASH ON DELIVERY";
    }else{
        $variables->payment_type_and_details = "Online";
        if($variables->payment_status == "0"){
            $variables->payment_type_and_details .= "<br><tag style='color:red;font-weight:bold'>FAILED</tag><br>Reference ID : ".explode("_",$variables->payment_details)[1];
        }else{
            $variables->payment_type_and_details .= "<br><tag style='color:green;font-weight:bold'>PAID</tag><br>Reference ID : ".explode("_",$variables->payment_details)[1];
        }
    }
    foreach($details->cart as $single_cart_item){
        $variables->items = $variables->items . '<tr>
        <td style="font-size: 12px; font-family: Open Sans, sans-serif; color: #6fb43d;  line-height: 18px;  vertical-align: top; padding:10px 0;" class="article">
            '.$single_cart_item->name.'
        </td>
        <td style="font-size: 12px; font-family: Open Sans, sans-serif; color: #646a6e;  line-height: 18px;  vertical-align: top; padding:10px 0;">'.(floatval($single_cart_item->units) * (float)(explode(' - ',$single_cart_item->unit_size)[0])).' '.(explode(' - ',$single_cart_item->unit_size)[1]).'</td>
        <td style="font-size: 12px; font-family: Open Sans, sans-serif; color: #646a6e;  line-height: 18px;  vertical-align: top; padding:10px 0;" align="center">'.$single_cart_item->units.'</td>
        <td style="font-size: 12px; font-family: Open Sans, sans-serif; color: #1e2b33;  line-height: 18px;  vertical-align: top; padding:10px 0;" align="right">&#8377;'.$single_cart_item->amount.'</td>
    <tr>
    <tr><td height="1" colspan="4" style="border-bottom:1px solid #e4e4e4"></td></tr>';
    }
    foreach ($variables as $key => $var) {
        if($var == "0" ){
            $variables->$key = null;
        }
    }
    if(is_null($variables->shipping) || !isset($variables->shipping)){
        $variables->shipping = "00.00";
    }
    if(is_null($variables->paid_by_bcash) || !isset($variables->paid_by_bcash)){
        $variables->paid_by_bcash = "00.00";
    }
    if(is_null($variables->use_env_pack) || !isset($variables->use_env_pack)){
        $variables->use_env_pack = "00.00";
    }
    if(is_null($variables->adjusted_amount) || !isset($variables->adjusted_amount)){
        $variables->adjusted_amount = "00.00";
    }
    
    $data = array('name' => str_replace(" ","_",$variables->invoice_name), 'html' => template_engine(file_get_contents('html_templates/invoice.html'),$variables));

    // use key 'http' even if you send the request to https://...
    $options = array(
        'http' => array(
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data)
        )
    );
    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    if ($result === FALSE) { 
        include('../sys/comms.php');
        sms('9167053482','Error in bill generation: '.$result);
        sms('8097474807','Error in bill generation: '.$result);
    }else{
        $result = json_decode($result);
        if(mysqli_query($conn,"UPDATE orders SET invoice='$result->file_path' WHERE id='$payload->id'")===TRUE){
            return array("status"=>"success","details"=>$result);
        }else{
            return $conn->error;
        }
    }
}
?>