<?php
function send_comm($x,$payload){
    getemplate();
    if($x == "signup"){
        $sms = "{{fname}}, Your account has been successfully created.";
        if (isset($payload->number)) {
            sms($payload->number, template_engine($sms, $payload));
        }
    }else if($x == "login_otp"){
        $comm_conn = getConnection();
        $order = mysqli_query($comm_conn,"SELECT orders.id, client.fname AS user_name, client.number AS user_number, orders.payment_amount, orders.payment_type, user_address.line_1, user_address.line_2 FROM orders JOIN user AS client ON orders.user = client.id JOIN user_address ON orders.address = user_address.id WHERE orders.id = '$payload->id'");
        if(mysqli_num_rows($order)>0){
            while($row = mysqli_fetch_object($order)){
                $sms = "Your BARAZKI Order #{{id}} worth INR {{payment_amount}} has been confirmed by our Store. Your order will be delivered within 12-18 hours to {{line_1}}, {{line_2}}";
                sms($row->user_number,template_engine($sms,$row));
            }
        }
    }
    else if($x == "order_placed"){
        $comm_conn = getConnection();
        $order = mysqli_query($comm_conn,"SELECT orders.id, client.fname AS user_name, client.number AS user_number, orders.payment_amount, orders.payment_type, user_address.line_1, user_address.line_2 FROM orders JOIN user AS client ON orders.user = client.id JOIN user_address ON orders.address = user_address.id WHERE orders.id = '$payload'");
        if(mysqli_num_rows($order)>0){
            while($row = mysqli_fetch_object($order)){
                $sms = "Your BARAZKI Order #{{id}} worth INR {{payment_amount}} has been placed and will be confirmed shortly by our store";
                return sms($row->user_number,template_engine($sms,$row));
            }
        }
    }
    else if($x == "confirm"){
        $comm_conn = getConnection();
        $order = mysqli_getarray(mysqli_query($comm_conn,"SELECT orders.id, orders.invoice as invoice_url,orders.payment_amount, orders.details, orders.revised_amount, orders.payment_status, orders.payment_details, client.fname AS user_name,client.number AS user_number,client.email as user_email, orders.payment_amount, orders.payment_type, user_address.line_1, user_address.line_2,user_address.line_3,user_address.landmark,user_address.pin, orders.ts, user_address.name as shipping_name FROM orders JOIN user AS client ON orders.user = client.id JOIN user_address ON orders.address = user_address.id WHERE orders.id = '$payload->id'"))[0];
        $email = new StdClass();
        $email->send_to = $order->user_email;
        $email->send_from = "BARAZKI Sales";                
        $row = generate_email_item_details_section($order);
        $email->html = template_engine(file_get_contents('html_templates/order_confirmed.html'),$row);
        if (isset($row->invoice_url)) {
            $email->attachment_stream = (file_get_contents($row->invoice_url));
            $email->attachment_name = 'Invoice_'.$row->id.'.pdf';
            $email->attachment_type= 'application/pdf';
        }
        $email->subject = "Your BARAZKI Order ".$row->id." has been confirmed";
        $sms = "Your BARAZKI Order #{{id}} worth INR {{revised_amount}} has been confirmed by our Store. Your order will be delivered within 12-18 hours to {{line_1}}, {{line_2}}";
        echo email($email);
        sms($row->user_number,template_engine($sms,$order));
    }else if($x == "dispatch"){
        $comm_conn = getConnection();
        $order = mysqli_query($comm_conn,"SELECT orders.id, client.fname AS user_name, client.number AS user_number, delivery.fname AS delivery_name, delivery.number AS delivery_number, orders.payment_amount, orders.payment_type, user_address.line_1, user_address.line_2 FROM orders JOIN user AS client ON orders.user = client.id JOIN user AS delivery ON orders.delivery_agent = delivery.id JOIN user_address ON orders.address = user_address.id WHERE orders.id = '$payload->id'");
        if(mysqli_num_rows($order)>0){
            while($row = mysqli_fetch_object($order)){
                $sms = "Your BARAZKI Order #{{id}} worth INR {{payment_amount}} is out for delivery. Your order will be delivered by our Delivery Partner, {{delivery_name}} - {{delivery_number}} to {{line_1}}, {{line_2}}";
                if($row->payment_type=="1"){
                    $sms .= "\r\nPlease keep change for speedy Delivery.";
                }
                sms($row->user_number,template_engine($sms,$row));
            }
        }
    }else if($x == "delivered"){
        $comm_conn = getConnection();
        $order = mysqli_query($comm_conn,"SELECT orders.id, client.fname AS user_name, client.number AS user_number, delivery.fname AS delivery_name, delivery.number AS delivery_number, orders.payment_amount, orders.payment_type, user_address.line_1, user_address.line_2 FROM orders JOIN user AS client ON orders.user = client.id JOIN user AS delivery ON orders.delivery_agent = delivery.id JOIN user_address ON orders.address = user_address.id WHERE orders.id = '$payload->id'");
        if(mysqli_num_rows($order)>0){
            while($row = mysqli_fetch_object($order)){
                $sms = "Your BARAZKI Order #{{id}} worth INR {{payment_amount}} has been delivered by {{delivery_name}} at {{line_1}}, {{line_2}}\r\n Feel free to contact us to provide feedback or for enquiries";
                sms($row->user_number,template_engine($sms,$row));
            }
        }
    }
}

function getemplate(){
    $templates = array(
        "confirm" => ["Your BARAZKI Order #{{id}} worth INR {{payment_amount}} has been confirmed by our Store.\r\nYour order will be delivered within 12-18 hours to {{line_1}}, {{line_2}}"]
    );
}

function email($email){
    require_once 'mailer/class.phpmailer.php';
    // creates object
    $mail = new PHPMailer(true);
    try{
        $mail->IsSMTP(); 
        $mail->isHTML(true);
        $mail->SMTPDebug  = 1;                     
        $mail->SMTPAuth   = true;                  
        $mail->SMTPSecure = "ssl";                 
        $mail->Host       = "barazki.in";
        $mail->Port       = 465;             
        $mail->AddAddress($email->send_to);
        $mail->Username   = 'no-reply@barazki.in';
        $mail->Password   = 'QkS.3df_JPT8';
        $mail->SetFrom('no-reply@barazki.in',$email->send_from ?? "BARAZKI");
        $mail->AddReplyTo("no-reply@barazki.in");
        $mail->Subject    = $email->subject;
        $mail->Body 	  = $email->html;
        $mail->AltBody    = $email->altBody ?? "Please use a email client that supports html";
        /* $mail->addAttachment('Rishikesh_Tiwari-Invoice_for_Order_1053.pdf'); */
        if (isset($email->attachment_stream) && isset($email->attachment_name) && isset($email->attachment_type)) {
            $mail->addStringAttachment($email->attachment_stream,$email->attachment_name,'base64', $email->attachment_type);
        }
        if($mail->Send()){
            unset($mail->Password);
            unset($mail->Body);
            return(json_encode(array("status"=>"success","details"=>$mail)));
        }
    }
    catch(phpmailerException $ex)
    {
        unset($mail->Password);
        unset($mail->Body);
        echo(json_encode(array("status"=>"failed","details"=>$mail)));
    }
}

function sms($number,$text){
    $sms_curl = curl_init();
    curl_setopt($sms_curl, CURLOPT_URL, "http://sms.admarksolution.com/sendSMS?username=Kanris&message=".urlencode($text)."&sendername=BRAZKI&smstype=TRANS&numbers=".$number."&apikey=1c5cc7fa-9f8f-4bc3-86b0-97c396e88371");
    curl_setopt($sms_curl, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($sms_curl);
    curl_close($sms_curl);
    return $output;
}

function web_notifications($reg_ids,$options){
    if(!is_array($reg_ids)){
        $reg_ids = get_registrations($reg_ids);
    }
    $url = 'https://fcm.googleapis.com/fcm/send';
    $data = array(
        "registration_ids" => $reg_ids,
        "collapse_key" => "type_a name",
        /* "data" => array (
            "title" => "Test title",
            "body" => "Body of test notification",
            "tag"=>"my-test-notification",
            "actions"=>[
                array("action"=>"like","title"=>"Shop Now","link"=>"store"),
                array("action"=>"share","title"=>"Another Test","link"=>"https://www.kanris.biz")
            ]
        ) */
        "data"=>$options
    );
    $data_string = json_encode($data);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER,
        array(
            'Content-Type:application/json',
            'Content-Length: ' . strlen($data_string),
            'authorization:key=AAAAg_zH6nw:APA91bH5IGuDpCIxJTwrS_jMdntEKd2jN9RyUlVR_6A_6BRiC4odP0MPj2oVcZGmtMKQ-bgws9M_iOL7_DR0-C_pkSs4XgRqF7GYFTtMaUx9V43Rm9zy3XqtZgjuOyZP4NJTZgGKcX3w'
        )
    );
    $result = curl_exec($ch);
    /* curl_close($ch); */
    if(!$result){
        return curl_error($ch);
    }else{
        return $result;
    }
}

function get_registrations($id){
    return array_map(function ($x){return $x->notification_key;}, mysqli_getarray(mysqli_query(getConnection(),"SELECT `notification_key` FROM `user_notifications` WHERE `id`='$id'")));
}

function generate_email_item_details_section($row){
    $details =  json_decode($row->details);
    $row->invoice_name = $row->shipping_name.'-Invoice for Order '.$row->id;
    $row->subtotal = number_format($details->money->subtotal,2);
    $row->shipping = number_format($details->money->shipping,2);
    $row->savings = number_format($details->money->savings,2);
    $row->paid_by_bcash = number_format($details->money->paid_by_bcash,2);
    $row->revised_amount = number_format($row->revised_amount ? $row->revised_amount : $row->payment_amount,2);
    $row->adjusted_amount = number_format($row->revised_amount - $row->payment_amount,2);;
    $row->use_env_pack = $details->use_env_pack ? "10.00" : "00.00";
    $row->ts = getdate($row->ts);
    $row->date_month = $row->ts["month"];
    $row->date_day = $row->ts["mday"];
    $row->date_year = $row->ts["year"];
    unset($row->ts);
    $row->items = "";
    if($row->payment_type=="1"){
        $row->payment_type_and_details = "CASH ON DELIVERY";
    }else{
        $row->payment_type_and_details = "Online";
        if($row->payment_status == "0"){
            $row->payment_type_and_details .= "<br><tag style='color:red;font-weight:bold'>FAILED</tag><br>Reference ID : ".explode("_",$row->payment_details)[1];
        }else{
            $row->payment_type_and_details .= "<br><tag style='color:green;font-weight:bold'>PAID</tag><br>Reference ID : ".explode("_",$row->payment_details)[1];
        }
    }
    foreach($details->cart as $single_cart_item){
        $row->items = $row->items . '
        <tr>
            <td width="50%" style="width: 50%;">'.$single_cart_item->name.'</td>
            <td width="25%" style="width: 25%;">'.(floatval($single_cart_item->units) * (float)(explode(' - ',$single_cart_item->unit_size)[0])).' '.(explode(' - ',$single_cart_item->unit_size)[1]).'</td>
            <td width="25%" style="width: 25%;text-align:right">'.sprintf('%.2f',$single_cart_item->amount).'</td>
        </tr>';
    }
    foreach ($row as $key => $var) {
        if($var == "0" ){
            $row->$key = null;
        }
    }
    if(is_null($row->shipping) || !isset($row->shipping)){
        $row->shipping = "00.00";
    }
    if(is_null($row->paid_by_bcash) || !isset($row->paid_by_bcash)){
        $row->paid_by_bcash = "00.00";
    }
    if(is_null($row->use_env_pack) || !isset($row->use_env_pack)){
        $row->use_env_pack = "00.00";
    }
    if(is_null($row->adjusted_amount) || !isset($row->adjusted_amount)){
        $row->adjusted_amount = "00.00";
    }
    return $row;
}
?>