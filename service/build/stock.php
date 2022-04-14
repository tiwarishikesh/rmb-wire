<?php
function get_products($conn,$payload){
    $a = mysqli_query($conn,"SELECT * FROM `products` ORDER BY `name` ASC");
    $out = array();
    while($p = mysqli_fetch_object($a)){
        $out[] = $p;
    }
    return $out;
}

function get_availaible($conn,$payload){
    $a = mysqli_query($conn,"SELECT * FROM `branch_stock`");
    $out = array();
    while($p = mysqli_fetch_object($a)){
        $out[] = $p;
    }
    return $out;
}

function get_branch_stock($conn,$payload){
    return mysqli_getarray(mysqli_query($conn,"SELECT products.id,products.name,products.unit,products.quantity,products.price,products.photo, products.local_name, products.keywords , products.hasDetailPage, IF(branch_stock.unit_price IS NULL,products.price,branch_stock.unit_price) as unit_price, IF(branch_stock.units > 0,'in-stock','no-stock') as availability, CONCAT(products.quantity,' ',products.unit) as q1,CONCAT(products.quantity * 2,' ',products.unit) as q2,CONCAT(products.quantity * 3,' ',products.unit) as q3,CONCAT(products.quantity * 4,' ',products.unit) as q4,CONCAT(products.quantity * 5,' ',products.unit) as q5,CONCAT(products.quantity * 6,' ',products.unit) as q6,CONCAT(products.quantity * 7,' ',products.unit) as q7,CONCAT(products.quantity * 8,' ',products.unit) as q8,CONCAT(products.quantity * 9,' ',products.unit) as q9,CONCAT(products.quantity * 10,' ',products.unit) as q10 from products LEFT JOIN (SELECT unit_price, units, product FROM branch_stock WHERE branch=1) as branch_stock ON products.id = branch_stock.product"));
}

function get_categories($conn,$payload){
    return array(
        "category"=>mysqli_getarray(mysqli_query($conn,"SELECT * FROM `products_categories` ORDER BY `position`")),
        "category_to_products"=>mysqli_getarray(mysqli_query($conn,"SELECT * FROM `products_to_categories`"))
    );
}

function check_availability($conn,$list,$branch){
    $branch = 1;
    $or_query = '';
    $a = true;
    foreach($list as $item){
        if(!$a){
            $or_query .= ' OR `product` = "'.$item->id. '"';
        }else{
            $or_query = '`product` = "'.$item->id.'"';
            $a = false;
        }
    }
    $q = "SELECT * FROM `branch_stock` WHERE ".$or_query." AND `branch` = '$branch'";
    $res = mysqli_query($conn,$q);
    $result = array();
    $available = true;
    if(mysqli_num_rows($res)>0){
        while($x = mysqli_fetch_object($res)){
            foreach($list as $item){
                if($item->id == $x->id){
                    if($x->units >= $item->units){
                        $x->av = 'yes';
                        
                    }else{
                        $x->av = 'no';
                        $available = false;
                    }
                }
            }
            $result[] = $x;
        }
    }
    return array("status"=>$available,"details"=>$result);
}

function update_stock($conn,$payload){
    if(empty($_SESSION['branch'])){
        die();
    }
    $branch = $_SESSION['branch'];
    if(mysqli_query($conn,"UPDATE branch_stock SET units = $payload->units WHERE product=$payload->id AND branch=$branch")===TRUE){
        if($payload->type=="wastage"){
            $payload->units = $payload->units*-1;
        }
        return array("status"=>"success");
    }else{
        return $conn->error;
    }
}

function remove_stock($conn,$list,$branch){
    $q = '';
    $a = true;
    foreach($list as $item){
        if(!$a){
            $q .= "UPDATE branch_stock SET units = units - $item->units WHERE product=$item->id AND branch=$branch";
        }else{
            $q = "UPDATE branch_stock SET units = units - $item->units WHERE product=$item->id AND branch=$branch;";
            $a = false;
        }
    }
    $conn -> multi_query($q);
}

function updateProduct($conn, $product){
    check_params($product, ["id", "name", "local_name", "keywords", "meta_description", "categories"]);
    $categoryToProductValues = array();
    foreach ($product->categories as $category){
        $categoryToProductValues[] = "('".$product->id."', '".$category."')";
    }
    $categoryToProductValues = implode(', ', $categoryToProductValues);

    mysqli_query($conn, "UPDATE `products` SET `name`='$product->name',`local_name`='$product->local_name',`keywords`='$product->keywords',`meta_description`='$product->meta_description' WHERE `id`='$product->id'");
    $conn->multi_query("DELETE FROM `products_to_categories` WHERE `product` = '$product->id' ;INSERT INTO `products_to_categories` (`product`,`category`) VALUES $categoryToProductValues");
    return $categoryToProductValues;
}
?>