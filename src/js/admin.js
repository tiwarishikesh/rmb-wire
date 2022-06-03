var admin= {
    load: function(){
        xhttp.get('admin',{}).then((response)=>{
            this.data = response.data;
            $("#myMembersTable tbody").empty();
            response.data.members.forEach((x)=>{
                if(x.id == auth.memberData.personal.id){
                    return false;
                }
                $("#myMembersTable tbody").append(`<tr style="border-bottom:1px solid black;"><td>${x.id} &nbsp; ${x.photo ? `<img src="/service/build/${x.photo}"} style="width:50px;">`:''}</td>
                <td>${x.fname} ${x.lname}</td>
                <td style="text-transform:capitalize">${x.role}</td>
                <td>${config.membership_status[x.membership_status]}</td>
                <td><div class="button bordered-button small glassy" style="margin-top:0" onclick="admin.member.view(${x.id})"><p>EDIT</p></td>
                </tr>`);
            })
            $("#myMembersTable").DataTable();
            setTimeout(() => {
                $('select[name="myMembersTable_length"]').select2();
            }, 500);
        })
    },
    member: {
        view: function (x) {
            let member = admin.data.members.filter(m => m.id == x)[0];
            
            $('[name="adminMemberStatus"]').prop('checked',false);
            $(".view-member .name").text(`${member.fname} ${member.lname}`);
            this.currentMember = member;
            if(this.currentMember.membership_status == "2" || this.currentMember.membership_status == "3"){
                $("#editMemberPaid").prop('checked',true);
            }else {
                $("#editMemberPaid").prop('checked',false);
            }
            if(this.currentMember.membership_status == "1" || this.currentMember.membership_status == "2"){
                $("#editMemberApproved").prop('checked',true);
            }else{
                $("#editMemberApproved").prop('checked',false);
            }
            $(`#${this.currentMember.role}`).prop("checked",true);
            $(".view-member").css('opacity',1);

            xhttp.get('admin/member',{id: member.id}).then((response)=>{
                $("#admin_fname_edit").val(response.data.personal.fname);
                $("#admin_lname_edit").val(response.data.personal.lname);
                
                if (["male", "female"].includes(response.data.personal.gender)) {
                    $(`#admin${response.data.personal.gender}`).prop('checked', true);
                    $("#admingender").val("");
                    $("#adminother").addClass('disabled');
                } else {
                    $("#adminother").prop("checked", true);
                    $("#admingender").val(response.data.personal.gender);
                    $("#adminother").removeClass('disabled');
                }
                $("#admin_clubname_edit").val(response.data.personal.club);
                $("#admin_dateofjoining").val(response.data.personal.dateofjoining);
                $("#admin_dob").val(response.data.personal.dateofbirth);

                $("#admin_organisation_name").val(response.data.professional.organisation_name);
                $("#admin_position").val(response.data.professional.position);
                $("#admin_business_adress").html(response.data.professional.organisation_address);

                if (response.data.contact.filter(x => x.contact_type == "email")[0]) {
                    $("#admin_email1").val(response.data.contact.filter(x => x.contact_type == "email")[0].details);
                }
                if (response.data.contact.filter(x => x.contact_type == "email")[1]) {
                    $("#admin_email2").val(response.data.contact.filter(x => x.contact_type == "email")[1].details);
                }
                if (response.data.contact.filter(x => x.contact_type == "phone")[0]) {
                    window.admin_phone1Edit.setNumber(response.data.contact.filter(x => x.contact_type == "phone")[0].details);
                }
                if (response.data.contact.filter(x => x.contact_type == "phone")[1]) {
                    window.admin_phone2Edit.setNumber(response.data.contact.filter(x => x.contact_type == "phone")[1].details);
                }

                quillEditors.AdminAboutSection.container.firstChild.innerHTML = response.data.personal.about || '';
                quillEditors.adminAboutBusinessSection.container.firstChild.innerHTML = response.data.professional.description || '';
            })
        },
        save: function () {
            let payload = {
                id: this.currentMember.id,
                role: $('[name="memberRoles"]:checked').val()
            }

            if(!$("#editMemberApproved").is(":checked") && !$("#editMemberPaid").is(":checked")){
                if(this.currentMember.membership_status != 0){
                    payload.membership_status = 4;
                }else{
                    payload.membership_status = 0;
                }
            }else if($("#editMemberApproved").is(":checked") && !$("#editMemberPaid").is(":checked")){
                payload.membership_status = 1;
            }else if($("#editMemberApproved").is(":checked") && $("#editMemberPaid").is(":checked")){
                payload.membership_status = 2;
            }else if(!$("#editMemberApproved").is(":checked") && $("#editMemberPaid").is(":checked")){
                payload.membership_status = 3;
            }

            let error = false;
            payload.personal = {};
            payload.personal.fname = $("#admin_fname_edit").val();
            payload.personal.lname = $("#admin_lname_edit").val();
            payload.personal.gender = $('[name="admingender"]:checked').val() == "other" ? ($("#gender").val() || 'non binary') : $('[name="admingender"]:checked').val();
            if ($("#adminother").prop("checked") == true) {
                $("#admingender").removeClass('disabled');
            } else {
                $("#admingender").addClass('disabled');
            }
            payload.personal.club = $("#admin_clubname_edit").val();
            payload.personal.dateofbirth = $("#admin_dob").val();
            payload.personal.dateofjoining = $("#admin_dateofjoining").val();
            payload.personal.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            payload.personal.about = quillEditors.AdminAboutSection.container.firstChild.innerHTML || 'NA';

            payload.contact = [];
            payload.contact.push({
                contact_type: "email",
                details: $("#admin_email1").val(),
                member_id: member.id
            });
            if($("#admin_email2").val()){
                if(RegexCheck.regexes.email.test($("#admin_email2").val())){
                    if (payload.contact.filter(x => x.contact_type == "email")[1]) {
                        payload.contact.filter(x => x.contact_type == "email")[1].details = $("#admin_email2").val() || "";
                    }else{
                        payload.contact.push({
                            contact_type: "email",
                            details: $("#admin_email2").val(),
                            member_id: auth.memberData.personal.id
                        });
                    }
                }else{
                    showsnackbar("Please Enter Valid Second Email ID");
                }
            }
            
            payload.contact.push({
                contact_type: "phone",
                details: '+' + window.admin_phone1Edit.getSelectedCountryData().dialCode + $("#admin_phone1").val(),
                member_id: member.id
            })
            
            if($("#phone2").val().length > 5){
                if (payload.contact.filter(x => x.contact_type == "phone")[1]) {
                    payload.contact.filter(x => x.contact_type == "phone")[1].details = ('+' + window.phone2Edit.getSelectedCountryData().dialCode + $("#admin_phone2").val());
                }else{
                    payload.contact.push({
                        contact_type: "phone",
                        details: '+' + window.admin_phone2Edit.getSelectedCountryData().dialCode + $("#admin_phone2").val(),
                        member_id: member.id
                    })
                }
            }

            payload.professional = {};
            payload.professional.organisation_name = $("#admin_organisation_name").val();
            payload.professional.organisation_address = $("#admin_business_adress").val();
            payload.professional.position = $("#admin_position").val();
            payload.professional.description = quillEditors.adminAboutBusinessSection.container.firstChild.innerHTML || 'NA';

            xhttp.post('admin/member', payload).then(()=>{
                admin.load();
                $(".view-member").css('opacity',0);
            })
        },
        cancelEdit: function(){
            this.currentMember = {};
            $(".view-member").css('opacity',0);
            $(".view-member").css('pointer-events: none',1);
        }
    },
    legal: {
        load: function () {
            return new Promise((resolve, reject)=>{
                xhttp.get('website/legal').then((response)=>{
                    this.Storage = response;
                    resolve();
                })
            });
        },
        selectionChanged: function () {
            this.read().then(()=>{
                let currentEdit = this.Storage.filter((x)=> x.title == $("#edit-legal-section").val())[0];
                quillEditors.legalSection.container.firstChild.innerHTML = currentEdit.text;
            })
        },
        read: function () {
            return new Promise((resolve, reject)=>{
                if(this.Storage){
                    resolve();
                }else{
                    this.load().then(()=>{
                        resolve();
                    })
                }
            })
        },
        save: function () {
            xhttp.post('website/legal',{
                title: $("#edit-legal-section").val(),
                text: quillEditors.legalSection.container.firstChild.innerHTML || 'NA'
            }).then((response)=>{
                showsnackbar(`${$('#edit-legal-section').select2('data')[0]?.text} Updated successfully`);
                this.load().then(this.selectionChanged);
            })
        }
    },
    about: {
        load: function () {
            return new Promise((resolve, reject)=>{
                xhttp.get('website/legal').then((response)=>{
                    this.Storage = response;
                    resolve();
                })
            });
        },
        selectionChanged: function () {
            this.read().then(()=>{
                let currentEdit = this.Storage.filter((x)=> x.title == $("#edit-about-section").val())[0];
                quillEditors.aboutSection.container.firstChild.innerHTML = currentEdit.text;
            })
        },
        read: function () {
            return new Promise((resolve, reject)=>{
                if(this.Storage){
                    resolve();
                }else{
                    this.load().then(()=>{
                        resolve();
                    })
                }
            })
        },
        save: function () {
            xhttp.post('website/legal',{
                title: $("#edit-about-section").val(),
                text: quillEditors.aboutSection.container.firstChild.innerHTML || 'NA'
            }).then((response)=>{
                showsnackbar(`${$('#edit-about-section').select2('data')[0]?.text} Updated successfully`);
                this.load().then(this.selectionChanged);
            })
        }
    },
    home: {
        load: function () {
            return new Promise((resolve, reject)=>{
                xhttp.get('website/home').then((response)=>{
                    this.Storage = response;
                    resolve();
                })
            });
        },
        read: function () {
            return new Promise((resolve, reject)=>{
                if(this.Storage){
                    resolve();
                }else{
                    this.load().then(()=>{
                        resolve();
                    })
                }
            })
        },
        populate: function () {
            this.read().then(()=>{
                $(".home_banner_archive .admin-home-single-image").remove();
                $("#stat1title").val(this.Storage.statistics[0].name);
                $("#stat1").val(this.Storage.statistics[0].number);
                $("#stat2title").val(this.Storage.statistics[1].name);
                $("#stat2").val(this.Storage.statistics[1].number);
                $("#stat3title").val(this.Storage.statistics[2].name);
                $("#stat3").val(this.Storage.statistics[2].number);
                $("#stat4title").val(this.Storage.statistics[3].name);
                $("#stat4").val(this.Storage.statistics[3].number);
                template_engine('.admin-home-single-image', this.Storage.banners, ".home_banner_archive");
            })
            admin.about.read().then(()=>{
                let x = admin.about.Storage;
                $("#landingViewtext").val(x.filter((y)=> y.title == 'landing-view-text')[0].text);
                $("#legendtext").val(x.filter((y)=> y.title == 'legend-text')[0].text);
            })
            this.addNewBanner();
        },
        addNewBanner:function () {
            $(".website-landing-new").html(`
                <div class="dropzone dropzone_square smalltools" id="newLandingPhoto"
                    data-width="512"
                    data-height="512"
                    data-url="/service/bannerPhoto"
                    style="max-width:300px;width: 100%;aspect-ratio:1;display:block;margin:auto;">
                        <input type="file" accept=".png, .jpg, .jpeg" name="thumb" />
                </div>`
            );
            /* data-image="/assets/membergallery/${this.currentPhotoEdit.photo_name}" */
            $('#newLandingPhoto').html5imageupload({
                onAfterProcessImage: function(x) {
                    Promise.all([admin.home.load(),admin.about.load()]).then(()=>{
                        admin.home.populate();
                    })
                },
                onAfterCancel: function() {
                    $('#filename').val('');
                }
            });  
            this.filename = null;
        },
        delete: function (id) {
            xhttp.delete('bannerPhoto',{id: id}).then(()=>{
                Promise.all([admin.home.load(),admin.about.load()]).then(()=>{
                    admin.home.populate();
                })
            })
        },
        save: function () {
            let payload = {
                landingViewText : $("#landingViewtext").val() || 'NA',
                legendText: $("#legendtext").val() || 'NA',
                stats : [
                    {
                        title: $("#stat1title").val(),
                        stat: $("#stat1").val()
                    },
                    {
                        title: $("#stat2title").val(),
                        stat: $("#stat2").val()
                    },
                    {
                        title: $("#stat3title").val(),
                        stat: $("#stat3").val()
                    },
                    {
                        title: $("#stat4title").val(),
                        stat: $("#stat4").val()
                    }
                ]
            };
            xhttp.post('website/home',payload).then(()=>{
                showsnackbar('Data has been updated');
                Promise.all([this.load(),admin.about.load()]).then(()=>{
                    this.populate();
                })

            })
        }
    },
    events:{
        load: function () {
            return new Promise((resolve, reject)=>{
                xhttp.get('admin/events').then((response)=>{
                    this.Storage = response;
                    this.Storage.forEach((x)=>{
                        x.verboseStatus = x.status == '0' ? `<span style="color:gray">UNDER REVIEW</span>` : x.status == '1' ? `<span style="color:green">APPROVED</span>` : x.status == '2' ? `<span style="color:red">REJECTED</span>`: null;
                        x.details = JSON.parse(x.details);
                        x.date = (new Date(Number(x.event_datetime))).toString().slice(8, 11) + ' ' + (new Date(Number(x.event_datetime))).toLocaleString('default', { month: 'long' }) + ' '+(new Date(Number(x.event_datetime))).toString().slice(11, 15);
                        x.time = (new Date(Number(x.event_datetime))).toString().slice(16, 21);
                        if(x.event_type == "online"){
                            x.venue = "Link: " + x.details.link;
                            x.venue_details = "Password: "+x.details.password;
                        }else{
                            x.venue = x.details.venue_name + '<br>' + x.details.venue_address;
                            x.venue_details = "Map : <a href='"+x.details.venue_link+"'>"+ x.details.venue_link+"</a>";
                        }
                    })
                    resolve();
                })
            })
        },
        read: function () {
            return new Promise((resolve, reject)=>{
                if(this.Storage){
                    resolve(this.Storage);
                }else{
                    this.load().then(()=>{
                        resolve(this.Storage);
                    })
                }
            })
        },
        populate: function(){
            $(".admin_event_approve_section").hide();
            this.read().then(()=>{
                $('[linked-to="admin-events"] .admin-single-event').remove();
                template_engine('.admin-single-event', this.Storage,'.admin-events-archive');
            })
        },
        toggleOnlineOffline: function () {
            setTimeout(() => {
                if($("#admin_event_online").is(":checked")){
                    $("#admin_event_details_online").slideDown();
                    $("#admin_event_details_offline").slideUp();
                }else{
                    $("#admin_event_details_online").slideUp();
                    $("#admin_event_details_offline").slideDown();
                }
            }, 100);
        },
        edit: function(id){
            let x = this.Storage.filter((x) => x.id == id)[0];
            if(!x){
                return false;
            }
            $(".admin_event_approve_section").show();
            $(`[linked-to="admin-events"]`).data('current',x.id);
            $(`[linked-to="admin-events"] .side-panel-upper h4:eq(0)`).text('Edit Event');

            $("#admin_event_name").val(x.event_title);
            $("#admin_event_description").val(x.event_description);
            $("#admin_event_online").prop('checked',x.event_type=="online");
            $("#admin_event_approve").prop('checked', x.event_status == "2" || x.event_status == "1");
            if(x.event_type=="online"){
                $("#admin_event_link").val(x.details.link);
                $("#admin_event_password").val(x.details.password);
            }else{
                $("#admin_event_venue").val(x.details.venue_name);
                $("#admin_event_address").val(x.details.venue_address);
                $("#admin_event_map_link").val(x.details.venue_link);
            }
            $("#admin_event_date").val(x.date +' - '+x.time);
            this.toggleOnlineOffline();
        },
        cancelEdit: function(){
            $(`[linked-to="admin-events"] .side-panel-upper h4:eq(0)`).text('Add New');
            $(`[linked-to="admin-events"]`).data('current',null);
            $(`[linked-to="admin-events"] .side-panel-upper input`).val('');
            $(`[linked-to="admin-events"] .side-panel-upper textarea`).val('');
            $(".admin_event_approve_section").hide();
        },
        save: function () {
            let error = false;
            let payload = {
                id: $(`[linked-to="admin-events"]`).data('current') || "NA",
                title: $("#admin_event_name").val() || (showsnackbar('Please specify Event Title'), error = true),
                description: $("#admin_event_description").val() || (showsnackbar('Please specify Event Title'), error = true),
                datetime: $("#admin_event_date").val() ? (new Date($("#add_event_date").val())).getTime() : (showsnackbar('Please specify a date and time'), error = true),
                type: $("#admin_event_online").is(":checked") ? 'online': 'offline',
                approval: $("#admin_event_approve").is(":checked") ? 'yes' : 'no'
            };
            if($("#admin_event_online").is(":checked")){
                payload.details = {
                    link: $("#admin_event_link").val() || (showsnackbar('Please include event link'), error = true),
                    password: $("#admin_event_password").val() || "NA"
                }
            }else{
                payload.details = {
                    venue_name: $("#admin_event_venue").val() || (showsnackbar('Please include Venue name'), error=true),
                    venue_address: $("#admin_event_address").val() || (showsnackbar('Please include Venue adress'), error=true),
                    venue_link: $("#admin_event_map_link").val() || (showsnackbar('Please include Venue map link'), error=true),
                }
            }
            if(error){
                return false;
            }
            xhttp.post('admin/events',payload).then(()=>{
                showsnackbar('Event Added Successfully');
                $(`[linked-to="admin-events"] .side-panel-upper h4:eq(0)`).text('Add New');
                $(`[linked-to="admin-events"]`).data('current',null);
                $(`[linked-to="admin-events"] .side-panel-upper input`).val('');
                $(`[linked-to="admin-events"] .side-panel-upper textarea`).val('');
                $(".admin_event_approve_section").hide();
                this.load().then(()=>{
                    this.populate();
                })
            })
        },
        delete: function (id) {
            xhttp.delete('myEvent',{id: id}).then(()=>{
                showsnackbar('Event deleted successfully');
                this.load().then(()=>{
                    this.populate();
                })
            })
        }
    }
}


let member_states = {
    0: 'unpaid, unaaproved',
    1: 'unpaid, approved',
    2: 'paid, approved',
    3: 'paid, unapproved'
}