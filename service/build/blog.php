<?php
function createNewBlog($conn, $payload){
    $user = $payload->jwt_vars;
    check_params($payload, ['title','excerpt','readTime','body','banner','thumbnail']);
    $time = getdate()[0];
    if(mysqli_query($conn,"INSERT INTO `blogs`( `member_id`, `title`, `banner`, `thumbnail`, `blog_text`,`excerpt`, `posted_on`, `readtime`, `status`)
    VALUES ('$user->id', '$payload->title','$payload->banner','$payload->thumbnail','$payload->body','$payload->excerpt','$time','$payload->readTime','0')") === TRUE){
        return array("status"=>"success");
    }else{
        return array("status"=>"success","details"=>$conn->error);
    }
}

function getMyBlogs($conn, $payload){
    $user = $payload->jwt_vars;
    $blogs = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `blogs` WHERE `member_id`='$user->id'"));
    return array("status"=>"success", "blogs"=>$blogs);
}

function updateMyBlog($conn, $payload){
    $user = $payload->jwt_vars;
    $query = "UPDATE `blogs` SET `member_id`='$user->id',`title`='$payload->title',`banner`='$payload->banner',`thumbnail`='$payload->thumbnail',`blog_text`='$payload->body',`excerpt`='$payload->excerpt',`status`='2' WHERE `id`='$payload->id'";
    mysqli_query($conn, $query);
    return array("status"=>"success","query"=>$query);
}
?>