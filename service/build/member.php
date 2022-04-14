<?php
function getmember($conn, $payload){
    $user = $payload->jwt_vars;
    $personal_data = mysqli_getarray(mysqli_query($conn, "SELECT * FROM member WHERE id = '$user->id'"))[0];
    $business_data = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `member_profession` WHERE member_id = '$user->id'"))[0];
    $contact_data  =  mysqli_getarray(mysqli_query($conn, "SELECT * FROM `member_contact` WHERE member_id = '$user->id'"));
    unset($personal_data->password);

    return array("status"=>"success","data"=>array("personal"=>$personal_data, "professional"=>$business_data, "contact"=>$contact_data));
}
?>