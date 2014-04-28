var canvas;
var width;
var height;

function addMessage(msg, pseudo) {
    $("#chatEntries").append('<div class="message"><p>' + pseudo + '<b>:</b> ' + msg + '</p></div>');
    var s = document.getElementById('chatmessages').scrollHeight;
    $('#chatmessages').scrollTop(s);
}

function sentMessage() {
    var message = $('#messageInput').val();
    var safeMessage = sanitizeMessage(message);
    // console.log(safeMessage);

    if (safeMessage.length > 0 && safeMessage.length < 141) {
        io.emit('message', safeMessage);
        addMessage(safeMessage, "<b>Me</b>", new Date().toISOString(), true);
        $('#messageInput').val('');
    } else {
        // console.log("Unsafe input.");
    }
}

function sanitizeMessage(msg) {
    var whitelist = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-=`~!@#$%^*()+[]{}\\|:;?/,.&<>\"'/ ";
    var danger = "&<>\"'/";
    msg = msg.replace(/&/g, "&amp;");
    msg = msg.replace(/</g, "&lt;");
    msg = msg.replace(/>/g, "&gt;");
    msg = msg.replace(/"/g, "&quot;");
    msg = msg.replace(/'/g, "&#x27;");
    msg = msg.replace(/\//g, "&#x2F;");

    for (var i = 0; i < msg.length; i++) {
        var c = msg.charAt(i);
        if (whitelist.indexOf(c) == -1) { //c is not in whitelist
            msg = msg.replace(c, "?");
        }
    }

    return msg;
}

function setInformation() {
    //Temporarily commented out to make editing home page less annoying :P
    var name = $('#pseudo').val();
    var room = $('#roomname').val();
    var pass = sanitizeLogin(name) && sanitizeLogin(room);
    // console.log(pass + " | pseudo: " + name + " room: " + room);

    if (pass) {
        io.emit('setPseudo', name);
        $('#chatControls').show();
        $('#pseudoInput').hide();
        $('#pseudoSet').hide();
        io.emit('setRoom', room);
        $('#loginarea').hide();
        $('#paintchatroom').show();
        //canvas.offsetWidth = width;
        //canvas.offsetHeight = height;
        io.emit('connectLogin');
        paper.view.viewSize = [width, height];
        updateChatArea(room, name);
    } else {
        alert("Invalid psuedo or roomname. \n\n-only letters and numbers\n-no blank fields\n-no fields longer than 15 characters\n-use underscore for spaces");
        // console.log("Invalid psuedo or roomname. \n\n-only letters and numbers\n-no blank fields\n-no fields longer than 15 characters\n-use underscore for spaces");
    }
}

function changeRoom() {
    // console.log("changing room");
    var oldName = $('#pseudo').val();
    document.cookie = "username=" + oldName;
    window.location = "/";
}

function changePseudoModal() {
    var oldName = $('#pseudo').val();
    var newName = $('#pseudomodal').val();
    var room = $('#roomnamedisplay').text();
    var pass = sanitizeLogin(oldName) && sanitizeLogin(newName);
    if (pass) {
        $('#pseudo').val(newName);
        // console.log("changePseudoModal: ", document.activeElement);
        io.emit('changePseudo', newName, oldName);
        updateChatArea(room, newName);
    } else if (oldName == "") {
        alert("You do not have a name to change! Choose a name through the login screen first.");
    } else {
        alert("Invalid name\n\n-only letters and numbers\n-no blank fields\n-no fields longer than 15 characters\n-use underscore for spaces");
    }
}

function updateChatArea(room, name) {
    // console.log("updateChatArea: " + room + ", " + name);
    $('#roomnamedisplay').text(room);
    $('#pseudonamedisplay').text(name);
}

function sanitizeLogin(str) {
    var whitelist = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
    if (str.length == 0 || str.length > 15)
        return false;
    for (var i = 0; i < str.length; i++) {
        if (whitelist.indexOf(str.charAt(i)) == -1) {
            return false;
        }
    }
    return true;
}

io.on('message', function(data) {
    // console.log("message added");
    addMessage(data['message'], data['pseudo']);
});

function updateFocus(id) {
    // console.log("Update focus", id);
    document.getElementById(id).focus();
}

function getUsernameCookie() {
    var cUsername = document.cookie;
    // console.log("cUsername = " + cUsername);
    var username = cUsername.split('=');
    username = username[1];
    $('#pseudo').val(username);
    // console.log("username::" + username);
    if (username == "" || typeof username === 'undefined') {
        // console.log("True");
        document.getElementById("pseudo").focus();
    } else {
        // console.log("False");
        document.getElementById("roomname").focus();
    }
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

$(document).ready(function() {
    // console.log("Document is ready.");
    canvas = document.getElementById("draw");
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    $('#paintchatroom').hide();
    $('#loginarea').show();

    getUsernameCookie();
    deleteAllCookies();



    // Begin: Listen for Enter being pushed
    $("#messageInput").keyup(function(e) {
        if (e.keyCode == 13) {
            sentMessage();
        }
    });
    $("#pseudomodal").keypress(function(e) {
        if (e.keyCode == 13) {
            // console.log(e);
            // alert("You pushed enter. Pushing enter here does bad things. Please don't push enter until we fix this bug, which has actually become somewhat of a difficult task.");
            changePseudoModal();
            $('#changepseudomodal').modal('hide');
            e.preventDefault();
            e.stopPropagation();
        }
    });
    $("#pseudo").keypress(function(e) {
        if (e.keyCode == 13) {
            setInformation();
            e.preventDefault();
            e.stopPropagation();
        }
    });
    $("#roomname").keyup(function(e) {
        if (e.keyCode == 13) {
            setInformation();
        }
    });
    // End: Listen for Enter being pushed
    $("#chatControls").hide();
    $("#pseudoSet").click(function() {
        setPseudo()
    });
    $("#submit").click(function() {
        sentMessage();
    });
});