let version = 1;
let old_path = {};
let path = {};
let base_path = "";
let quillEditors = {};
let tempIntervals = [];
let tempDatepickers = [];
let currentimage = '';

$(document).ready(function() {
    $.getJSON(`/src/json/config.json?v=${version}`, function(response) {
        config = response;
        if (window.location.href.toLowerCase().includes('?source=pwa') || window.location.href.toLowerCase().includes('/pwa')) {
            config.ispwa = true;
            base_path = "/pwa";
            $('body').attr('pwa', 'true');
            if (window.location.href.toLowerCase().includes('?source=pwa')) {
                route('home');
            }
        } else {
            $('body').attr('pwa', 'false');
        }
        Promise.allSettled(
            [
                loadelements(),
                IP.get()
            ]).then(startRMB);
    })
})


function loadelements() {
    return new Promise((resolve, reject) => {
        var promises = [];
        components = [];
        var keys = Object.keys(config.components);
        $.each(keys, function(index, component) {
            promises.push($.get(`${config.html_path}${component}.html?v=${version}`, function(response) {
                components[index] = response;
            }));
        });
        $.when.apply($, promises).done(() => {
            $.each(components, function(index) {
                $("loader p").text(config.components[keys[index]][1]);
                $(`${config.components[keys[index]][0]} ${keys[index]}`).append(components[index]);
            });
            resolve();
        });
    });
}

async function startRMB() {
    await auth.checklogin();
    Array.from($('[name="phone"]')).forEach((input)=>{
            window[$(input).attr('data-variable')] = window.intlTelInput($(`#${$(input).attr('id')}`)[0], {
            separateDialCode: true,
            initialCountry: IP.IPData.countryCode || 'auto'
        });
    })
    setInterval(() => {
        checkUrl();
    }, 50);
    setTimeout(() => {
        if (path.params.magiclink) {
            auth.LogInWithMagicLink();
        }
    }, 100);
    setTimeout(() => {
        if (path.pathname == '') {
            route('home');
        }
    }, 500);
    $("#animated-thumbnails-gallery")
        .justifiedGallery({
            captions: false,
            lastRow: "hide",
            rowHeight: 180,
            margins: 5
        })
        .on("jg.complete", function() {
            lightGallery(document.getElementById("animated-thumbnails-gallery"), {
                autoplayFirstVideo: false,
                pager: false,
                galleryId: "nature",
                flipHorizontal: false,
                flipVertical: false,
                rotateLeft: false,
                plugins: [
                    lgZoom,
                    lgThumbnail,
                    lgShare,
                    lgRotate,
                    lgFullscreen,
                    lgAutoplay
                ],
                mobileSettings: {
                    controls: false,
                    showCloseIcon: false,
                    download: false,
                    rotate: false
                }
            });
        });
    $("#animated-thumbnails-gallery1")
        .justifiedGallery({
            captions: false,
            lastRow: "hide",
            rowHeight: 180,
            margins: 5
        })
        .on("jg.complete", function() {
            lightGallery(document.getElementById("animated-thumbnails-gallery1"), {
                autoplayFirstVideo: false,
                pager: false,
                galleryId: "nature",
                flipHorizontal: false,
                flipVertical: false,
                rotateLeft: false,
                plugins: [
                    lgZoom,
                    lgThumbnail,
                    lgShare,
                    lgRotate,
                    lgFullscreen,
                    lgAutoplay
                ],
                mobileSettings: {
                    controls: false,
                    showCloseIcon: false,
                    download: false,
                    rotate: false
                }
            });
        });
}

let auth = {
    login: function() {
        let payload = {
            email: $("#loginEmail").val(),
            password: $("#loginPassword").val()
        }

        if (/\S+@\S+\.\S+/.test(payload.email) && payload.password.length > 5) {
            $(".login_status").text("");
            xhttp.post('auth', payload, {}).then((response) => {
                if (response.status == "success") {
                    $('body').attr('auth', 'true');
                    localStorage.setItem('auth', 'true');
                    auth.getMember(response.user);
                } else {
                    if (response.details == "Wrong passsword") {
                        $(".login_status").text("Wrong Password");
                    } else {
                        $(".login_status").text("No Records Found. Please check your email ID");
                    }
                }
            })
        } else {
            $(".login_status").text("Please Enter Valid Credentials. Password id minimum 6 characters");
        }
    },
    logout: function() {
        $('body').attr('auth', 'false');
        localStorage.setItem('auth', 'false');
        xhttp.delete('auth', {}, {}).then(() => {
            window.location.reload();
        })
    },
    checklogin: function() {
        return new Promise((resolve, reject) => {
            xhttp.get('auth', {}, {}).then((response) => {
                if (response.status == "success") {
                    $('body').attr('auth', 'true');
                    localStorage.setItem('auth', 'true');
                    auth.getMember(response.user);
                    resolve();
                } else {
                    resolve();
                }
            }).catch(() => {
                resolve();
            })
        })
    },
    newPassword: function() {
        $(".newpasswordstatus").text('');

        let payload = {
            password: $("#passwordNew").val(),
            confirmPassword: $("#passwordConfirm").val()
        }
        if (payload.password.length > 5 && payload.password == payload.confirmPassword) {
            $("#passwordNew").val('');
            $("#passwordConfirm").val('');
            $(`[linked-to="security"] p:eq(0)`).html(`&nbsp;`);
            $(`[linked-to="security"] p:eq(1)`).html(`&nbsp;`);

            xhttp.put('auth', payload, {}).then((response) => {
                if (response.status == "success") {
                    showsnackbar('Password Updated Succesfully');
                    setTimeout(() => {
                        $(".newpasswordstatus").text('');
                    }, 1500);
                } else {
                    $(".newpasswordstatus").text('Something went wrong please try again');
                    $(".newpasswordstatus").css('color', 'red');
                }
            })
        } else {
            $(".newpasswordstatus").text('Please check if passwords match. Minimum length is 6');
            $(".newpasswordstatus").css('color', 'red');
        }
    },
    magiclink: function() {
        $(".login_status").text("");
        if (/\S+@\S+\.\S+/.test($("#loginEmail").val())) {
            xhttp.options('auth', { email: $("#loginEmail").val() }, {}).then((response) => {
                if (response.status == "success") {
                    showsnackbar('Email with Reset Link has been sent successfully');
                } else {
                    $(".login_status").text("No Records Found. Please check your email ID");
                    setTimeout(() => {
                        $(".login_status").text("");
                    }, 1500);
                }
            })
        } else {
            $(".login_status").text("Please Enter Valid Email ID");
        }
    },
    LogInWithMagicLink: function() {
        xhttp.patch('auth', { magicLink: path.params.magiclink }, {}).then((response) => {
            if (response.status == "success") {
                $('body').attr('auth', 'true');
                localStorage.setItem('auth', 'true');
                auth.getMember(response.user);
            } else {
                Snackbar.show({
                    pos: 'top-center',
                    showAction: false,
                    text: 'The Link has expired or is broken.',
                    color: red
                });
            }
        })
    },
    getMember: async function(user) {
        return new Promise((resolve, reject) => {
            $('.fname').text(user?.fname);
            $('.lname').text(user?.lname);
            xhttp.get('member', {}, {}).then((response) => {
                auth.memberData = response.data;
                $("#fname_edit").val(response.data.personal.fname);
                $("#lname_edit").val(response.data.personal.lname);
                $('.fname').val(response.data.personal.fname);
                $('.lname').val(response.data.personal.lname);
                if (["male", "female"].includes(response.data.personal.gender)) {
                    $(`#${response.data.personal.gender}`).prop('checked', true);
                    $("#gender").val("");
                    $("#other").addClass('disabled');
                } else {
                    $("#other").prop("checked", true);
                    $("#gender").val(response.data.personal.gender);
                    $("#other").removeClass('disabled');
                }
                $("#clubname_edit").val(response.data.personal.club);
                $("#dateofjoining").val(response.data.personal.dateofjoining);
                $("#dob").val(response.data.personal.dateofbirth);

                $("#organisation_name").val(response.data.professional.organisation_name);
                $("#position").val(response.data.professional.position);
                $("#business_adress").html(response.data.professional.organisation_address);

                if (response.data.contact.filter(x => x.contact_type == "email")[0]) {
                    $("#email1").val(response.data.contact.filter(x => x.contact_type == "email")[0].details);
                }
                if (response.data.contact.filter(x => x.contact_type == "email")[1]) {
                    $("#email2").val(response.data.contact.filter(x => x.contact_type == "email")[1].details);
                }
                if (response.data.contact.filter(x => x.contact_type == "phone")[0]) {
                    window.phone1Edit.setNumber(response.data.contact.filter(x => x.contact_type == "phone")[0].details);
                }
                if (response.data.contact.filter(x => x.contact_type == "phone")[1]) {
                    window.phone2Edit.setNumber(response.data.contact.filter(x => x.contact_type == "phone")[1].details);
                }

                let tempInt = setInterval(() => {
                    if (quillEditors.aboutEditSection?.container && quillEditors.aboutEditSection?.container) {
                        quillEditors.aboutEditSection.container.firstChild.innerHTML = response.data.personal.about || '';
                        quillEditors.aboutBusinessEditSection.container.firstChild.innerHTML = response.data.professional.description || '';
                        clearInterval(tempInt);
                        resolve();
                    }
                }, 500);

                $("#edit_personal_photo").parent().html(`<div class="dropzone_profile dropzone dropzone_square smalltools" id="edit_personal_photo" data-width="1080" data-height="1080" data-url="/service/profile_photo" data-image="" style="max-width:100%;width: 100%;aspect-ratio:1">
                    <input type="file" accept=".png, .jpg, .jpeg" name="thumb" />
                </div>`);
                $("#edit_personal_photo").attr('data-image', '/service/build/' + response.data.personal.photo || '');
                $(".network_photo").attr('src', '/service/build/' + response.data.personal.photo);
                setTimeout(() => {
                    $('#edit_personal_photo').html5imageupload({
                        onAfterProcessImage: function() {
                            auth.getMember();
                            $('.file_name_' + currentimage).val($(this.element).data('name'));
                            if ($(this)[0].element.classList[2] == 'dropzone_myphoto') {
                                Snackbar.show({
                                    pos: 'bottom-center',
                                    showAction: false,
                                    text: 'Successfully updated your photo'
                                });
                            }
                        },
                        onAfterCancel: function() {
                            $('#filename').val('');
                        }
                    });
                }, 500);
                $(".feed-home-about p:eq(0)").html(auth.memberData.personal.about.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/ig, ""))
                $(".feed-home-about p:eq(1)").html(auth.memberData.personal.club.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/ig, ""));
                $(".feed-home-about p:eq(2)").html(auth.memberData.professional.position + ', ' + auth.memberData.professional.organisation_name);
                $(".feed-home-about p:eq(3)").html('');
            })
        })
    },
    getMemberdata: function() {
        return new Promise((resolve, reject) => {
            let data = localStorage.getItem('memberData');

        })
    },
    checkPasswords: function () {
        if(path.parts[1] == "security"){
            if($("#passwordNew").val().length > 3){
                if(RegexCheck.regexes.password.test($("#passwordNew").val())){
                    $(`[linked-to="security"] p:eq(0)`).css('color','green');
                    $(`[linked-to="security"] p:eq(0)`).text('Password Valid and Acceptable');
                    $(`[linked-to="security"] p:eq(1)`).css('color','red');
                    $(`[linked-to="security"] p:eq(1)`).text('Please Re Enter Password');
                    if($("#passwordConfirm").val().length > 3){
                        if($("#passwordConfirm").val() == $("#passwordNew").val()){
                            $(`[linked-to="security"] p:eq(1)`).css('color','green');
                            $(`[linked-to="security"] p:eq(1)`).text('Passwords Match');
                        }else{
                            $(`[linked-to="security"] p:eq(1)`).css('color','red');
                            $(`[linked-to="security"] p:eq(1)`).text('Passwords Do Not Match');
                        }
                    }
                }else{
                    $(`[linked-to="security"] p:eq(0)`).css('color','red');
                    $(`[linked-to="security"] p:eq(0)`).text('Password must be between 6 and 30 characters. Must have atleast one number and 1 special character');
                }
            }
            setTimeout(()=>{
                auth.checkPasswords();
            },500)
        }
    }
}

function checkPersonalDataUpdate() {
    if (!auth.memberData) {
        setTimeout(() => {
            checkPersonalDataUpdate();
        }, 500);
    }
    tempIntervals.push(setInterval(() => {
        let error = false;
        let tempData = $.extend(true, {}, auth.memberData);
        tempData.personal.fname = $("#fname_edit").val();
        tempData.personal.lname = $("#lname_edit").val();
        tempData.personal.gender = $('[name="gender"]:checked').val() == "other" ? ($("#gender").val() || 'non binary') : $('[name="gender"]:checked').val();
        if ($("#other").prop("checked") == true) {
            $("#gender").removeClass('disabled');
        } else {
            $("#gender").addClass('disabled');
        }
        tempData.personal.club = $("#clubname_edit").val();
        tempData.personal.dateofbirth = $("#dob").val();
        tempData.personal.dateofjoining = $("#dateofjoining").val();
        tempData.personal.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;


        if (tempData) {
            tempData.personal.about = quillEditors.aboutEditSection.container.firstChild.innerHTML;
        }

        if (tempData.contact.filter(x => x.contact_type == "email")[0]) {
            tempData.contact.filter(x => x.contact_type == "email")[0].details = $("#email1").val() || "";
        }
        if($("#email2").val()){
            if(RegexCheck.regexes.email.test($("#email2").val())){
                if (tempData.contact.filter(x => x.contact_type == "email")[1]) {
                    tempData.contact.filter(x => x.contact_type == "email")[1].details = $("#email2").val() || "";
                }else{
                    tempData.contact.push({
                        contact_type: "email",
                        details: $("#email2").val(),
                        member_id: auth.memberData.personal.id
                    });
                }
            }else{
                showsnackbar("Please Enter Valid Second Email ID");
            }
        }
        
        if (tempData.contact.filter(x => x.contact_type == "phone")[0] && $("phone1").val()?.length > 5) {
            tempData.contact.filter(x => x.contact_type == "phone")[0].details = $("#phone1").val() ? ('+' + window.phone1Edit.getSelectedCountryData().dialCode + $("#phone1").val()) : "";
        }
        if($("#phone2").val().length > 5){
            if (tempData.contact.filter(x => x.contact_type == "phone")[1]) {
                tempData.contact.filter(x => x.contact_type == "phone")[1].details = ('+' + window.phone2Edit.getSelectedCountryData().dialCode + $("#phone2").val());
            }else{
                tempData.contact.push({
                    contact_type: "phone",
                    details: '+' + window.phone2Edit.getSelectedCountryData().dialCode + $("#phone2").val(),
                    member_id: auth.memberData.personal.id
                })
            }
        }

        tempData.professional.organisation_name = $("#organisation_name").val();
        tempData.professional.organisation_address = $("#business_adress").val();
        tempData.professional.position = $("#position").val();
        tempData.professional.description = quillEditors.aboutBusinessEditSection.container.firstChild.innerHTML;

        if (JSON.stringify(tempData) !== JSON.stringify(auth.memberData)) {
            setTimeout(() => {
                let tempData1 = $.extend(true, {}, auth.memberData);
                tempData1.personal.fname = $("#fname_edit").val();
                tempData1.personal.lname = $("#lname_edit").val();
                tempData1.personal.gender = $('[name="gender"]:checked').val() == "other" ? ($("#gender").val() || 'non binary') : $('[name="gender"]:checked').val();
                tempData1.personal.club = $("#clubname_edit").val();
                tempData1.personal.dateofbirth = $("#dob").val();
                tempData1.personal.dateofjoining = $("#dateofjoining").val();
                tempData1.personal.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                if (tempData1) {
                    tempData1.personal.about = quillEditors.aboutEditSection.container.firstChild.innerHTML;
                }

                if (tempData1.contact.filter(x => x.contact_type == "email")[0]) {
                    tempData1.contact.filter(x => x.contact_type == "email")[0].details = $("#email1").val() || "";
                }
                if($("#email2").val()){
                    if(RegexCheck.regexes.email.test($("#email2").val())){
                        if (tempData1.contact.filter(x => x.contact_type == "email")[1]) {
                            tempData1.contact.filter(x => x.contact_type == "email")[1].details = $("#email2").val() || "";
                        }else{
                            tempData1.contact.push({
                                    contact_type: "email",
                                    details: $("#email2").val(),
                                    member_id: auth.memberData.personal.id
                                });
                        }
                    }
                }
                if (tempData1.contact.filter(x => x.contact_type == "phone")[0]) {
                    tempData1.contact.filter(x => x.contact_type == "phone")[0].details = $("#phone1").val() ? ('+' + window.phone1Edit.getSelectedCountryData().dialCode + $("#phone1").val()) : "";
                }
                if($("#phone2").val()){
                    if (tempData1.contact.filter(x => x.contact_type == "phone")[1]) {
                        tempData1.contact.filter(x => x.contact_type == "phone")[1].details = ('+' + window.phone2Edit.getSelectedCountryData().dialCode + $("#phone2").val());
                    }else{
                        tempData1.contact.push({
                            contact_type: "phone",
                            details: '+' + window.phone2Edit.getSelectedCountryData().dialCode + $("#phone2").val(),
                            member_id: auth.memberData.personal.id
                        })
                    }
                }

                tempData1.professional.organisation_name = $("#organisation_name").val();
                tempData1.professional.organisation_address = $("#business_adress").val();
                tempData1.professional.position = $("#position").val();
                if (tempData1) {
                    tempData1.professional.description = quillEditors.aboutBusinessEditSection.container.firstChild.innerHTML;
                }
                if (JSON.stringify(tempData) == JSON.stringify(tempData1)) {
                    showsnackbar('Your profile has been updated');
                    tempIntervals.forEach((x) => {
                        clearInterval(x);
                    })
                    xhttp.post('member', tempData, {}).then(() => {
                        auth.getMember().then(checkPersonalDataUpdate);
                    })
                }
            }, 5000);
        }
    }, 1000))
}

var member = {
    image: {
        addNew: function () {
            $(".AddEditImage h4").html('&nbsp; Add New Image');
            member.image.currentOrientation = '';  
            $("#addEditImageTitle").val('');
            $("#addEditImageDescription").val('');
            $(".orientationselect label").css('pointer-events','');
            this.currentEditDetails = {};
            this.editOn = false;
        },
        checkCurrent: function () {
            if(this.currentOrientation != $(`[name="newImageAspectRatio"]:checked`).val()){
                this.currentOrientation != $(`[name="newImageAspectRatio"]:checked`).val();
                this.currentOrientation = $(`[name="newImageAspectRatio"]:checked`).val();
                $("#addEditPhotoInput").attr('data-orientation',this.currentOrientation);
                $("#addEditPhotoInput").html(`
                <div class="dropzone_addEditPhotoInput dropzone dropzone_square smalltools" id="addEditPhotoInputDropZone" data-width="${this.aspectRatios[this.currentOrientation].width}" data-height="${this.aspectRatios[this.currentOrientation].height}" data-url="/service/gallery_photo" data-image="" style="max-width:${this.aspectRatios[this.currentOrientation].constrain}%;width: 100%;aspect-ratio:${this.aspectRatios[this.currentOrientation].ratio}">
                        <input type="file" accept=".png, .jpg, .jpeg" name="thumb" />
                    </div>`);
                $('#addEditPhotoInputDropZone').html5imageupload({
                    onAfterProcessImage: function(x) {
                        $("#addEditPhotoInput").attr('data-img',ImageUploadedResponse.filename);
                        member.image.newImageUploaded();
                    },
                    onAfterCancel: function() {
                        $('#filename').val('');
                    }
                });
            }
            setTimeout(() => {
                if(path.parts[1] == "gallery"){
                    this.checkCurrent();
                }
            }, 500);
        },
        edit: function (x) {
            this.editOn = true;
            $(".orientationselect label").css('pointer-events','none');
            this.currentPhotoEdit = member.image.myPhotos.filter(photo => photo.id == x)[0];
            let fraction = $(`[data-img-id="${x}"] img`).width() / $(`[data-img-id="${x}"] img`).height();
            this.currentOrientation = fraction < 1 ? 'potrait' : fraction > 1 ? 'landscape' : 'square';
            $(`#${member.image.currentOrientation}`).prop('checked',true);
            $("#addEditPhotoInput").html(`
                <div class="dropzone_addEditPhotoInput dropzone dropzone_square smalltools" id="addEditPhotoInputDropZone"
                data-width="${this.aspectRatios[this.currentOrientation].width}"
                data-height="${this.aspectRatios[this.currentOrientation].height}"
                data-url="/service/gallery_photo"
                data-image="/assets/membergallery/${this.currentPhotoEdit.photo_name}" style="max-width:${this.aspectRatios[this.currentOrientation].constrain}%;width: 100%;aspect-ratio:${this.aspectRatios[this.currentOrientation].ratio}">
                        <input type="file" accept=".png, .jpg, .jpeg" name="thumb" />
                    </div>`);
            $('#addEditPhotoInputDropZone').html5imageupload({
                onAfterProcessImage: function(x) {
                    $("#addEditPhotoInput").attr('data-img',ImageUploadedResponse.filename);
                    member.image.newImageUploaded();
                },
                onAfterCancel: function() {
                    $('#filename').val('');
                }
            });
            $(".AddEditImage h4").html('&nbsp; Edit Image');
            $("#addEditImageTitle").val(this.currentPhotoEdit.photo_title);
            $("#addEditImageDescription").val(this.currentPhotoEdit.photo_description);
            this.currentEditDetails = {
                id: this.currentPhotoEdit.id,
                photo_title: this.currentPhotoEdit.photo_title,
                photo_description: this.currentPhotoEdit.photo_description,
            }
            this.checkCurrentEdit();
        },
        checkCurrentEdit: function(){
            if(this.currentEditDetails.id){
                let x = {
                    id: this.currentPhotoEdit.id,
                    photo_title: $("#addEditImageTitle").val(),
                    photo_description: $("#addEditImageDescription").val()
                }
                setTimeout(() => {
                    if(JSON.stringify(this.currentEditDetails) != JSON.stringify(x)){
                        setTimeout(() => {
                            let y = {
                                id: this.currentPhotoEdit.id,
                                photo_title: $("#addEditImageTitle").val(),
                                photo_description: $("#addEditImageDescription").val()
                            }
                            if(JSON.stringify(y) == JSON.stringify(x) && JSON.stringify(this.currentEditDetails) != JSON.stringify(x)){
                                this.currentEditDetails = x;
                                xhttp.put('gallery_photo',x,{}).then(()=>{
                                    showsnackbar('Photo data updated');
                                    $(`.single-photo-upload-container[data-img-id="${x.id}"] h5`).text(x.photo_title);
                                    $(`.single-photo-upload-container[data-img-id="${x.id}"] h6`).text(x.photo_description);
                                    member.image.checkCurrentEdit();
                                })
                            }
                        }, 1000);
                    }
                    if(path.parts[1]=="gallery"){
                        this.checkCurrentEdit();
                    }
                }, 1000);
            }else{
                setTimeout(() => {
                    if(path.parts[1]=="gallery"){
                        this.checkCurrentEdit();
                    }
                }, 1000);
            }
        },
        editOn : false,
        newImageUploaded: function () {
            if(member.image.editOn){
                xhttp.put('gallery_photo/change',{
                    old: this.currentPhotoEdit.id,
                    new: ImageUploadedResponse?.image_id
                }).then(()=>{
                    $(`.single-photo-upload-container[data-img-id="${this.currentPhotoEdit.id}"] img`).src(`/assets/membergallery/${ImageUploadedResponse.filename}`);
                })
            }else{
                let temp = {
                    photo_title: $("#addEditImageTitle").val(),
                    photo_description: $("#addEditImageDescription").val()
                }
                member.image.getMyPhotos().then(()=>{
                    member.image.populateMyPhotos().then(()=>{
                        setTimeout(() => {
                            member.image.edit(ImageUploadedResponse?.image_id);
                            setTimeout(() => {
                                $("#addEditImageTitle").val(temp.photo_title);
                                $("#addEditImageDescription").val(temp.photo_description);
                            }, 100);
                        }, 500);
                    })
                })
            }
        },
        getMyPhotos: function () {
            return new Promise((resolve, reject)=>{
                xhttp.get('gallery_photo',{},{}).then((response)=>{
                    member.image.myPhotos = response.photos
                    resolve();
                })
            })  
        },
        populateMyPhotos: async function () {
            return new Promise((resolve, reject)=>{
                if(!member.image.myPhotos){
                    member.image.getMyPhotos().then(member.image.populateMyPhotos);
                    return false;
                }
                $(`[linked-to="gallery"] .single-photo-upload-container`).remove();
                template_engine('.single-photo-upload-container', member.image.myPhotos, ".editGalleryExistingImages").then(()=>{
                    resolve();
                });
            })
        },
        delete: function (id) {
            let _this = this;
            xhttp.delete('gallery_photo',{id: id}).then((response)=>{
                _this.getMyPhotos().then(()=>{
                    _this.populateMyPhotos().then(()=>{
                        _this.addNew();
                    })
                })
            })
        },
        aspectRatios:{
            landscape:{
                ratio: 1.77,
                width:1920,
                height:1080,
                constrain: 80
            },
            potrait:{
                ratio: 0.562,
                width:1080,
                height: 1920,
                constrain: 45
            },
            square:{
                ratio: 1,
                width: 1080,
                height:1080,
                constrain: 80
            }
        },
        currentOrientation: 0
    },
    blogs : {
        get: function () {
            return new Promise((resolve, reject)=>{
                xhttp.get('myBlog',{}).then((response)=>{
                    this.myBlogs = response.blogs;
                    resolve();
                })
            })  
        },
        populate: async function () {
            return new Promise(async(resolve, reject)=>{
                $("account .my-blog-single-card").remove();
                if(!member.blogs.myBlogs){
                    await member.blogs.get().then(()=>{
                        template_engine('.my-blog-single-card',member.blogs.myBlogs, "#my-blog-archive");
                        resolve();
                    })
                }else{
                    template_engine('.my-blog-single-card',member.blogs.myBlogs, "#my-blog-archive");
                    resolve();
                }
            })  
        },
        add: function () {
            let error = false;
            let payload = {
                title: $("#newBlogTitle").val().length > 10 ? $("#newBlogExcerpt").val() : (error = true, showsnackbar('Please add a title of more than 10 characters')),
                excerpt: $("#newBlogExcerpt").val().length > 10 ? $("#newBlogExcerpt").val() : (error = true, showsnackbar('Please add a excerpt of more than 10 characters')),
                readTime: $("#newBlogReadTime").val() ? $("#newBlogReadTime").val() : (error = true, showsnackbar('Please include approximate read time')),
                body: quillEditors.newBlogBody.root.innerHTML.slice(3).slice(0,-4) || (error = true,showsnackbar('Please enter valid body for the blog')),
                banner: member.blogs.currentBanner || (showsnackbar('Please include a banner imager'), error = true),
                thumbnail: member.blogs.currentThumbnail || (showsnackbar('Please include a thumbnail imager'), error = true)
            }
            if(!error){
                xhttp.post('myBlog', payload).then((response)=>{
                    $('.new_blog_banner .btn-del')[0].click();
                    $('.new_blog_thumb .btn-del')[0].click();
                    $("#newBlogReadTime").val('');
                    $("#newBlogExcerpt").val('');
                    $("#newBlogExcerpt").val('');
                    route('account/blogs');
                    member.blogs.get().then(()=>{
                        member.blogs.populate();
                    })
                })
            }
        },
        update: function () {
            let error = false;
            let payload = {
                id: path.parts[3],
                title: $("#updateBlogTitle").val().length > 10 ? $("#updateBlogTitle").val() : (error = true, showsnackbar('Please add a title of more than 10 characters')),
                excerpt: $("#updateBlogExcerpt").val().length > 10 ? $("#updateBlogExcerpt").val() : (error = true, showsnackbar('Please add a excerpt of more than 10 characters')),
                readTime: $("#updateBlogReadTime").val() ? $("#updateBlogReadTime").val() : (error = true, showsnackbar('Please include approximate read time')),
                body: quillEditors.updateBlogBody.root.innerHTML.slice(3).slice(0,-4) || (error = true,showsnackbar('Please enter valid body for the blog')),
                banner: member.blogs.currentBanner || (showsnackbar('Please include a banner imager'), error = true),
                thumbnail: member.blogs.currentThumbnail || (showsnackbar('Please include a thumbnail imager'), error = true)
            }
            if(!error){
                xhttp.put('myBlog', payload).then((response)=>{
                    $("#updateBlogTitle").val('');
                    $("#updateBlogExcerpt").val('');
                    $("#updateBlogReadTime").val('');
                    route('account/blogs');
                    member.blogs.get().then(()=>{
                        member.blogs.populate();
                    })
                })
            }
        },
        startEdit: async function () {
            if(!member.blogs.myBlogs){
                member.blogs.get().then(()=>{
                    member.blogs.startEdit();
                })
                return false;
            }
            let currentBlog = member.blogs.myBlogs.filter(x => x.id == path.parts[3])[0];
            if(!currentBlog){
                route('account/blogs');
                return false;
            }
            if (!quillEditors.updateBlogBody) {
                quillEditors.updateBlogBody = new Quill('.edit-blog-body-editor', {
                    theme: 'snow',
                    modules: {
                        'toolbar': [
                            [{ 'size': [] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'script': 'super' }, { 'script': 'sub' }],
                            ['blockquote', 'code-block'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                            ['direction', { 'align': [] }],
                            ['link', 'image'],
                            ['clean']
                        ]
                    }
                })
            }else{
                /* quillEditors.updateBlogBody.container.firstChild.innerHTML = ; */
            }
            
            
            $("#update_blog_banner_container").html(`<h5>Primary Image</h5><div class="update_blog_banner dropzone dropzone_square smalltools" data-width="1080" data-height="720" data-url="/service/blogimage"
            data-image="/assets/blogImages/${currentBlog.banner}" style="width: 100%;aspect-ratio:1.77">
                <input type="file" accept=".png, .jpg, .jpeg" name="thumb" />
            </div>`);
            $("#update_blog_thumb_container").html(`<h5>Thumbnail</h5><div class="update_blog_thumb dropzone dropzone_square smalltools" data-width="1080" data-height="1080" data-url="/service/blogimage"
            data-image="/assets/blogImages/${currentBlog.thumbnail}" style="width: 100%;aspect-ratio:1">
                <input type="file" accept=".png, .jpg, .jpeg" name="thumb" />
            </div>`);
            $('.update_blog_banner').html5imageupload({
                onAfterProcessImage: function() {
                        member.blogs.currentBanner = ImageUploadedResponse?.filename;
                    
                },
                onAfterCancel: function() {
                    $('#filename').val('');
                }
            });
            $('.update_blog_thumb').html5imageupload({
                onAfterProcessImage: function() {
                    
                        member.blogs.currentThumbnail = ImageUploadedResponse?.filename;
                    
                },
                onAfterCancel: function() {
                    $('#filename').val('');
                }
            });
            member.blogs.currentBanner = currentBlog.banner;
            member.blogs.currentThumbnail  = currentBlog.thumbnail;
            $("#updateBlogTitle").val(currentBlog.title);
            $("#updateBlogExcerpt").val(currentBlog.excerpt);
            $("#updateBlogReadTime").val(currentBlog.readtime);
            quillEditors.updateBlogBody.container.firstChild.innerHTML = currentBlog.blog_text;
        }
    }
}

var QuilltoolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }], // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }], // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }], // outdent/indent
    [{ 'direction': 'rtl' }], // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }], // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }], // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean'] // remove formatting button
];

function togglePasswordField() {
    if($('[data-type="password"]').attr('type') == "password"){
        Array.from($('[data-type="password"]')).forEach((x)=>{
            $(x).parent().addClass('passwordvisible');
            $(x).attr('type','text');
        })
    }else{
        Array.from($('[data-type="password"]')).forEach((x)=>{
            $(x).parent().removeClass('passwordvisible');
            $(x).attr('type','password');
        })
    }
}

/* ///////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
///////////////////////////////ME FUNCTIONS///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// */

function checkUrl() {
    if (window.location.href.toLowerCase() == path.href) {
        return false;
    }
    parseURL().then(() => {
        tempIntervals.forEach((x) => {
                clearInterval(x);
            })
            /* tempDatepickers.forEach((x)=>{
                x.destroy();
            }) */
        $('menu').removeClass('active')
        if (path.parts[0] == "account" && path.parts[1]) {
            $('.left-menu-single-item').removeClass('active');
            $(`.left-menu-single-item[linked-to="${path.parts[1]}"]`).addClass('active');
            $(`.right-menu-single-item:not([linked-to="${path.parts[1]}"])`).slideUp();
            $(`.right-menu-single-item[linked-to="${path.parts[1]}"]`).slideDown();
           if (path.parts[1] == "personal") {
                if (!quillEditors.aboutEditSection) {
                    quillEditors.aboutEditSection = new Quill('.about-edit-section', {
                        theme: 'snow'
                    });
                }
                if (!quillEditors.aboutBusinessEditSection) {
                    quillEditors.aboutBusinessEditSection = new Quill('.business-details-edit-section', {
                        theme: 'snow'
                    });
                }
                auth.getMember();
                setTimeout(() => {
                    checkPersonalDataUpdate();
                }, 1000);
                tempDatepickers.push($("#dateofjoining").bootstrapMaterialDatePicker({
                    format: 'DD MMMM YYYY',
                    time: false,
                }));
                tempDatepickers.push($("#dob").bootstrapMaterialDatePicker({
                    format: 'DD MMMM YYYY',
                    time: false
                }));
            }else if (path.parts[1] == "security") {
                auth.checkPasswords();
            } else if (path.parts[1] == "blogs") {
                if (!path.parts[2]) {
                    member.blogs.populate();
                } else if (path.parts[2] == "add") {
                    if (!quillEditors.newBlogBody) {
                        quillEditors.newBlogBody = new Quill('.new-blog-body-editor', {
                            theme: 'snow',
                            modules: {
                                'toolbar': [
                                    [{ 'size': [] }],
                                    ['bold', 'italic', 'underline', 'strike'],
                                    [{ 'color': [] }, { 'background': [] }],
                                    [{ 'script': 'super' }, { 'script': 'sub' }],
                                    ['blockquote', 'code-block'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                                    ['direction', { 'align': [] }],
                                    ['link', 'image'],
                                    ['clean']
                                ]
                            }
                        })
                    }
                    $('.new_blog_banner').html5imageupload({
                        onAfterProcessImage: function() {
                            member.blogs.currentBanner = ImageUploadedResponse?.filename;
                            if ($(this)[0].element.classList[2] == 'dropzone_myphoto') {
                                Snackbar.show({
                                    pos: 'bottom-center',
                                    showAction: false,
                                    text: 'Successfully updated your photo'
                                });
                            }
                        },
                        onAfterCancel: function() {
                            $('#filename').val('');
                        }
                    });
                    $('.new_blog_thumb').html5imageupload({
                        onAfterProcessImage: function() {
                            member.blogs.currentThumbnail = ImageUploadedResponse?.filename;
                            if ($(this)[0].element.classList[2] == 'dropzone_myphoto') {
                                Snackbar.show({
                                    pos: 'bottom-center',
                                    showAction: false,
                                    text: 'Successfully updated your photo'
                                });
                            }
                        },
                        onAfterCancel: function() {
                            $('#filename').val('');
                        }
                    });
                } else if(path.parts[2]){
                    member.blogs.startEdit();
                }
            }else if (path.parts[1] == "gallery") {
                $('#addEditPhotoInputDropZone').html5imageupload({
                    onAfterProcessImage: function() {
                        
                    },
                    onAfterCancel: function() {
                        $('#filename').val('');
                    }
                });
                member.image.populateMyPhotos();
                member.image.checkCurrent();
            }
        }
    })
}

function route(x, y) {
    /* Object.keys(path.params).forEach((key)=>{
        if(!(window.location.pathname.toLowerCase().includes(key))){
            delete path.params[key];
        }
    }) */
    if (x.length && !y) {
        x = x.replace('&undefined', '');
        if (window.location.href.split(window.location.origin)[1].slice(1).replace('pwa/', '') !== x) {
            config.ispwa ? history.pushState(null, null, `/pwa/` + x) : history.pushState(null, null, `/` + x);
        }
    } else if (y) {
        var temp = window.location.href.split(window.location.origin)[1].slice(1);
        if (x.length) {
            if (temp.split('?')[1]) {
                temp = x + '?' + temp.split('?')[1];
            } else {
                temp = x;
            }
        }
        if (typeof y == "object") {
            y = [y];
        }
        y.forEach((a, index) => {
                    if (Object.keys(path.params).includes(Object.keys(a)[0])) {
                        route(`${temp.split(`${Object.keys(a)[0]}=`)[0]}${Object.keys(a)[0]}=${Object.values(a)[0]}&${temp.split(`${Object.keys(a)[0]}=`)[1].split('&')[1]}`);
            } else {
                route(`${temp}${temp.includes('?') ? '&':'?'}${Object.keys(a)[0]}=${Object.values(a)[0]}`);
            }
        })
    }
}

function parseURL() {
    return new Promise((resolve, reject) => {
        if(path){
            Object.assign(old_path,path);
        }
        path.params = {};
        path.parts = {};
        $.each(window.location.search.toLowerCase().slice(1).split('&'), function(index) {
            if (this.includes('=') && this.split('=')[0] && this.split('=')[1]) {
                path.params[this.split('=')[0]] = this.split('=')[1];
            }
        })
        $.each(window.location.pathname.toLowerCase().slice(base_path.length+1).split('/'), function(index) {
            path.parts[`path_part_${index}`] = this.toString();
            $('body').attr(`path_part_${index}`, this.toString());
        })
        $.each($('body')[0].attributes, function(index) {
            if (this.specified && this.name.indexOf('path_part_') == 0) {
                path.parts[this.name] ? $('body').attr(this.name, path.parts[this.name]) : $('body').removeAttr(this.name);
            }
        })
        $('body').attr('curr_page', JSON.stringify(window.location.pathname.toLowerCase().slice(base_path.length+1).split('/')));
        path.pathname = window.location.pathname.toLowerCase().slice(1);
        path.href = window.location.href.toLowerCase();
        path.parts = Object.values(path.parts);
        /* tracker.urlPathChanged(); */
        //gtag_update     //DO NOT REMOVE
        resolve();
    })
}

let ajax = function(type, data, endpoint, callback) {
    if (type.toString().toLowerCase() == 'get') {
        $.ajax({
            url: config.serviceurl + endpoint,
            data: data,
            type: "GET",
            datatype: "application/json",
            headers: {
                type: "application/json"
            },
            success: function(response) {
                if (response.status == "success") {
                    callback(response.payload);
                }
            }
        })
    } else {
        $.ajax({
            url: config.serviceurl + endpoint,
            type: type,
            datatype: "application/json",
            data: JSON.stringify(data),
            headers: {
                type: "application/json"
            },
            success: function(response) {
                if (response.status == "success") {
                    if (response.status == "success") {
                        callback(response.payload);
                    }
                }
            }
        })
    }
}

async function http_call(type,data,endpoint) {
    return new Promise((resolve,reject)=>{
        $.ajax({
            url: config.serviceurl + endpoint,
            data: type.toString().toLowerCase() == 'get' ? data : JSON.stringify(data),
            type: type,
            datatype: "application/json",
            headers: {
                type: "application/json"
            },
            success:function(response){
                resolve(response.payload);
            },
            error:((xhr, status, error)=>{
                console.log(xhr, status, error);
                reject(xhr, status, error);
            })
        })
    })
}

xhttp =  {
    default: function(type,data,endpoint,options){
        return new Promise((resolve,reject)=>{
            $.ajax({
                url: endpoint.startsWith('http')? endpoint:  config.serviceurl + endpoint,
                data: type.toString().toLowerCase() == 'get' ? data : JSON.stringify(data),
                type: type,
                datatype: "application/json",
                headers: {
                    type: "application/json"
                },
                success:function(response){
                    if(response.status == "success"){
                        resolve(response.payload);
                    }else{
                        reject({status:"200 OK",ResponseData: response});
                    }
                },
                error:((xhr, status, error)=>{
                    reject({status: xhr?.status, message: xhr?.responseJSON?.response});
                })
            })
        })
    },
    ...Object.assign(
        ...['get','post','put','delete','head','patch', 'options'].map(k => ({ [k]: 
        async function(endpoint, data, options){
            return this.default(k, data, endpoint, options);
        }
     })))
}

function ajax_promise(type,data,endpoint) {
    return $.ajax({
        url: config.serviceurl + endpoint,
        data: type.toString().toLowerCase() == 'get' ? data : JSON.stringify(data),
        type: type,
        datatype: "application/json",
        headers: {
            type: "application/json"
        }
    })
}

let template_engine = function(identifier, replacements, callback) {
    return new Promise((resolve,reject)=>{
        let divTag = '';
        if(!Array.isArray(replacements)){
            replacements = [replacements];
        }
        $.each(replacements,function (index,replacement) {
            let template;
            if(/<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/.test(identifier)){
                template = identifier;
            }else {
                template = $(`templates ${identifier}`).parent().html()?.toString();
            }

            if(!template){
                reject('Check Identifier');
            }
            for (const property in replacement) {
                template = template.replace(new RegExp('{{' + property + '}}', 'g'), replacement[property]);
            }
            if(template.includes('{{index}}')){
                template = template.replace(new RegExp('{{index}}', 'g'), index);
            }
            divTag += template;
        })
        callback ? /function\(|[\)\*\{\}]/.test(callback.toString()) ? callback(divTag) : $(callback).length ? $(callback).append(divTag) : console.log("html element doesn't exist") : console.log("Parameter missing");
        resolve(divTag);
    })
}

let payload_gen = function(selectors, callback) {
    let payload = {};
    let error = false;
    for (const [key, value] of Object.entries(selectors)) {
        values = value.split(';');
        if($(values[0]).length){
            switch($(values[0]).attr('type')){
                case 'text':
                    payload[key] = values[1] !== '*' || $(values[0]).val().length ? $(values[0]).val() : (error = true, (value[2] ? showsnackbar(values[2]):null));
                    break;
                case 'email':
                    $(values[0]).val($(values[0]).val().replace(/ /g,''));
                    payload[key] = values[1] !== '*' ||  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/.test($(values[0]).val()) ? $(values[0]).val() : (error = true, (value[2] ? showsnackbar(values[2]):null));
                    break;
                case 'number':
                    payload[key] = values[1] !== '*' || $(values[0]).val().length ? $(values[0]).val().replace(/ /g,'') : (error = true,values[2] ? showsnackbar(values[2]):null);
                    break;
                case 'password':
                    var regexpass = /^[A-Za-z0-9]\w{0,30}$/;
                    if(values[1] && values[1].indexOf("#")!==-1 && $(values[1]).attr('type')=="password"){
                        payload[key] = values[1]!== '*' || regexpass.test($(values[0]).val()) ? ($(values[0]).val() == $(values[1]).val() ? $(values[0]).val() : (error = true, showsnackbar('Passwords do not match'))) : (error = true, showsnackbar('Please Enter password'));
                    }else{
                        payload[key] = values[1]!== '*' || regexpass.test($(values[0]).val()) ? $(values[0]).val() : (error = true, (value[2] ? showsnackbar(values[2]):null));
                    }
                    break;
            }
         }else{
            console.log(`Element ${values} not found`);
         }
    }
    if (callback) {
        error ? callback(false) : callback(payload);
    }
}

function showsnackbar(x) {
    console.log(x);
    if($(window).width()>900){
        Snackbar.show({
            pos: 'top-center',
            showAction: false,
            text: x
        });
    }else{
        Snackbar.show({
            pos: 'top-center',
            showAction: false,
            text: x
        });
    }
}

const zeroPad = (num, places) => String(num).padStart(places, '0');

var Detect = {
    init: function() {
        this.OS = this.searchString(this.dataOS);
    },
    searchString: function(data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1)
                    return data[i].identity;
            } else if (dataProp)
                return data[i].identity;
        }
    },
    dataOS: [{
            string: navigator.userAgent,
            subString: 'iPhone',
            identity: 'iOS'
        },
        {
            string: navigator.userAgent,
            subString: 'iPad',
            identity: 'iOS'
        },
        {
            string: navigator.userAgent,
            subString: 'iPod',
            identity: 'iOS'
        },
        {
            string: navigator.userAgent,
            subString: 'Android',
            identity: 'Android'
        },
        {
            string: navigator.platform,
            subString: 'Linux',
            identity: 'Linux'
        },
        {
            string: navigator.platform,
            subString: 'Win',
            identity: 'Windows'
        },
        {
            string: navigator.platform,
            subString: 'Mac',
            identity: 'macOS'
        }
    ]
};

mandatory = () => {
    return new Promise(function(resolve, reject) {
        throw new Error('Missing parameter!');
        resolve();
    })
}

var IP = {
    get: function () {
        return new Promise((resolve, reject)=>{
            if(this.IPData){
                resolve(this.IPData);
            }else{
                this.fetch().then(()=>{
                    resolve(this.IPData)
                });
            }
        })
    },
    fetch: function () {
        return new Promise((resolve, reject)=>{
            $.ajax({
                url: "http://ip-api.com/json",
                type: 'GET',
                success: function(json)
                {
                    IP.IPData = json;
                    resolve();
                },
                error: function(err)
                {
                  console.log("Request failed, error= " + err);
                }
              });
        })   
    }
}

RegexCheck = {
    default : function (type, value, options) {
        return this.regexes[type].test(value);
    },
    ...Object.assign(
        ...['email','phone','password'].map(k => ({ [k]: 
        async function(value, options){
            return this.default(k, value, options);
        }
     }))),
     regexes:{
         email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/,
         password: /^(?=.*[0-9])(?=.*[!@#$%^&*-])[a-zA-Z0-9!@#$%^&*-]{6,30}$/
     }
}