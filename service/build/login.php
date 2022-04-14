<?php
function login_user($conn,$user,$id){
    $hash = r_string(128);
    $t = getdate()[0];
    if(mysqli_query($conn,"INSERT INTO `user_logindata`(`user`, `hash`, `ts`) VALUES ('$id','$hash','$t')")===TRUE){
        $user->id = $id;
        set_session($user);
        return array("status"=>"success","details"=>array("user"=>$user,"auth"=>$hash));
    }
}
?>