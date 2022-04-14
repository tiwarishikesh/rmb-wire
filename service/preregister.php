<?php
echo header('Content-Type:application/json');

include('sys/dbconnection.php');
$conn = getConnection();

$payload = json_decode(file_get_contents('php://input'));

if(mysqli_query($conn,"INSERT INTO `preregister`(`name`, `email`, `phone`, `password`) VALUES ('$payload->name','$payload->email','$payload->number','$payload->password')")===TRUE){
    /* echo json_encode(array("status"=>"success")); */
}
$name = $payload->name;
$html = file_get_contents('email_templates/preregister.html');
$html = str_replace("#name#",$name,$html);

$altBody = "Dear ".$name." you are registered";
// include phpmailer class
require_once 'mailer/class.phpmailer.php';

$subject = "BARAZKI - You have been registered";
// creates object
$mail = new PHPMailer(true);



/////////////////////////////////////SEND EMAIL////////////////////////////////////////////

try{
    $mail->IsSMTP(); 
    $mail->isHTML(true);
    $mail->SMTPDebug  = 0;                     
    $mail->SMTPAuth   = true;                  
    $mail->SMTPSecure = "ssl";                 
    $mail->Host       = "barazki.com";      
    $mail->Port       = 465;             
    $mail->AddAddress($payload->email);
    $mail->Username   = 'no-reply@barazki.com';
    $mail->Password   = 'v9_$_r,BcK7R';
    $mail->SetFrom('no-reply@barazki.com','BARAZKI');
    $mail->AddReplyTo("no-reply@barazki.com");
    $mail->Subject    = $subject;
    $mail->Body 	  = $html;
    $mail->AltBody    = $altBody;        
    if($mail->Send()){
            die(json_encode(array("status"=>"success","details"=>$mail)));
        }
    }
    catch(phpmailerException $ex)
{
    $mail->Password = '';
    $mail->Body = '';
    die(json_encode(array("status"=>"failed","details"=>$mail)));
}
?>