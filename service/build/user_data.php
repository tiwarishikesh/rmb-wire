<?php
function update_info($conn,$payload){
    if(empty($payload->fname) || empty($payload->number) || empty($payload->email)){
        return array("status"=>"aborted","details"=>"Bad Request");
    }else{
        $id = $_SESSION['id'];
        $payload->id = $_SESSION['id'];
        $payload->lname = empty($payload->lname) ? '.' : $payload->lname;
        $payload->pin = empty($payload->pin) ? '0' : $payload->pin;
        $payload->role = $_SESSION['role'];
        if(mysqli_query($conn,"UPDATE `user` SET `fname`='$payload->fname',`lname`='$payload->lname',`number`='$payload->number',`email`='$payload->email',`pincode`='$payload->pin' WHERE `id`='$id'")===TRUE){
            set_session($payload);
            return array("status"=>"success","details"=>$payload);
        }else{
            return $conn->error;
        }
    }
}

function update_password($conn,$payload){
    if(empty($payload->password)){
        return array("status"=>"aborted","details"=>"Bad Request");
    }else{
        $payload->password = md5($payload->password);
        $id = $_SESSION['id'];
        if(mysqli_query($conn,"UPDATE `user` SET `password`='$payload->password' WHERE `id`='$id'")===TRUE){
            return array("status"=>"success");
        }else{
            return $conn->error;
        }
    }
}

function add_address($conn,$payload){
    check_params($payload,['name','line_1','line_2', 'landmark', 'pin']);
    $payload->number = $payload->number ?? 0;
    $payload->lat = $payload->lat ?? '';
    $payload->lng = $payload->lng ?? '';
    $payload->state = '1';
    $is_def = 0;
    $id = $_SESSION['id'];
    if(mysqli_num_rows(mysqli_query($conn,"SELECT `id` FROM `user_address` WHERE `user` = '$id'"))<1){
        $is_def = 1;
    }else if($payload->set_default == 'yes'){
        mysqli_query($conn,"UPDATE `user_address` SET `is_default`='0' WHERE `user` = '$id'");
        $is_def = 1;
    }
    if(mysqli_query($conn,"INSERT INTO `user_address`(`user`,`name`,`number`, `line_1`, `line_2`, `line_3`, `landmark`, `state`, `pin`,`lat`,`lng`,`is_default`) VALUES ('$id','$payload->name','$payload->number','$payload->line_1','$payload->line_2','$payload->line_3','$payload->landmark','$payload->state','$payload->pin','$payload->lat','$payload->lng','$is_def')")===TRUE){
        http_response_code(201);
        return array("status"=>"success","details"=>$conn->insert_id);
    }else{
        return $conn->error;
    }
}

function edit_address($conn,$payload){
    check_params($payload,['name','line_1','line_2', 'landmark', 'pin']);
    $payload->number = $payload->number ?? 0;
    $payload->lat = $payload->lat ?? '';
    $payload->lng = $payload->lng ?? '';
    $payload->state = '1';
    $is_def = 0;
    $user_id = $_SESSION['id'];
    mysqli_query($conn,"UPDATE `user_address` SET `name`='$payload->name',`number`='$payload->number',`line_1`='$payload->line_1',`line_2`='$payload->line_2',`line_3`='$payload->line_3',`landmark`='$payload->landmark',`state`='$payload->state',`pin`='$payload->pin', `lat`='$payload->lat', `lng`='$payload->lng' WHERE `id` = '$payload->id' AND `user` = '$user_id'");
    http_response_code(202);
    return array("status"=>"success");
}

function delete_address($conn,$payload){
    if(empty($payload->id)){
        return array("status"=>"aborted","details"=>"Bad Request");
    }
    $user_id = $_SESSION['id'];
    mysqli_query($conn,"DELETE FROM `user_address` WHERE `id` = '$payload->id' AND `user`='$user_id'");
    http_response_code(202);
    return array("status"=>"success");
}

function set_add_default($conn,$payload){
    if(empty($payload->id)){
        return array("status"=>"aborted","details"=>"Bad Request");
    }
    $user_id = $_SESSION['id'];
    mysqli_query($conn,"UPDATE `user_address` SET `is_default` = '0' WHERE `user`='$user_id'");
    mysqli_query($conn,"UPDATE `user_address` SET `is_default` = '1' WHERE `id` = '$payload->id' AND `user`='$user_id'");
    return array("status"=>"success");
}

function add_notification($conn,$payload){
    /* check_params($conn,['key']); */
    session_start();
    if(!empty($_SESSION['id'])){
        $payload->id = $_SESSION['id'];
    }else{
        $payload->id = "0";
    }
    $ts = getdate()[0];
    if(isset($payload->old_token)){
        if(mysqli_query($conn,"UPDATE user_notifications SET id='$payload->id', notification_key='$payload->key', ts = '$ts'  WHERE notification_key='$payload->old_token'")===TRUE){
            return array("status"=>"success 1");
        }else{
            return array("status"=>"failed 1","error"=>$conn->error);
        }
    }else{
        if(mysqli_query($conn,"INSERT INTO `user_notifications`(`id`,`notification_key`, `ts`) VALUES ('$payload->id','$payload->key','$ts')")===TRUE){
            return array("status"=>"success 2");
        }else{
            return array("status"=>"failed 2","error"=>$conn->error);
        }
    }
}
?>