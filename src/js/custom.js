let version = 1;
let old_path = {};
let path = {};
let base_path = "";
let quillEditors = {};


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
        loadelements().then(startRMB);
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
            xhttp.put('auth', payload, {}).then((response) => {
                if (response.status == "success") {
                    $(".newpasswordstatus").text('Password updated successfully');
                    $(".newpasswordstatus").css('color', '#999');
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
        $('.fname').text(user.fname);
        $('.lname').text(user.lname);
        xhttp.get('member', {}, {}).then((response) => {
            $("#fname_edit").val(response.data.personal.fname);
            $("#lname_edit").val(response.data.personal.lname);
            $("#gender_edit").val(response.data.personal.gender);
            $("#clubname_edit").val(response.data.personal.club);
            $("#yearsinrotary").val(response.data.personal.yearsinrotary);

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
                $("#phone1").val(response.data.contact.filter(x => x.contact_type == "phone")[0].details);
            }
            if (response.data.contact.filter(x => x.contact_type == "phone")[1]) {
                $("#phone2").val(response.data.contact.filter(x => x.contact_type == "phone")[0].details);
            }

            quillEditors.aboutEditSection.container.firstChild.innerHTML = response.data.personal.about;
            quillEditors.aboutEditSection.container.firstChild.innerHTML = response.data.personal.about;
        })
    },
    getMemberdata: function() {
        return new Promise((resolve, reject) => {
            let data = localStorage.getItem('memberData');

        })
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
        $('menu').removeClass('active')
        if (path.parts[0] == "account" && path.parts[1]) {
            $('.left-menu-single-item').removeClass('active');
            $(`.left-menu-single-item[linked-to="${path.parts[1]}"]`).addClass('active');
            $(`.right-menu-single-item:not([linked-to="${path.parts[1]}"])`).slideUp();
            $(`.right-menu-single-item[linked-to="${path.parts[1]}"]`).slideDown();
            if (path.parts[1] == "gallery") {
                setTimeout(() => {
                    $('.dropzone_1').html5imageupload({
                        onAfterProcessImage: function() {
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
                    $('.dropzone_2').html5imageupload({
                        onAfterProcessImage: function() {
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
                }, 1000);
            } else if (path.parts[1] == "personal") {
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
                setTimeout(() => {
                    $('.dropzone_profile').html5imageupload({
                        onAfterProcessImage: function() {
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
            } else if (path.parts[1] == "blogs") {
                if (!path.parts[2]) {

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
                    $('.new_blog_thumb').html5imageupload({
                        onAfterProcessImage: function() {
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
                } else {
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
                        quillEditors.updateBlogBody.container.firstChild.innerHTML = $(".single-complete-blog-body:eq(0)").html();
                    }
                    $('.update_blog_banner').html5imageupload({
                        onAfterProcessImage: function() {
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
                    $('.update_blog_thumb').html5imageupload({
                        onAfterProcessImage: function() {
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
                }
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
                url: config.serviceurl + endpoint,
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