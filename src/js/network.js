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
    }
}