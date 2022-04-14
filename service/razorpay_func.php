<?php
use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

function getRazorPay_client(){
    require_once('lib/razorpay/Razorpay.php');
    $razorpay_key_id = $_ENV['keys']['razorpay_key_id'];
    $razorpay_key_secret = $_ENV['keys']['razorpay_key_secret'];
    $client = new api($razorpay_key_id, $razorpay_key_secret);
    return $client;
}

function verify_payment_sign($payload){
    $client = getRazorPay_client();
    try{
        $attributes = array(
            'razorpay_order_id' => $payload->razorpay_order_id,
            'razorpay_payment_id' => $payload->razorpay_payment_id,
            'razorpay_signature' => $payload->razorpay_signature
        );
        $client->utility->verifyPaymentSignature($attributes);   
    }catch(SignatureVerificationError $e){
        $response = 'failure' ;       
        $error = 'Razorpay Error : ' . $e->getMessage();
        return array("status"=>"failed","details"=>$e);
    }
    return array("status"=>"success");
}
?>