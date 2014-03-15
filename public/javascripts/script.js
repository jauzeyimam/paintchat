// var socket = io.connect();
function addMessage(msg, pseudo) {
    $("#chatEntries").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
}
function sentMessage() {
    // console.log("sending message");
    if ($('#messageInput').val() != "")
    {
        io.emit('message', $('#messageInput').val());
        addMessage($('#messageInput').val(), "Me", new Date().toISOString(), true);
        $('#messageInput').val('');
    }
}
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

io.on('connect', function(){
    io.emit('setPseudo', prompt("Name?"));
    $('#chatControls').show();
    $('#pseudoInput').hide();
    $('#pseudoSet').hide();
    io.emit('setRoom', prompt("Room?"));
});


io.on('message', function(data) {
    // console.log("message added");
    addMessage(data['message'], data['pseudo']);
});
$(function() {
    // console.log("intializing...");
    $("#chatControls").hide();
    $("#pseudoSet").click(function() {setPseudo()});
    $("#submit").click(function() {sentMessage();});
});
