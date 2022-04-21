<?php
    require_once 'lib/php-jwt/BeforeValidException.php';
    require_once 'lib/php-jwt/ExpiredException.php';
    require_once 'lib/php-jwt/SignatureInvalidException.php';
    require_once 'lib/php-jwt/JWT.php';
    require_once 'lib/php-jwt/Key.php';


    use \Firebase\JWT\JWT;
    use Firebase\JWT\Key;

function setToken($token){
    $key = "RMB-International-Key";
    /**
     * IMPORTANT:
     * You must specify supported algorithms for your application. See
     * https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-40
     * for a list of spec-compliant algorithms.
    */
    $jwt = JWT::encode($token, $key, 'HS256');
    return $jwt;
}

function checkToken($token){
    $key = "RMB-International-Key";
    $decoded = JWT::decode($token, new Key($key, 'HS256'));
    return $decoded;
}
?>