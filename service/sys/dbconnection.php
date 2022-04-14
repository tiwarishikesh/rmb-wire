<?php
function getConnection(){
    $dbname = "vastug2h_rmbIntTemp";
    $user="vastug2h_rmbIntTemp";
    $pass="l54@EZh.h{M7";

    $server = $_ENV['dbConnection']['server'];
    
    $user = "root";$pass = "";$dbname = "rmbinternational";
    
    $conn = new mysqli($server, $user, $pass, $dbname);
    if($conn->connect_error){
        die("Connection failed:" . $conn->connect_error);      
    }else{
        return $conn;
    }
}
?>