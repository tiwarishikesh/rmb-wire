<?php
echo password_hash("Password", PASSWORD_DEFAULT);

$a = password_hash("Password", PASSWORD_DEFAULT);
$b = password_hash("Password", PASSWORD_DEFAULT);

echo 'test reult ' . password_verify($a, $b);
?>