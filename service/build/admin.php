<?php

function member_get_one($conn, $payload){
    $user = $payload->jwt_vars;
    
    if($user->role != 'admin' && $user->role != 'superadmin'){
        my_error(403);
    }

    $personal_data = mysqli_getarray(mysqli_query($conn, "SELECT * FROM member WHERE id = '$payload->id'"))[0];
    $business_data = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `member_profession` WHERE member_id = '$payload->id'"))[0];
    $contact_data  =  mysqli_getarray(mysqli_query($conn, "SELECT * FROM `member_contact` WHERE member_id = '$payload->id'"));
    unset($personal_data->password);

    return array("status"=>"success","data"=>array("personal"=>$personal_data, "professional"=>$business_data, "contact"=>$contact_data));
}

function load($conn, $payload){
    $user = $payload->jwt_vars;
    
    if($user->role != 'admin' && $user->role != 'superadmin'){
        my_error(403);
    }
    $members = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `member`"));

    return array("status"=>"success","data"=>array("members"=>$members));
}

function member_update($conn, $payload){
    $user = $payload->jwt_vars;
    
    if($user->role != 'admin' && $user->role != 'superadmin'){
        my_error(403);
    }

    mysqli_query($conn, "UPDATE `member` SET `membership_status` = '$payload->membership_status' WHERE `id`='$payload->id'");

    if($user->role = 'super-admin'){
        mysqli_query($conn, "UPDATE `member` SET `role` = '$payload->role' WHERE `id`='$payload->id'");
    }

    $personal = $payload->personal;
    $professional = $payload->professional;
    
    $result1 = mysqli_query($conn, "UPDATE `member` SET `fname`='$personal->fname',`lname`='$personal->lname',`club`='$personal->club',`about`='$personal->about',`gender`='$personal->gender',`dateofjoining`='$personal->dateofjoining', `dateofbirth` = '$personal->dateofbirth', `timezone`='$personal->timezone' WHERE `id` = '$payload->id'");
    $result2 = '';
    if(mysqli_num_rows(mysqli_query($conn, "SELECT * FROM `member` WHERE `id`='$payload->id'"))>0){
        $result2 = mysqli_query($conn, "UPDATE `member_profession` SET `organisation_name`='$professional->organisation_name',`position`='$professional->position',`description`='$professional->description',`organisation_address`='$professional->organisation_address' WHERE `member_id`= '$payload->id'");
    }else{
        $result2 = mysqli_query($conn, "INSERT INTO `member_profession`(`organisation_name`, `position`, `description`, `classification`, `member_id`, `organisation_address`) VALUES 
                                        '$professional->organisation_name','$professional->position', '$professional->description','1', '$user->id', '$professional->organisation_address' ");
    }
    mysqli_query($conn, "DELETE FROM `member_contact` WHERE `member_id` = '$payload->id'");
    foreach ($payload->contact as $contact) {
        mysqli_query($conn, "INSERT INTO `member_contact`(`member_id`, `contact_type`, `details`) VALUES ('$payload->id', '$contact->contact_type', '$contact->details')");
    }


    return array("status"=>"success", "details"=>$payload);
}
?>