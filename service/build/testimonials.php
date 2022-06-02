<?php
function getMyTestimonials($conn, $payload){
    $user = $payload->jwt_vars;

    return mysqli_getarray(mysqli_query($conn, "SELECT * FROM `website_testimonials` WHERE `member_id` = '$user->id'"));
}

function updateMyTestimonials($conn, $payload){
    $user = $payload->jwt_vars;
    $time = getdate()[0];

    if($payload->id == 'NA'){
        mysqli_query($conn, "INSERT INTO `website_testimonials`(`member_id`, `testimonial_text`, `status`, `uploaded_on`, `uploaded_by`) VALUES ('$user->id','$payload->testimonial','0','$time','$user->id')");
    }else{
        mysqli_query($conn, "UPDATE `website_testimonials` SET `testimonial_text`='$payload->testimonial', `status`='0', `uploaded_on`='$time' WHERE `id`='$payload->id'");
    }

    return null;
}

function deleteMyTestimonials($conn, $payload){
    $user = $payload->jwt_vars;

    mysqli_query($conn, "DELETE FROM `website_testimonials` WHERE `id`='$payload->id' AND `uploaded_by`='$user->id'");
    return null;
}
?>