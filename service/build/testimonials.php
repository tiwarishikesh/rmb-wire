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

function getAdminTestimonials($conn, $payload){
    $user = $payload->jwt_vars;

    return mysqli_getarray(mysqli_query($conn, "SELECT *, website_testimonials.id as 'id' FROM website_testimonials JOIN member ON website_testimonials.member_id = member.id"));
}

function updateAdminTestimonials($conn, $payload){
    $user = $payload->jwt_vars;
    $time = getdate()[0];

    $approval = $payload->approval == "true" ? 1:0;
    if($payload->id == 'NA'){
        mysqli_query($conn, "INSERT INTO `website_testimonials`(`member_id`, `testimonial_text`, `status`, `uploaded_on`, `uploaded_by`) VALUES ('$payload->user','$payload->testimonial','$approval','$time','$user->id')");
    }else{
        mysqli_query($conn, "UPDATE `website_testimonials` SET `testimonial_text`='$payload->testimonial',`member_id`='$payload->user', `status`='0', `uploaded_on`='$time', `status`='$approval' WHERE `id`='$payload->id'");
        return "UPDATE `website_testimonials` SET `testimonial_text`='$payload->testimonial',`member_id`='$payload->user', `status`='0', `uploaded_on`='$time', `status`='$approval' WHERE `id`='$payload->id'";
    }

    return null;
}

function deleteAdminTestimonials($conn, $payload){
    $user = $payload->jwt_vars;

    mysqli_query($conn, "DELETE FROM `website_testimonials` WHERE `id`='$payload->id'");
    return null;
}
?>