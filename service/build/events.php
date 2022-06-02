<?php
function getMyEvents($conn, $payload){
    $user = $payload->jwt_vars;

    return mysqli_getarray(mysqli_query($conn, "SELECT * FROM `member_events` WHERE `member_id` = '$user->id'"));
}


function updateMyEvent($conn, $payload){
    $user = $payload->jwt_vars;
    $time = getdate()[0];

    $details = json_encode($payload->details);
    if($payload->id == 'NA'){
        mysqli_query($conn, "INSERT INTO `member_events`(`event_title`, `event_description`, `event_type`, `event_datetime`, `details`, `member_id`, `status`) VALUES
                                ('$payload->title','$payload->description','$payload->type', '$payload->datetime', '$details', '$user->id', '0' )");
    }else{
        mysqli_query($conn, "UPDATE `member_events` SET `event_title`='$payload->title', `event_description`='$payload->description', `event_type`='$payload->type',`event_datetime`='$payload->datetime',`details`='$payload->details' ,`status`='0' WHERE `id`='$payload->id'");
    }

    return null;
}

function deleteMyEvent($conn, $payload){
    $user = $payload->jwt_vars;

    mysqli_query($conn, "DELETE FROM `member_events` WHERE `id`='$payload->id' AND `uploaded_by`='$user->id'");
    return null;
}
?>