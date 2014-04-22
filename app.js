/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
console.log("Users" + user.list);
// I think there is a better way to do this
// app.get('/homepagetest', routes.homepagetest);
app.get("/homepagetest", function(req, res) {
    res.render("homepagetest")
});

var server = http.createServer(app).listen(app.get('port'));
var io = require('socket.io').listen(server, function() {
    console.log("Express server listening on port " + app.get('port'));
});

// A user connects to the server (opens a socket)
io.sockets.on('connection', function(socket) {

    socket.on('disconnect', function() {
        var data = {
            'message': socket.username + " disconnected",
            pseudo: "Server"
        }
        socket.broadcast.to(socket.room).emit('message', data);
    });

    /*********Login Functions**********/
    socket.on('setPseudo', function(data) {
        socket.set('pseudo', data);
        socket.username = data;
        console.log('Pseudo: ', data);
        var message = {
            'message': "Your pseudo is " + data,
            pseudo: "Server"
        };
        socket.emit('message', message);
    });
    socket.on('setRoom', function(room) {
        socket.room = room;
        socket.join(room);
        var data = {
            'message': "Joined room " + room,
            pseudo: "Server"
        };
        socket.emit('message', data);
        var data = {
            'message': socket.username + " joined " + socket.room,
            pseudo: "Server"
        };
        socket.broadcast.to(socket.room).emit('message', data);
    });

    /*********Chat Functions**********/
    socket.on('message', function(message) {
        socket.get('pseudo', function(error, name) {
            var data = {
                'message': message,
                pseudo: name
            };
            socket.broadcast.to(socket.room).emit('message', data);
            console.log("user " + name + " send this : " + message);
        })
    });
    /******Draw Functions********/
    socket.on('endPath', function(data, session) {
        // console.log("session " + session + " completed path:");
        socket.broadcast.to(socket.room).emit('endPath', data);
    })
    socket.on('addPoint', function(data, session) {
        //console.log("session " + session + " added:");
        // console.log (data);
        socket.broadcast.to(socket.room).emit('addPoint', data);
    })
    socket.on('drawPath', function(data, session) {
        //console.log("session " + session + " drew:");
        //console.log(data);
        socket.broadcast.to(socket.room).emit('drawPath', data);
    })
    socket.on('typeText', function(data, session) {
        //console.log("session " + session + " drew:");
        //console.log(data);
        socket.broadcast.to(socket.room).emit('typeText', data);
    })
    socket.on('removePath', function(data, session) {
        socket.broadcast.to(socket.room).emit('removePath', data);
    })
    socket.on('selectPath', function(data, session) {
        socket.broadcast.to(socket.room).emit('selectPath', data);
    })
});