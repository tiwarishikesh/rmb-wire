<?php
function get_branch($conn,$payload){
    $id = $_SESSION['id'];
    $branch = '';
    $product = array();
    $result = mysqli_query($conn,"SELECT *, branch.id AS `branch_id`,branch.name AS `branch_name` FROM user JOIN user_branchadmin ON user.id = user_branchadmin.user_id JOIN branch ON branch.id = user_branchadmin.branch WHERE user.id = '$id'");
    if(mysqli_num_rows($result) == 1){
        while ($row = mysqli_fetch_object($result)) {
            $_SESSION['bm'] = true;
            $_SESSION['branch'] = $row->branch_id;
            unset($row->password);
            $branch = $row;
        }
    }else{
        return array("status"=>"no_auth");
    }
    $products = mysqli_query($conn,"SELECT * FROM products JOIN branch_stock ON products.id = branch_stock.product WHERE branch_stock.branch = '$branch->branch_id'");
    if(mysqli_num_rows($products)>1){
        while ($row = mysqli_fetch_object($products)) {
            $product[] = $row;
        }
    }
    
    $agents = array();
    $x = mysqli_query($conn,"SELECT * FROM user JOIN user_deliveryagent ON user.id = user_deliveryagent.user WHERE user_deliveryagent.branch='$branch->branch_id'");
    if(mysqli_num_rows($x)>0){
        while($row=mysqli_fetch_object($x)){
            unset($row->password);
            $agents[] = $row;
        }
    }

    return array("status"=>"success","branch"=>$branch,"products"=>$product,"agents"=>$agents);
}

function set_price($conn,$payload){
    if(empty($_SESSION['branch'])){
        die();
    }
    $branch = $_SESSION['branch'];
    if(mysqli_query($conn,"UPDATE `branch_stock` SET `unit_price` = '$payload->price' WHERE `product`='$payload->id' AND `branch` = '$branch'")===TRUE){
        return array("status"=>"success");
    }else{
        return array("status"=>"error");
    }
}
?>