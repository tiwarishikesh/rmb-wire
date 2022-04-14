<?php
function signup($conn,$payload){
    if(empty($payload->fname) ||  empty($payload->email) || empty($payload->password)){
        return json_encode(array("status"=>"failed","details"=>"Bad Request"));
    }
    $payload->number= empty($payload->number) ? '00000000' : $payload->number; 
    $payload->lname = empty($payload->lname) ? '.' : $payload->lname;
    $payload->pin = empty($payload->pin) ? '0' : $payload->pin;
    $payload->role = empty($payload->role) ? '0' : $payload->role;
    $payload->password = md5($payload->password);
    if(mysqli_query($conn,"INSERT INTO `user`(`fname`, `lname`, `number`, `email`, `password`, `role`, `pincode`) VALUES ('$payload->fname','$payload->lname','$payload->number','$payload->email','$payload->password','1','$payload->pin')")===TRUE){
        include('login.php');
        return login_user($conn,$payload,$conn->insert_id);
    }else{
        if(!empty($payload->type) && $payload->type=="google" && ($conn->error == "Duplicate entry '".$payload->email."' for key 'email'" || $conn->error == "Duplicate entry '".$payload->number."' for key 'number'")){
            $x = mysqli_query($conn,"SELECT `id` FROM `user` WHERE `email` = '$payload->email'");
            if(mysqli_num_rows($x)==1){
                while($row=mysqli_fetch_object($x)){
                    include('login.php');
                    return login_user($conn,$payload,$row->id);
                }
            }
        }else{
            return $conn->error;
        }
    }
}
?>