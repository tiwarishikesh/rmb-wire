<?php
function search($conn, $payload){
    $members = mysqli_getarray(mysqli_query($conn, "SELECT * FROM member_profession JOIN member ON member.id = member_profession.member_id WHERE member.membership_status = '2'"));
    $blogs = mysqli_getarray(mysqli_query($conn, "SELECT *, blogs.id as id FROM blogs JOIN member on blogs.member_id = member.id WHERE `status`='2'"));
    $events = mysqli_getarray(mysqli_query($conn, "SELECT * from member_events JOIN member ON member.id = member_events.member_id WHERE member_events.status = '1'"));

    return array("members"=>$members, "blogs"=>$blogs, "events"=>$events);
}
?>