var canvas;
var width;
var height;

function addMessage(msg, pseudo) {
    $("#chatEntries").append('<div class="message"><p>' + pseudo + ': ' + msg + '</p></div>');
    var s = document.getElementById('chatmessages').scrollHeight;
    $('#chatmessages').scrollTop(s);
}

function sentMessage() {
    var message = $('#messageInput').val();
    var safeMessage = sanitizeMessage(message);
    console.log(safeMessage);

    if (safeMessage.length > 0 && safeMessage.length < 141) {
        io.emit('message', safeMessage);
        addMessage(safeMessage, "Me", new Date().toISOString(), true);
        $('#messageInput').val('');
    } else {
        console.log("Unsafe input.");
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
    console.log(pass + " | pseudo: " + name + " room: " + room);

    if (pass) {
        io.emit('setPseudo', name);
        $('#chatControls').show();
        $('#pseudoInput').hide();
        $('#pseudoSet').hide();
        io.emit('setRoom', room);
        $('#loginarea').hide();
        $('#paintchatroom').show();
        paper.view.viewSize = [width, height];
        canvas.offsetWidth = width;
        canvas.offsetHeight = height;
        updateChatArea(room, name);
    } else {
        alert("Invalid psuedo or roomname. \n\n-only letters and numbers\n-no blank fields\n-no fields longer than 15 characters\n-use underscore for spaces");
        console.log("Invalid psuedo or roomname. \n\n-only letters and numbers\n-no blank fields\n-no fields longer than 15 characters\n-use underscore for spaces");
    }
}

function updateChatArea(room, name) {
    console.log("updateChatArea: " + room + ", " + name);
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

$(document).ready(function() {
    canvas = document.getElementById("draw");
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    $('#paintchatroom').hide();

    $('#loginarea').show();
    // Begin: Listen for Enter being pushed
    $("#messageInput").keyup(function(e) {
        if (e.keyCode == 13) {
            sentMessage();
        }
    });
    $("#pseudo").keyup(function(e) {
        if (e.keyCode == 13) {
            setInformation();
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