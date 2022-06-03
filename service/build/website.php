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
    $banner_images = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `website_photos` WHERE `type` = '1'"));

    return array("statistics"=>$stats, "banners"=>$banner_images);
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

function deletehomeLandingImage($conn, $payload){
    mysqli_query($conn, "DELETE FROM `website_photos` WHERE `id`='$payload->id'");
    return null;
}

function homeLandingImage($conn, $payload){
    header('Content-Type: application/json');
    //ini_set('memory_limit','16M');

    $error					= false;

    $absolutedir			= dirname(__FILE__);
    $dir					= "../../../assets/";
    $serverdir				= str_replace("/","\\",$absolutedir.$dir);
    
    $tmp					= explode(',',$payload->data);
    $imgdata 				= base64_decode($tmp[1]);
    $explode=explode('.',$payload-> name);
    $end = end($explode);
    $extension				= strtolower($end);
    $filename				= substr($payload->name,0,-(strlen($extension) + 1)).'.'.substr(sha1(time()),0,6).'.'.$extension;
    $filename               = str_replace(" ","",$filename);
    $handle					= fopen($serverdir.$filename,'w');
    fwrite($handle, $imgdata);
    fclose($handle);

    $response = array(
            "status" 		=> "success",
            "url" 			=> $dir.$filename.'?'.time(), //added the time to force update when editting multiple times
            "filename" 		=> $filename,
            "directory"     => $serverdir
    );

    $user = $payload->jwt_vars;

    mysqli_query($conn, "INSERT INTO `website_photos`(`type`, `photo`, `title`, `status`, `uploaded_on`, `uploaded_by`) VALUES
                        ('1','$filename','NA','1','12346478','$user->id')");

    return $response;
}
?>