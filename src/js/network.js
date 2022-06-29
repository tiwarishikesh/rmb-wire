let network = {
    search: async function () {
        this.readSearch().then(async ()=>{
            let filteredMembers = await this.filterForSearch.members();
            let filteredEvents = await this.filterForSearch.events();
            let filteredBlogs = await this.filterForSearch.blogs();

            console.log(filteredBlogs, filteredEvents, filteredMembers);
            $("search .search-single-member").remove();
            $("search .search-single-blog").remove();
            $("search .search-single-event").remove();

            template_engine('.search-single-member', filteredMembers, "#search_members");
            template_engine('.search-single-blog', filteredBlogs, "#search_blogs");
            template_engine('.search-single-event', filteredEvents, "#search_events");
        })
    },
    filterForSearch:{
        members: async function (){
            let blank_array = [];
            let searchTerm = $("#search_input").val().toLowerCase();
            network.searchStorage.members.forEach((member)=>{
                if(member.fname.toLowerCase().includes(searchTerm) || member.lname.toLowerCase().includes(searchTerm) || member.organisation_name.toLowerCase().includes(searchTerm) || member.description.toLowerCase().includes(searchTerm) || member.about.toLowerCase().includes(searchTerm) || member.organisation_name.toLowerCase().includes(searchTerm) || member.organisation_name.toLowerCase().includes(searchTerm)){
                    blank_array.push(member);
                }
            })
            return blank_array;
        },
        blogs: async function (){
            let blank_array = [];
            let searchTerm = $("#search_input").val();
            network.searchStorage.blogs.forEach((member)=>{
                if(member.fname.toLowerCase().includes(searchTerm) || member.lname.toLowerCase().includes(searchTerm) || member.title.toLowerCase().includes(searchTerm) || member.blog_text.toLowerCase().includes(searchTerm) || member.excerpt.toLowerCase().includes(searchTerm)){
                    blank_array.push(member);
                }
            })
            return blank_array;
        },
        events: async function (){
            let blank_array = [];
            let searchTerm = $("#search_input").val();
            network.searchStorage.events.forEach((member)=>{
                if(member.fname.toLowerCase().includes(searchTerm) || member.lname.toLowerCase().includes(searchTerm) || member.event_title.toLowerCase().includes(searchTerm) || member.event_description.toLowerCase().includes(searchTerm)){
                    blank_array.push(member);
                }
            })
            return blank_array;
        }
    },
    readSearch: function () {
        return new Promise((resolve, reject)=>{
            if(!this.searchStorage){
                xhttp.get("search").then((response)=>{
                    network.searchStorage = response;
                    resolve();
                })
            }else{
                resolve();
            }
        })
    },
    load: async function() {
        return new Promise((resolve, reject)=>{
            xhttp.get('network').then((response)=>{
                this.data = response;
                this.data.friends = [];
                this.data.connections.forEach((connect)=>{
                    let id = auth.memberData.personal.id;
                    if(connect.requested_by == id){
                        let friend = this.data.member.filter(x => x.id == connect.requested_to)[0]
                        this.data.friends.push({
                            id    : friend.id,
                            fname : friend.fname,
                            lname : friend.lname,
                            photo : friend.photo,
                            status: connect.status
                        })
                    }else if(connect.requested_to == id){
                        let friend = this.data.member.filter(x => x.id == connect.requested_by)[0]
                        this.data.friends.push({
                            id    : friend.id,
                            fname : friend.fname,
                            lname : friend.lname,
                            photo : friend.photo,
                            status: connect.status
                        })
                    }
                });
                resolve();
            })
        })
    },
    read: function () {
        return new Promise((resolve, reject)=>{
            if(this.data){
                resolve(this.data);
            }else{
                this.load().then(()=>{
                    resolve(this.data);
                })
            }
        })
    },
    populate: function () {
        this.read().then(()=>{
            $(".feed-home-friends .container").empty();
            if(path.parts[2] && path.parts[2] == 'my-feed'){
                route(`account/network/${auth.memberData.personal.id}`);
            }
            if(Number(path.parts[2]) == path.parts[2]){
                if(Number(path.parts[2])  == '0'){
                    route('account/network');
                    return false;
                }
                if(path.parts[2] == auth.memberData.personal.id){
                    $(".new-post-block").show();
                }else{
                    $(".new-post-block").hide();
                }
                let member = this.data.member.filter(x => x.id == path.parts[2])[0];
                xhttp.get('anotherMember', {id: member.id}).then((response)=>{
                    response.friends = [];
                    response.connections.forEach((connect)=>{
                        let id = member.id;
                        if(connect.requested_by == id){
                            let friend = network.data.member.filter(x => x.id == connect.requested_to)[0]
                            response.friends.push({
                                id    : friend.id,
                                fname : friend.fname,
                                lname : friend.lname,
                                photo : friend.photo,
                                status: connect.status
                            })
                        }else if(connect.requested_to == id){
                            let friend = network.data.member.filter(x => x.id == connect.requested_by)[0]
                            response.friends.push({
                                id    : friend.id,
                                fname : friend.fname,
                                lname : friend.lname,
                                photo : friend.photo,
                                status: connect.status
                            })
                        }
                    });
                    template_engine(`.home-friends-thumbnail`,response.friends.slice(0,8), "#feed-home-friends");
                    template_engine('.home-photos-thumbnail',response.photos.slice(0,8),".feed-home-photos .container");  
                    $(".feed-home-about h3").text(member.fname + ' ' + member.lname);
                    $(".feed-home-about p:eq(0)").html(member.about);
                    $(".feed-home-about p:eq(1)").html(response.personal.club);
                    $(".feed-home-about p:eq(2)").html(response.professional.position + ', ' + response.professional.organisation_name);
                    $(".feed-home-about p:eq(3)").html(response.professional.description);
                    this.getFeed(member.id);
                    network.currentFriend = response;
                })
            }else{
                $(".new-post-block").show();
                $(".feed-home-about h3").text(auth.memberData.personal.fname + ' ' + auth.memberData.personal.lname);
                $(".feed-home-about p:eq(0)").html(auth.memberData.personal.about);
                $(".feed-home-about p:eq(1)").html(auth.memberData.personal.club);
                $(".feed-home-about p:eq(2)").html(auth.memberData.professional.position + ', ' + auth.memberData.professional.organisation_name);
                $(".feed-home-about p:eq(3)").html(auth.memberData.professional.description);
                template_engine(`.home-friends-thumbnail`,this.data.friends.slice(0,8), "#feed-home-friends");
                template_engine('.home-photos-thumbnail',this.data.photos.slice(0,8),".feed-home-photos .container");
                this.getFeed();
                network.currentFriend = null;
            }
        })
    },
    savePost: function () {
        let error = false;

        let payload= {
            post_body: $("#newPostBody").val() || (error = true, showsnackbar('Please add Pst Body')),
            image    : $("#newPostBody").attr('image') || 'NA'
        }

        xhttp.post('post', payload).then((response)=>{
            if(response.status == "success"){
                showsnackbar('Post added successfully');
                $("#newPostBody").val('')
                template_engine(".old-post-block",
                {...payload, 
                    ...{post_id:response.id,
                        member_id: auth.memberData.personal.id,
                        fname: auth.memberData.personal.fname,lname: auth.memberData.personal.lname,
                        photo: auth.memberData.personal.photo,
                        date: "Just Now"
                    }
                }, 
                '.old-post-archive', {position:"pre"});
                $(".postWithPhoto").hide();
            }else{
                showsnackbar('Something went wrong. Please try again');
                console.log(response);
            }
        })
    },
    getFeed: function (id) {
        xhttp.get('posts', {id: id}).then((response)=>{
            $(".old-post-archive").empty();
            let myposts = 0;
            response.forEach((post)=>{
                post.date = (new Date(Number(post.posted_on*1000))).toString().slice(4,21);
                if(post.member_id == auth.memberData.personal.id){
                    myposts++;
                }
            });
            if(Number(path.parts[2])==path.parts[2]){
                $(".network-header p:eq(0)").html(`${network.currentFriend.connections.length}<span>FRIEND${network.currentFriend.connections.length != 1 ? 'S': ''}</span>`);
            }else{
                $(".network-header p:eq(0)").html(`${this.data.connections.length}<span>FRIEND${this.data.connections.length != 1 ? 'S': ''}</span>`);
            }
            $(".network-header p:eq(1)").html(`${myposts}<span>POST${myposts.length != 1 ? 'S': ''}</span>`)
            template_engine(".old-post-block", response, ".old-post-archive");
        })
    },
    withPhoto: function () {
        $(".postWithPhoto").show();
        $(".postWithPhoto").html(`
            <div class="dropzone dropzone_square smalltools" id="withPostPhotoCrop"
                data-width="1080"
                data-height="720"
                data-url="/service/myAdPhoto"
                style="width: 100%;aspect-ratio:1.5;display:block;margin:auto;">
                    <input type="file" accept=".png, .jpg, .jpeg" name="thumb" />
            </div>`
        );

        $('#withPostPhotoCrop').html5imageupload({
            onAfterProcessImage: function(x) {
                $("#newPostBody").attr('image', ImageUploadedResponse.filename);
            },
            onAfterCancel: function() {
                $('#filename').val('');
                $("#newPostBody").attr('image', null);
            }
        });  
        $(".new-post-block .button:eq(0) p").text('Cancel Photo');
        $(".new-post-block .button:eq(0)").attr('onclick','network.cancelPhoto()');
    },
    cancelPhoto: function () {
        $(".postWithPhoto").hide();
        $(".postWithPhoto").html('');
        $(".new-post-block .button:eq(0) p").text('Add Photo');
        $(".new-post-block .button:eq(0)").attr('onclick','network.withPhoto()');
    }
}