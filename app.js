var express = require("express");
var app = express();
var port = 8080;


app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', "jade");
	app.engine('jade', require('jade').__express);
	app.use(express.logger('dev'));
	app.use(express.static(__dirname + "/public"));
});


app.get("/", function(req, res){
	res.render("index");
});
 

var io = require("socket.io").listen(app.listen(port));
console.log("Listening on port " + port);

io.sockets.on("connection", function(socket){
	//send message to socket on successful connection
	socket.emit("message", {message: "Welcome to the chat"});
	socket.on("send", function(data){
		//forward data to all other sockets with sockets.emit
		io.sockets.emit("message",data); 
	});
	
	// Start listening for mouse move events
	socket.on('mousemove', function (data) {
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});
});
