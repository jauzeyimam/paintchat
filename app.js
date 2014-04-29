/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var colors = require('colors');
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
// console.log("Users" + user.list);
// I think there is a better way to do this
// app.get('/homepagetest', routes.homepagetest);
app.get("/aboutus", function(req, res) {
    res.render("aboutus.jade");
});

var server = http.createServer(app).listen(app.get('port'));
var io = require('socket.io').listen(server, function() {
    // console.log("Express server listening on port " + app.get('port'));
});

var canvasActivity = {};
var canvasActive = 0;

for (var k in canvasActivity) {
    if (canvasActivity[k] == 1 || canvasActive == 1) {
        canvasActive = 1;
    }
}

var project;

// A user connects to the server (opens a socket)
io.sockets.on('connection', function(socket) {

    socket.on('connectLogin', function() {
        var clients = io.sockets.clients(socket.room);
        // console.log("Client 1 " + clients[0]);
        // console.log("Connect Login!".blue);
        if (socket.room != null && socket.username != null && clients.length > 1) {
            // console.log("passed check 1");
            // console.log("Clients".red + clients[0].id + ", " + clients[clients.length - 1].id);
            io.sockets.socket(clients[0].id).emit('getProject', socket.id);
        }
    });

    socket.on('updateProject', function(data) {
        io.sockets.socket(data.session).emit('setProject', data);
        // console.log("Project layer!".red + data.project);
        // console.log("Set Project");
    });

    socket.on('disconnect', function() {
        var data = {
            'message': socket.username + " disconnected",
            pseudo: "<b>Server</b>"
        }
        if (socket.room != null) {
            socket.broadcast.to(socket.room).emit('message', data);
            socket.broadcast.to(socket.room).emit('disconnectedUser', socket.id);
        }
    });

    /*********Login Functions**********/
    socket.on('setPseudo', function(data) {
        var oldname = data;
        socket.set('pseudo', data);
        socket.username = data;
        // console.log('Pseudo: ', data);
        var message = {
            'message': "Your username is " + data,
            pseudo: "<b>Server</b>"
        };
        socket.emit('message', message);
    });
    socket.on('setRoom', function(room) {
        socket.room = room;
        socket.join(room);
        var data = {
            'message': "Joined room " + room,
            pseudo: "<b>Server</b>"
        };
        socket.emit('message', data);
        var data = {
            'message': socket.username + " joined " + socket.room,
            pseudo: "<b>Server</b>"
        };
        socket.broadcast.to(socket.room).emit('message', data);
    });
    socket.on('changePseudo', function(newName, oldName) {
        var oldname = newName;
        socket.set('pseudo', newName);
        socket.username = newName;
        var message = {
            'message': "Your username is now " + newName + ".",
            pseudo: "<b>Server</b>"
        };
        socket.emit('message', message);
        message = {
            'message': oldName + " changed name to " + newName + ".",
            pseudo: "<b>Server</b>"
        };
        socket.broadcast.to(socket.room).emit('message', message);
    });

    /*********Chat Functions**********/
    socket.on('message', function(message) {
        if (message == "&#x2F;help") {
            var helpMessage = "After selecting:<br>User arrow keys or click and drag to move<br>Press 'c' to change line color<br>Press 'f' to toggle fill<br>Press 't' to increase thickness<br>Press 'Shift+T' to decrease thickness<br>Press 'd' to duplicate<br>Press 'Shift+D' or 'Backspace' or 'delete' to delete.<br>Press 'Shift+<' to bring to front<br>Press 'Shift+>' to send to back<br>Press ',' to move forward<br>Press '.' to move backward";
            var data = {
                'message': helpMessage,
                pseudo: "<b>Server</b>"
            }
            socket.emit('message', data);
        } else {
            var data = {
                'message': message,
                pseudo: "<b>" + socket.username + "</b>"
            };
            socket.broadcast.to(socket.room).emit('message', data);
        }
    });
    /******Draw Functions********/
    socket.on('endPath', function(data, session) {
        console.log("session " + session + " completed path:");
        socket.broadcast.to(socket.room).emit('endPath', data);
        //canvasActivity[socket.user] = 0;
    })
    socket.on('addPoint', function(data, session) {
        console.log("session " + session + " added:");
        console.log(data);
        socket.broadcast.to(socket.room).emit('addPoint', data);
        // canvasActivity[socket.user] = 1;
    })
    socket.on('drawPath', function(data, session) {
        console.log("session " + session + " drew:");
        console.log(data);
        socket.broadcast.to(socket.room).emit('drawPath', data);
        // canvasActivity[socket.user] = 1;
    })
    socket.on('typeText', function(data, session) {
        console.log("session " + session + " drew:");
        console.log(data);
        socket.broadcast.to(socket.room).emit('typeText', data);
        // canvasActivity[socket.user] = 1;
    })
    socket.on('removePath', function(data, session) {
        socket.broadcast.to(socket.room).emit('removePath', data);
    })
    socket.on('selectPath', function(data, session) {
        socket.broadcast.to(socket.room).emit('selectPath', data);
    })
    socket.on('deselectPath', function(data, session) {
        socket.broadcast.to(socket.room).emit('deselectPath', data);
    })
    socket.on('changeLayer', function(data, session) {
        socket.broadcast.to(socket.room).emit('changeLayer', data);
    })
});