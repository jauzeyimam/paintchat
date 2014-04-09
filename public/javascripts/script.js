// var socket = io.connect();
var canvas;
var width;
var height;

function addMessage(msg, pseudo) {
    $("#chatEntries").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
    var s = document.getElementById('chatmessages').scrollHeight;
    $('#chatmessages').scrollTop(s);
}

function sentMessage() {
    // console.log("sending message");
    if ($('#messageInput').val() != "") {
        io.emit('message', $('#messageInput').val());
        addMessage($('#messageInput').val(), "Me", new Date().toISOString(), true);
        $('#messageInput').val('');
    }
}

//not used anymore
/*function setPseudo(name) {
    // console.log("setting pseudo");
    if ($("#pseudoInput").val() != "")
    {
        io.emit('setPseudo', $("#pseudoInput").val());
        $('#chatControls').show();
        $('#pseudoInput').hide();
        $('#pseudoSet').hide();
    }
}*/

function setInformation() {
    //Temporarily commented out to make editing home page less annoying :P
    var name = $('#pseudo').val();
    var room = $('#roomname').val();

    if (name != "" && room != "") {
        io.emit('setPseudo', name);
        $('#chatControls').show();
        $('#pseudoInput').hide();
        $('#pseudoSet').hide();
        io.emit('setRoom', room);
        $('#loginarea').hide();
        $('#paintchatroom').show();
        paper.view.viewSize = [width,height];
        canvas.offsetWidth = width;
        canvas.offsetHeight = height;
    }
    else {
        alert("Please enter all information!");
    }
}
// io.on('connect', function() {
//     //Temporarily commented out to make editing home page less annoying :P 
//     // io.emit('setPseudo', prompt("Name?"));
//     $('#chatControls').show();
//     $('#pseudoInput').hide();
//     $('#pseudoSet').hide();
//     // io.emit('setRoom', prompt("Room?"));
// });

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

    $("#messageInput").keyup(function(e) {
        if (e.keyCode == 13) {
            sentMessage();
        }
    });
    $("#chatControls").hide();
    $("#pseudoSet").click(function() {
        setPseudo()
    });
    $("#submit").click(function() {
        sentMessage();
    });
});
