<?php
function search($conn, $payload){
    $members = mysqli_getarray(mysqli_query($conn, "SELECT * FROM member_profession JOIN member ON member.id = member_profession.member_id WHERE member.membership_status = '2'"));
    $blogs = mysqli_getarray(mysqli_query($conn, "SELECT *, blogs.id as id FROM blogs JOIN member on blogs.member_id = member.id WHERE `status`='2'"));
    $events = mysqli_getarray(mysqli_query($conn, "SELECT * from member_events JOIN member ON member.id = member_events.member_id WHERE member_events.status = '1'"));

    return array("members"=>$members, "blogs"=>$blogs, "events"=>$events);
}

function init($conn, $payload){
    $time = getdate()[0]*1000;

    $events = mysqli_getarray(mysqli_query($conn, "SELECT * from member_events JOIN member ON member.id = member_events.member_id WHERE member_events.status = '1'"));
    /* $ads = mysqli_getarray(mysqli_query($conn, "")) */
}

function network($conn, $payload){
    $user = $payload->jwt_vars;

    $member = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `member`"));
    $connections = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `member_connections` WHERE `requested_by` = '$user->id' OR `requested_to` = '$user->id'"));
    $photos = mysqli_getarray(mysqli_query($conn, "SELECT * FROM `member_photos` WHERE `member_id`='$user->id'"));

    return array("member"=>$member, "connections"=>$connections, "photos"=>$photos);
}

function getPosts($conn, $payload){
    $user = $payload->jwt_vars;

    if(isset($payload->id)){
        return mysqli_getarray(mysqli_query($conn, "SELECT *, member_posts.id as 'post_id', member.id as 'member_id' FROM member JOIN member_posts ON member.id = member_posts.member_id WHERE member.id = '$payload->id' ORDER BY member_posts.posted_on DESC"));    
    }

    return mysqli_getarray(mysqli_query($conn, "SELECT *, member_posts.id as 'post_id', member.id as 'member_id' FROM member JOIN member_posts ON member.id = member_posts.member_id ORDER BY member_posts.posted_on DESC"));
}

function addNewPost($conn, $payload){
    $user = $payload->jwt_vars;

    $time = getdate()[0];
    if(mysqli_query($conn, "INSERT INTO `member_posts`(`member_id`, `post_body`, `image`, `status`, `posted_on`, `approved_on`) VALUES ('$user->id','$payload->post_body','$payload->image','0','$time','0')")===TRUE){
        return array("id"=>$conn->insert_id, "status"=>"success");
    }else{
        return $conn->error;
    }
}

function getAnotherMember($conn, $payload){
    $user = $payload->jwt_vars;
    $id = $payload->id;

    $personal = mysqli_getarray(mysqli_query($conn,"SELECT * FROM `member` WHERE `id`='$id'"))[0];
    $professional = mysqli_getarray(mysqli_query($conn,"SELECT * FROM `member_profession` WHERE `member_id`='$id'"))[0];
    $connections = mysqli_getarray(mysqli_query($conn,"SELECT * FROM `member_connections` WHERE `requested_by` = '$user->id' OR `requested_to` = '$id'"));
    $photos = mysqli_getarray(mysqli_query($conn,"SELECT * FROM `member_photos` WHERE `member_id`='$id'"));

    return array("personal"=>$personal, "professional"=>$professional, "connections"=>$connections, "photos"=>$photos);
}
?>