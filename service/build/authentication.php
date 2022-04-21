<?php
function login($conn,$payload){
    check_params($payload,['email','password']);
    if(!filter_var($payload->email, FILTER_VALIDATE_EMAIL)) {
        my_error(400);
    }
    $resolved_password = password_hash($payload->password, PASSWORD_DEFAULT);
    $query = "SELECT member.id, member.fname, member.lname, member.membership_status, member.role, member_authentication.password FROM member JOIN member_authentication ON member.id = member_authentication.member_id JOIN member_contact ON member_contact.member_id = member.id WHERE member_contact.details = '$payload->email'";
    $result = mysqli_query($conn, $query);
    if(mysqli_num_rows($result) > 0){
        $user = mysqli_getarray($result)[0];
        if(password_verify($payload->password, $user->password)){
            unset($user->password);
            include('./jwt-func.php');
            header("Set-Cookie:" . "Authorization=".setToken(json_decode(json_encode($user), true))."; HttpOnly; Max-Age=31536000;");
            return array("status"=>"success", "user"=>$user);
        }else{
            return array("status"=>"failed","details"=>"Wrong passsword");
        }
    }else{
        return array("status"=>"failed","details"=>"No Records found");
    }
}

function checkauth($conn, $payload){
    return array("status"=>"success", "user"=>$payload->jwt_vars);
}

function logout($conn, $payload){
    unset($_COOKIE['Authorization']); 
    header("Set-Cookie:" . "Authorization=none; HttpOnly; Max-Age=31536000;");
}

function newpassword($conn, $payload){
    check_params($payload, ['password']);
    $resolved_password = mysqli_escape_string($conn, password_hash($payload->password, PASSWORD_DEFAULT));
    $time = getdate()[0];
    $user = $payload->jwt_vars;
    $query = "UPDATE member_authentication SET `password` = '$resolved_password', `set_on`='$time' WHERE `member_id` = '$user->id'";
    if(mysqli_query($conn, $query) === TRUE){
        return array("status"=>"success");
    }else{
        return array("status"=>"failed");
    }
}

function magicLink($conn, $payload){
    check_params($payload, ['email']);

    $result = mysqli_query($conn, "SELECT `member_id` FROM `member_contact` WHERE `details`='$payload->email'");
    if(mysqli_num_rows($result)==0){
        return(array("status"=>"failed","details"=>"No Records Found"));
    }

    $user = mysqli_getarray($result)[0];
    $newpassword = r_string(12);
    $hashed_password = password_hash($newpassword, PASSWORD_DEFAULT);

    $time = getdate()[0];
    $query = "INSERT INTO `member_otp`(`member_id`, `otp_type`, `otp`, `set_on`) VALUES ('$user->member_id','magicLink','$hashed_password', '$time')";
    
    if(mysqli_query($conn, $query) === TRUE){



        include('sys/comms.php');
        $email = new StdClass();
        $email->send_to = $payload->email;
        $email->send_from = "RMB International";   
        $user->link = $_SERVER['HTTP_HOST'].'?magicLink='.$hashed_password;

        $email->html = template_engine(file_get_contents('html_templates/barazki_signinotp.html'),$user);
        $email->subject = "The Magic Link to login to your account is here";

        return array("status"=>"success","details"=>$hashed_password,"email"=>json_decode(email($email)));
    }
}

function logInMagicLink($conn, $payload){
    check_params($payload, ['magicLink']);

    $time = getdate()[0] - (15*60);
    $result = mysqli_query($conn, "SELECT `member_id` FROM `member_otp` WHERE `otp_type` = 'magicLink' AND `otp`='$payload->magicLink' AND `set_on`>'$time'");
    if(mysqli_num_rows($result)>0){
        $id = mysqli_getarray($result)[0]->member_id;
        $user = mysqli_getarray(mysqli_query($conn, "SELECT member.id, member.fname, member.lname, member.membership_status, member.role, member_authentication.password FROM member JOIN member_authentication ON member.id = member_authentication.member_id JOIN member_contact ON member_contact.member_id = member.id WHERE member.id = '$id'"))[0];
        unset($user->password);
        include('./jwt-func.php');
        header("Set-Cookie:" . "Authorization=".setToken(json_decode(json_encode($user), true))."; HttpOnly; Max-Age=31536000;");
        
        return array("status"=>"success", "user"=>$user);
    }else{
        return array("status"=>"failed");
    }
}
?>