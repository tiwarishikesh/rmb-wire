<?php
echo header('Content-Type:application/json');
echo header("Expires: Tue, 01 Jan 1971 00:00:00 GMT");
echo header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
echo header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
echo header("Cache-Control: post-check=0, pre-check=0", false);
echo header("Pragma: no-cache");
echo header("Connection: close");
//error_reporting(0);

    header('Access-Control-Allow-Origin: *'); 
    header("Access-Control-Allow-Credentials: true");
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Max-Age: 1000');
    header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token , Authorization');

///['POST_TYPE' , 'PATH' , 'FILE_NAME', 'FUNCTION NAME [OPTIONAL]' , 'auth [if login required]' , [roles allowed]]

$routes = array(
    ["POST","auth","build/authentication.php","login","",[]],
    ["POST","register","build/authentication.php","register","",[]],
    ["GET","auth","build/authentication.php","checkauth","auth",[]],
    ["DELETE","auth","build/authentication.php","logout","auth",[]],
    ["PUT","auth","build/authentication.php","newpassword","auth",[]],
    ["OPTIONS","auth","build/authentication.php","magicLink","",[]],
    ["PATCH","auth","build/authentication.php","logInMagicLink","",[]],
    ["GET","member","build/member.php","getmember","auth",[]],
    ["POST","member","build/member.php","updatemember","auth",[]],
    ["POST","profile_photo","build/member.php","upload_profilephoto","auth",[]],
    ["POST","business_photo","build/member.php","upload_businessphoto","auth",[]],
    ["POST","gallery_photo","build/member.php","upload_galleryphoto","auth",[]],

    ["POST","new_profile_photo","build/member.php","reg_upload_profilephoto","",[]],
    ["POST","new_business_photo","build/member.php","reg_upload_businessphoto","",[]],
    
    ["GET","gallery_photo","build/member.php","getMyPhotos","auth",[]],
    ["PUT","gallery_photo","build/member.php","updatePhotoData","auth",[]],
    ["PUT","gallery_photo/change","build/member.php","updatePhotoUrl","auth",[]],
    ["DELETE","gallery_photo","build/member.php","deleteMemberPhoto","auth",[]],
    ["POST","blogimage","build/member.php","uploadblogPhoto","auth",[]],

    ["POST","myBlog","build/blog.php","createNewBlog","auth",[]],
    ["GET","myBlog","build/blog.php","getMyBlogs","auth",[]],
    ["PUT","myBlog","build/blog.php","updateMyBlog","auth",[]],

    ["GET","myTestimonials","build/testimonials.php","getMyTestimonials","auth",[]],
    ["POST","myTestimonial","build/testimonials.php","updateMyTestimonials","auth",[]],
    ["DELETE","myTestimonial","build/testimonials.php","deleteMyTestimonials","auth",[]],

    ["GET","myEvents","build/events.php","getMyEvents","auth",[]],
    ["POST","myEvents","build/events.php","updateMyEvent","auth",[]],
    ["DELETE","myEvent","build/events.php","deleteMyEvent","auth",[]],

    ["GET","myAds","build/advertisement.php","getMyAds","auth",[]],
    ["POST","myAd","build/advertisement.php","updateMyAds","auth",[]],
    ["DELETE","myAd","build/advertisement.php","deleteMyAds","auth",[]],
    ["POST","myAdPhoto","build/advertisement.php","myAdPhoto","auth",[]],


    ["GET","admin","build/admin.php","load","auth",[]],

    ["GET","admin/member","build/admin.php","member_get_one","auth",[]],
    ["POST","admin/member","build/admin.php","member_update","auth",[]],


    ["GET","website/legal","build/website.php","getlegal","",[]],
    ["POST","website/legal","build/website.php","updatelegal","auth",[]],

    ["GET","website/home","build/website.php","gethome","",[]],
    ["POST","website/home","build/website.php","updatehome","auth",[]],

    ["GET","search","build/search.php","search","",[]]

);

foreach ($routes as $route) {
    if($_SERVER['REQUEST_METHOD'] == $route[0] && explode('?',explode('service/',$_SERVER['REQUEST_URI'])[1])[0] == $route[1]){
        $jwt_vars = new stdClass();
        if($route[4] == "auth"){
            $jwt_vars = checklogin($route[5]);
        }
        if(!empty($route[2])){
            $_ENV = json_decode(file_get_contents('environment/variables.json'), TRUE);
            include('sys/dbconnection.php');
            $conn = getConnection();
            $payload = getpayload($conn);
            $payload->jwt_vars = $jwt_vars;
            include($route[2]);
            if(!empty($route[3])){
                http_response_code(200);
                die(json_encode(array("status"=>"success","payload"=>call_user_func($route[3],$conn,$payload))));
            }
        }else{
            die(json_encode(array("status"=>"aborted","details"=>"Find another job")));
        }
    }
}

my_error(404);

function checklogin($roles){
    include_once('jwt-func.php');
    if ($_COOKIE['Authorization'] && $_COOKIE['Authorization']!== 'none') {
        return (checkToken($_COOKIE['Authorization']));
    }else{
        my_error(401);
    }
}

function getpayload($conn){
    $payload = new stdClass();
    if($_SERVER['REQUEST_METHOD'] == "GET" ){
        if(!empty(explode('?',$_SERVER['REQUEST_URI'])[1])){
            $path = explode('?',$_SERVER['REQUEST_URI'])[1];
            $path = explode('&',$path);
            foreach ( $path as $x) {
                if(!empty(explode('=',$x)[1])){
                    $y = explode('=',$x)[0];
                    $payload->$y = explode('=',$x)[1];
                }
            }
        }
    }else{
        $payload = cleanPayload(json_decode(file_get_contents("php://input")), $conn);
    }
    return $payload;
}

function cleanPayload($payload, $conn){
    foreach(get_object_vars($payload) as $key => $value) {
        if($value == "na"){
            $payload->$key = "0";
        }else if(!is_array($value) && !is_object($value) && !is_bool($value)){
            $payload->$key = mysqli_real_escape_string($conn,$value);
        }else if(is_object($value)){
            $payload->key = cleanPayload($value, $conn);
        }/* else if(is_array($value)){
            $payload->key = array_map(function( $e, $conn ) {
                return mysqli_real_escape_string( $conn, $e);
            }, $value );
        } */
    };
    return $payload;
}


function my_error($x){
    $code = $x;
    switch ($code){
        case 400 : http_response_code(400);die(json_encode(array("status"=>"Bad Request","response"=>"Request parameters missing")));break;
        case 401 : http_response_code(401);die(json_encode(array("status"=>"Unauthorized Request","response"=>"This service is for logged in users only")));break;
        case 403 : http_response_code(403);die(json_encode(array("status"=>"Forbidden Request","response"=>"Your account doesn't have access to this resource")));break;
        case 404 : http_response_code(404);die(json_encode(array("status"=>"Not Found","response"=>"This endpoint does not exist")));break;
        case 500 : http_response_code(500);die(json_encode(array("status"=>"Internal Server Error","response"=>"Something broke")));break;
    }
}

function respond_with($res){
    ignore_user_abort(true);
    ob_start();
    echo json_encode($res);
    header($_SERVER["SERVER_PROTOCOL"] . " 202 Accepted");
    header("Status: 202 Accepted");
    header('Content-Length: '.ob_get_length());
    ob_end_flush();
    ob_flush();
    flush();
}

function check_params($payload,$params){
    if(!is_array($params)){
        my_error(500);
    }
    if(is_null($payload)){
        my_error(400);
    }
    foreach($params as $param){
        if(!property_exists($payload, $param) || empty($payload->$param)){
            my_error(400);
        }
    }
}

function r_string($length,$type = NULL) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if($type="num_only"){
        $characters = "0123456789";
    }
    $string = '';

    for ($i = 0; $i < $length; $i++) {
        $string .= $characters[mt_rand(0, strlen($characters) - 1)];
    }

    return $string;
}

function mysqli_getarray($x){
    $z = array();
    if(mysqli_num_rows($x)>0){
        while($y = mysqli_fetch_object($x)){
            $z[] = $y;
        }
    }
    return $z;
}

function endsWith( $haystack, $needle ) {
    $length = strlen( $needle );
    if( !$length ) {
        return true;
    }
    return substr( $haystack, -$length ) === $needle;
}


function template_engine($template,$vars){
    foreach ($vars as $key => $var) {
        $template = str_replace('{{'.$key.'}}',$var,$template);
    }
    return $template;
}
?>