<?php
function getdetails($conn,$payload){
    $id = $_SESSION['id'];
    $address = array();
    $wallet='';
    $a = mysqli_query($conn,"SELECT *,(CASE When number='0' Then NULL Else number End) as `number`, user_address.id AS `id`,user_address.name AS `name` FROM user_address JOIN state ON user_address.state = state.id WHERE user_address.user='$id' ");
    if(mysqli_num_rows($a)>0){
        while($add = mysqli_fetch_object($a)){
            $address[] = $add;
        }
    }
    $a = mysqli_query($conn,"SELECT * FROM `user_status` WHERE `id`='$id'");
    if(mysqli_num_rows($a)>0){
        while($b = mysqli_fetch_object($a)){
            $wallet = $b;
        }
    }
    return array("address"=>$address,"wallet"=>$wallet);
}
?>