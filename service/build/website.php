<?php
function getlegal($conn, $payload){
    return mysqli_getarray(mysqli_query($conn, "SELECT * FROM `website_about`"));
}

function updatelegal($conn, $payload){
    $user = $payload->jwt_vars;
    
    if($user->role != 'admin' && $user->role != 'superadmin'){
        my_error(403);
    }

    mysqli_query($conn, "UPDATE `website_about` SET `text`='$payload->text' WHERE `title`='$payload->title'");

    return null;
}

function gethome($conn, $payload){
    $stats = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `website_statistics`"));

    return array("statistics"=>$stats);
}

function updatehome($conn, $payload){
    $user = $payload->jwt_vars;
    
    if($user->role != 'admin' && $user->role != 'superadmin'){
        my_error(403);
    }

    mysqli_query($conn, "DELETE FROM `website_statistics`");
    foreach ($payload->stats as $stat) {
        mysqli_query($conn, "INSERT INTO `website_statistics`(`name`, `number`, `status`) VALUES ('$stat->title','$stat->stat','1')");
    }

    mysqli_query($conn, "UPDATE `website_about` SET `text`='$payload->landingViewText' WHERE `title`='landing-view-text'");
    mysqli_query($conn, "UPDATE `website_about` SET `text`='$payload->legendText' WHERE `title`='legend-text'");

    return null;
}
?>