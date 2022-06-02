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
            if(this.currentMember.membership_status == "2" || this.currentMember.membership_status == "3"){
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
                $("#stat1title").val(this.Storage.statistics[0].name);
                $("#stat1").val(this.Storage.statistics[0].number);
                $("#stat2title").val(this.Storage.statistics[1].name);
                $("#stat2").val(this.Storage.statistics[1].number);
                $("#stat3title").val(this.Storage.statistics[2].name);
                $("#stat3").val(this.Storage.statistics[2].number);
                $("#stat4title").val(this.Storage.statistics[3].name);
                $("#stat4").val(this.Storage.statistics[3].number);
            })
            admin.about.read().then(()=>{
                let x = admin.about.Storage;
                $("#landingViewtext").val(x.filter((y)=> y.title == 'landing-view-text')[0].text);
                $("#legendtext").val(x.filter((y)=> y.title == 'legend-text')[0].text);
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
                Promise.all([this.load(),admin.about.load()]).then(()=>{
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