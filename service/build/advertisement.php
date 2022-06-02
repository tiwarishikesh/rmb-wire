<?php
function getMyAds($conn, $payload){
    $user = $payload->jwt_vars;

    return mysqli_getarray(mysqli_query($conn, "SELECT * FROM `website_advertisements` WHERE `uploaded_by` = '$user->id'"));
}

function updateMyAds($conn, $payload){
    $user = $payload->jwt_vars;
    $time = getdate()[0];

    if($payload->id == 'NA'){
        mysqli_query($conn, "INSERT INTO `website_advertisements`(`type`, `image`, `title`, `description`, `days`, `link`, `status`, `uploaded_on`, `uploaded_by`)
        VALUES ('$payload->type',  '$payload->photo',  '$payload->title',  '$payload->description',    '$payload->duration',   '$payload->link', '0', '$time', '$user->id')");
    }else{
        mysqli_query($conn, "UPDATE `website_advertisements` SET `type`='$payload->type',`image`='$payload->photo',`title`='$payload->title',`description`='$payload->description',`days`='$payload->duration',`link`='$payload->link' ,`status`='0', `uploaded_on`='$time' WHERE `id`='$payload->id'");
    }

    return null;
}

function deleteMyAds($conn, $payload){
    $user = $payload->jwt_vars;

    mysqli_query($conn, "DELETE FROM `website_advertisements` WHERE `id`='$payload->id' AND `uploaded_by`='$user->id'");
    return null;
}

function myAdPhoto($conn, $payload){
    header('Content-Type: application/json');
    //ini_set('memory_limit','16M');

    $error					= false;

    $absolutedir			= dirname(__FILE__);
    $dir					= "../../../assets/advertisement/";
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

    return $response;
}
?>