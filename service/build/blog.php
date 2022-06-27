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
    $blogs = mysqli_getarray(mysqli_query($conn, "SELECT blogs.id, blogs.member_id,  IFNULL(blog_modified.title, blogs.title) AS `title`, IFNULL(blog_modified.banner, blogs.banner) AS `banner`, IFNULL(blog_modified.thumbnail, blogs.thumbnail) AS `thumbnail`, IFNULL(blog_modified.blog_text, blogs.blog_text) AS `blog_text`, IFNULL(blog_modified.excerpt, blogs.excerpt) AS `excerpt`, IFNULL(blog_modified.readtime, blogs.readtime) AS `readtime`, blogs.posted_on, blogs.status, blogs.access, blogs.approved_on, blogs.approved_by FROM blogs LEFT JOIN blog_modified ON blogs.id = blog_modified.id WHERE `member_id`='$user->id'"));
    return array("status"=>"success", "blogs"=>$blogs);
}

function updateMyBlog($conn, $payload){
    $user = $payload->jwt_vars;
    $time = getdate()[0];
    
    if(mysqli_num_rows(mysqli_query($conn, "SELECT * FROM `blog_modified` WHERE `id`='$payload->id'"))==0){
        mysqli_query($conn, "INSERT INTO `blog_modified`(`id`, `title`, `banner`, `thumbnail`, `blog_text`, `excerpt`, `date`, `readtime`) VALUES ('$payload->id', '$payload->title', '$payload->banner', '$payload->thumbnail', '$payload->body', '$payload->excerpt', '$time', '$payload->readTime')");
        echo "INSERT INTO `blog_modified`(`id`, `title`, `banner`, `thumbnail`, `blog_text`, `excerpt`, `date`, `readtime`) VALUES ('$payload->id', '$payload->title', '$payload->banner', '$payload->thumbnail', '$payload->body', '$payload->excerpt', '$time', '$payload->readTime')";
    }else{
        mysqli_query($conn, "UPDATE `blog_modified` SET `title`='$payload->title', `banner`='$payload->banner', `thumbnail`='$payload->thumbnail', `blog_text`='$payload->thumbnail', `blog_text`='$payload->body', `excerpt`='$payload->excerpt', `date`='$time', `readtime`='$payload->readTime' WHERE `id`='$payload->id'");
    }
    $query = "UPDATE `blogs` SET `status`='2' WHERE `id`='$payload->id'";
    mysqli_query($conn, $query);
    return array("status"=>"success","query"=>$query);
}

function getAdminBlogs($conn, $payload){
    $user = $payload->jwt_vars;

    $blogs = mysqli_getarray(mysqli_query($conn, "SELECT blogs.id, blogs.member_id, IFNULL(blog_modified.title, blogs.title) AS `title`, IFNULL(blog_modified.banner, blogs.banner) AS `banner`, IFNULL(blog_modified.thumbnail, blogs.thumbnail) AS `thumbnail`, IFNULL(blog_modified.blog_text, blogs.blog_text) AS `blog_text`, IFNULL(blog_modified.excerpt, blogs.excerpt) AS `excerpt`, IFNULL(blog_modified.readtime, blogs.readtime) AS `readtime`, blogs.posted_on, blogs.status, blogs.access, blogs.approved_on, blogs.approved_by, member.fname, member.lname FROM blogs LEFT JOIN blog_modified ON blogs.id = blog_modified.id JOIN member ON member.id = blogs.member_id"));
    return array("status"=>"success", "blogs"=>$blogs);
}

function getAdminBlog($conn, $payload){
    $user = $payload->jwt_vars;

    $currentBlog = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `blogs` WHERE `id`='$payload->id'"))[0];
    $editedBlog = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `blog_modified` WHERE `id`='$payload->id'"));

    return array("current"=>$currentBlog, "edited"=>$editedBlog);
}

function updateAdminBlog($conn, $payload){
    $user = $payload->jwt_vars;

    $approval = $payload->approval == "true" ? '1' : '0';
    $memberOnly = $payload->memberOnly == "true" ? '2' : '1';

    if(mysqli_num_rows(mysqli_query($conn, "SELECT * FROM `blog_modified` WHERE `id`='$payload->id'"))>0){
        $old = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `blog_modified` WHERE `id`='$payload->id'"))[0];
        mysqli_query($conn, "UPDATE `blogs` SET `title`='$old->title', `banner`='$old->banner', `thumbnail`= '$old->thumbnail', `readtime`='$old->readtime', `blog_text`='$old->blog_text', `excerpt`='$old->excerpt', `status`='$approval', `access`='$memberOnly' WHERE `id`='$payload->id'");
    }else{
        mysqli_query($conn, "UPDATE `blogs` SET `status`='$approval', `access`='$memberOnly' WHERE `id`='$payload->id'");
    }
}
?>