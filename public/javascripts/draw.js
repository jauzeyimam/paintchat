/**Javascript file conrolling drawing on canvas**/
console.log(io.socket.sessionid);

var canvas = document.getElementById("draw"); // Canvas element
paper.view.viewSize = [canvas.offsetWidth, canvas.offsetHeight]; //Makes the input area same size as the canvas

/**Path Variables***/
var myPath = null; //Current path being drawn by this user
var otherPath = new Path(); //Used for drawing paths from other users
var startPoint; //Starting point of a path - used to draw lines
var lastPaths = {}; //Map for every other users last path drawn
var myColor = "";
/***Drawing Tools****/
var freeDraw = new Tool();
var lineDraw = new Tool();
var circleDraw = new Tool();
var rectangleDraw = new Tool();
var ellipseDraw = new Tool();
var starDraw = new Tool();
var textType = new Tool();
var selectionTool = new Tool();

/********Free Draw Functions**********/
function activateFreeDraw() {
    clearSelection();
    freeDraw.activate();
}
freeDraw.onMouseDown = function(event) {
    myPath = new Path();
    myPath.strokeColor = new Color($('#hexVal').val());
    view.draw(); //DOES THIS CAUSE LAG?
}
freeDraw.onMouseDrag = function(event) {
    if (myPath != null) {
        emitRemovePath();
        myPath.add(event.point);
        if (myPath.pathData != null) {
            emitPath(myPath);
        }
        view.draw();
    }
}
freeDraw.onMouseUp = function(event) {
    emitEndPath();
    myPath = null;
}

/**********Line Draw Functions*********/
function activateLineDraw() {
    clearSelection();
    lineDraw.activate();
}

lineDraw.onMouseDown = function(event) {
    myPath = new Path.Line();
    myPath.from = event.point;
    startPoint = event.point;
    myPath.strokeColor = new Color($('#hexVal').val());
    emitPath(myPath);
    view.draw();
}
lineDraw.onMouseDrag = function(event) {

    if (myPath != null) {
        var color = myPath.strokeColor;
        emitRemovePath();
        myPath.remove();
        myPath = new Path.Line(startPoint, event.point);
        myPath.strokeColor = color;
        emitPath(myPath);
        view.draw();
    }
}
lineDraw.onMouseUp = function(event) {
    emitEndPath();
    myPath = null;
}

/**********Circle Draw Functions*********/
function activateCircleDraw() {
    clearSelection();
    circleDraw.activate();
}

circleDraw.onMouseDown = function(event) {
    myPath = new Path.Circle(event.point, 0);
    startPoint = event.point;
    myPath.strokeColor = new Color($('#hexVal').val());
    emitPath(myPath);
    view.draw();
}
circleDraw.onMouseDrag = function(event) {

    if (myPath != null) {
        var color = myPath.strokeColor;
        emitRemovePath();
        myPath.remove();
        myPath = new Path.Circle(event.point, startPoint.getDistance(event.point));
        myPath.strokeColor = color;
        emitPath(myPath);
        view.draw();
    }
}
circleDraw.onMouseUp = function(event) {
    emitEndPath();
    myPath = null;
}

/**********Rectangle Draw Functions*********/
function activateRectangleDraw() {
    clearSelection();
    rectangleDraw.activate();
}

rectangleDraw.onMouseDown = function(event) {
    myPath = new Path.Rectangle(event.point, event.point);
    startPoint = event.point;
    myPath.strokeColor = new Color($('#hexVal').val());
    emitPath(myPath);
    view.draw();
}
rectangleDraw.onMouseDrag = function(event) {

    if (myPath != null) {
        var color = myPath.strokeColor;
        emitRemovePath();
        myPath.remove();
        myPath = new Path.Rectangle(startPoint, event.point);
        myPath.strokeColor = color;
        emitPath(myPath);
        view.draw();
    }
}
rectangleDraw.onMouseUp = function(event) {
    emitEndPath();
    myPath = null;
}

/**********Ellipse Draw Functions*********/
function activateEllipseDraw() {
    clearSelection();
    ellipseDraw.activate();
}

ellipseDraw.onMouseDown = function(event) {
    myPath = new Path.Ellipse(new Rectangle(event.point, event.point));
    startPoint = event.point;
    myPath.strokeColor = new Color($('#hexVal').val());
    emitPath(myPath);
    view.draw();
}
ellipseDraw.onMouseDrag = function(event) {

    if (myPath != null) {
        var color = myPath.strokeColor;
        emitRemovePath();
        myPath.remove();
        myPath = new Path.Ellipse(new Rectangle(startPoint, event.point));
        myPath.strokeColor = color;
        emitPath(myPath);
        view.draw();
    }
}

ellipseDraw.onMouseUp = function(event) {
    emitEndPath();
    myPath = null;
}
/**********Star Draw Functions*********/
function activateStarDraw() {
    clearSelection();
    starDraw.activate();
}

starDraw.onMouseDown = function(event) {
    myPath = new Path.Star(event.point, 5, 0, 0);
    startPoint = event.point;
    myPath.strokeColor = new Color($('#hexVal').val());
    emitPath(myPath);
    view.draw();
}
starDraw.onMouseDrag = function(event) {
    if (myPath != null) {
        var color = myPath.strokeColor;
        emitRemovePath();
        myPath.remove();
        radius = startPoint.getDistance(event.point)
        myPath = new Path.Star(startPoint, 5, radius, radius / 2);
        myPath.strokeColor = color;
        emitPath(myPath);
        view.draw();
    }
}

starDraw.onMouseUp = function(event) {
    emitEndPath();
    myPath = null;
}

/**********Text Type Functions*********/
function activateTextType() {
    clearSelection();
    textType.activate();
}
textType.onMouseDown = function(event) {
    myPath = new PointText({
        point: event.point,
        fontSize: 12,
        fillColor: new Color($('#hexVal').val()),
        content: 'Release Mouse to type here\nPress escape to stop typing'
    });
    view.draw();
}
textType.onMouseDrag = function(event) {
    myPath.point = event.point;
}
textType.onMouseUp = function(event) {
    myPath.content = '';
    emitText(myPath);
}
textType.onKeyDown = function(event) {
    if (myPath != null && document.activeElement != document.getElementById("messageInput")) {
        emitRemovePath();
        if (event.key == 'escape') {
            myPath = null;
        } else if (event.key == 'space') {
            myPath.content = myPath.content + ' ';
        } else if (event.key == 'enter') {
            myPath.content = myPath.content + '\n';
        } else if (event.key == 'backspace') {
            myPath.content = myPath.content.substring(0, myPath.content.length - 1);
        } else if (event.key.length > 1) {
            //don't show control, alt, home, end etc.
        } else {
            if (event.modifiers.shift) {
                var c = event.key.toUpperCase();
                myPath.content = myPath.content + c;
            } else {
                myPath.content = myPath.content + event.key;
            }
        }
        myPath.fillColor = new Color($('#hexVal').val());
        emitText(myPath);
    }
    view.draw();
}
/**********Selection Tool Functions*********/
var hitOptions = {
    // segments: true,
    stroke: true,
    // fill: true,
    tolerance: 5
};

function activateSelectionTool() {
    selectionTool.activate();
}
selectionTool.onMouseDown = function(event) {
    var hitResult = project.hitTest(event.point, hitOptions);
    if (hitResult != myPath && myPath != null && myPath.selected) {
        // emitSelectPath(myPath.firstSegment.point);
        myPath.selected = false;
        emitSelectPath(myPath.firstSegment.point);
        myPath = null;
    }
    if (hitResult != null) {
        var notSelected = true;
        for (key in lastPaths) {
            if (hitResult.item == lastPaths[key])
                notSelected = false;
        }
        if (notSelected) {
            myPath = hitResult.item;
            myPath.selected = true;
            emitSelectPath(hitResult.point);
        }
    }
}
selectionTool.onMouseDrag = function(event) {
    if (myPath != null && myPath.selected) {
        myPath.position += event.delta;
        emitRemovePath();
        emitPath(myPath);
    }
}
selectionTool.onKeyDown = function(event) {
    // event.preventDefault();
    if (myPath != null && document.activeElement != document.getElementById("messageInput")) {
        if (event.key == 'delete' || event.key == 'backspace') {
            emitRemovePath();
            myPath.remove();
            myPath = null;
        }
        if (event.key == 'f') {
            var color = new Color($('#hexVal').val());
            emitRemovePath();
            if (myPath.fillColor != color) {
                myPath.fillColor = color;
            } else {
                myPath.fillColor = null;
            }
            emitPath(myPath);
        }
        if (event.key == 'c') {
            emitRemovePath();
            myPath.strokeColor = new Color($('#hexVal').val());
            emitPath(myPath);
        }
        if (event.key == 'd') {
            emitSelectPath(myPath.firstSegment.point);
            myPath.selected = false;
            myPath = myPath.clone();
            myPath.selected = true;
            emitPath(myPath);
        }
        if (event.key == 't') {
            emitRemovePath();
            if (event.modifiers.shift) {
                myPath.strokeWidth -= 1;
            } else {
                myPath.strokeWidth += 1;
            }
            emitPath(myPath);
        }
        if (event.key == 'up') {
            emitRemovePath();
            myPath.position.y -= 1;
            emitPath(myPath);
        }
        if (event.key == 'right') {
            emitRemovePath();
            myPath.position.x += 1;
            emitPath(myPath);
        }
        if (event.key == 'left') {
            emitRemovePath();
            myPath.position.x -= 1;
            emitPath(myPath);
        }
        if (event.key == 'down') {
            emitRemovePath();
            myPath.position.y += 1;
            emitPath(myPath);
        }
        view.draw();
    }
}

function clearSelection() {
    if (myPath != null) {
        emitSelectPath(myPath.firstSegment.point);
        myPath.selected = false;
        myPath = null;
    }
}



/*****Resize Function*********/
function onResize(event) {
    paper.view.viewSize = [canvas.offsetWidth, canvas.offsetHeight];
}

/*-----Save Canvas---------
 * Saves the canvas as an image
 * automatically downloads as .png
 */
function saveCanvas() {
    //cache height and width        
    var w = canvas.width;
    var h = canvas.height;
    var context = canvas.getContext('2d');
    var data;

    //get the current ImageData for the canvas.
    data = context.getImageData(0, 0, w, h);

    //store the current globalCompositeOperation
    var compositeOperation = context.globalCompositeOperation;

    //set to draw behind current content
    context.globalCompositeOperation = "destination-over";

    //set background color
    context.fillStyle = 'white';

    //draw background / rect on entire canvas
    context.fillRect(0, 0, w, h);

    //get the image data from the canvas
    var imageData = canvas.toDataURL("image/png");

    //clear the canvas
    context.clearRect(0, 0, w, h);

    //restore it with original / cached ImageData
    context.putImageData(data, 0, 0);

    //reset the globalCompositeOperation to what it was
    context.globalCompositeOperation = compositeOperation;

    var saveImage = document.getElementById("saveImage");
    saveImage.src = imageData;
    document.getElementById("save").href = saveImage.src;
}


/*-----randomColor--------
 * generates a random color
 * will always be opaque
 */
function randomColor() {

    return {
        red: Math.random(),
        green: Math.random(),
        blue: Math.random(),
        alpha: 1
    };
}

/*****Processing Other Users Path*******/

/*-------------addPoint-----------------
 * adds a point received from other users
 * to the otherPath global path
 * BUG: if two other users are drawing at
 * the same time!!
 */
function addPoint(data) {
    point = new Point(data.x, data.y);
    // lastPaths[data.user].strokeColor = data.color
    lastPaths[data.user].add(point);
    view.draw();
}
/*--------endPath--------
 * invoked when another user is done
 * drawing their path
 */
function endPath(user) {
    lastPaths[user] = null;
    // console.log("Last path cleared for ", user);
}
/*-------------drawPath-----------------
 * Draws a path and updates the lastPaths
 * array to hold that path in the users
 * slot
 */
function drawPath(data) {
    lastPaths[data.user] = new Path(data.datapath);
    lastPaths[data.user].strokeColor = data.color;
    lastPaths[data.user].strokeWidth = data.strokeWidth;
    lastPaths[data.user].fillColor = data.fillColor;
    // lastPaths[data.user].selected = data.selected;
    view.draw();
}

/*-------------typeText-----------------
 * Types Text and updates the lastPaths
 * array to hold that path in the users
 * slot
 */
function typeText(data) {
    // console.log(data);
    lastPaths[data.user] = new PointText({
        point: new Point(data.x, data.y),
        fontSize: data.fontSize,
        fillColor: new Color(data.colorVal),
        content: data.content
    });
    view.draw();
}

/*------------removePath---------------
 * Cycles through lastPaths array and removes
 * the last path drawn by the user
 */
function removePath(user) {
    for (key in lastPaths) {
        if (key == user) {
            lastPaths[key].remove();
        }
    }
    view.draw();
}
/*-------------selectPath-----------------
 * Draws a path and updates the lastPaths
 * array to hold that path in the users
 * slot
 */
function selectPath(data) {
    var hitResult = project.hitTest(new Point(data.x, data.y), hitOptions);
    if (hitResult != null) {
        if (lastPaths[data.user] != hitResult.item) {
            lastPaths[data.user] = hitResult.item;
        } else {
            lastPaths[data.user] = null;
        }
    }
}

/**********Adding/Removing Users********/
/* --------disconnectedUser-----------
 * delete users that leave from the
 * lastPaths array
 */
function disconnectedUser(data) {
    delete lastPaths[data];
}

/* --------getProject--------------
 * send lastPaths and project to a
 * new user that just logged in
 */
function getProject(data) {
    var selected;
    var myId = io.socket.sessionid;
    lastPaths[myId] = null;
    if (myPath != null) {
        lastPaths[myId] = new Path(myPath.pathData);
        lastPaths[myId].strokeColor = myPath.strokeColor;
        lastPaths[myId].strokeWidth = myPath.strokeWidth;
        lastPaths[myId].fillColor = myPath.fillColor;
        myPath.remove();
        selected = myPath.selected;
        myPath = null;
    }
    for (key in lastPaths) {
        if (lastPaths[key] != null) {
            lastPaths[key].data.sessionId = key;
        }
    }
    var dataSend = {
        project: project.exportJSON(),
        session: data
    }
    myPath = lastPaths[myId];
    if (myPath != null) {
        myPath.selected = selected;
    }
    delete lastPaths[myId];
    return dataSend;
}

/* ------setProject----------------
 * Update a new user's project based
 * on data imported from the orignal
 * user of this room
 */
function setProject(data) {
    project.importJSON(data.project);
    for (var i = 0; i < project.activeLayer.children.length; i++) {
        if (project.activeLayer.children[i].data.sessionId != null) {
            lastPaths[project.activeLayer.children[i].data.sessionId] = project.activeLayer.children[i];
        }
    }
    view.draw();
}

/*********Sending this Users Path***********/

/* --------emitPoint-----------
 * used to send the last point of a path
 * to the other users. Also sends the color.
 */
function emitPoint(point) {
    var sessionId = io.socket.sessionid;
    var data = {
        x: point.x,
        y: point.y,
        color: myPath.strokeColor,
        user: sessionId
    };
    io.emit('addPoint', data, sessionId);
}

/* ---------emitPath--------------
 * used to send an entier path to other
 * users. Also sends the color.
 */
function emitPath(path) {
    var sessionId = io.socket.sessionid;
    // console.log(path.pathData);
    data = {
        datapath: path.pathData,
        color: path.strokeColor,
        strokeWidth: path.strokeWidth,
        user: sessionId,
        fillColor: path.fillColor,
        // selected: path.selected
    };
    myPath.bringToFront();
    io.emit('drawPath', data, sessionId);
}

/* ---------emitText-------------
 * used to send a text object to other
 * users. Also sends the color, fontSize
 * and content.
 */
function emitText(text) {
    var sessionId = io.socket.sessionid;
    // console.log(text);
    data = {
        x: text.point.x,
        y: text.point.y,
        fontSize: text.fontSize,
        content: text.content,
        colorVal: $('#hexVal').val(),
        user: sessionId
    };
    io.emit('typeText', data, sessionId);
}

/*------------emitEndPath-------------
 * tell other users that a path has been
 * completed.
 */
function emitEndPath() {
    var sessionId = io.socket.sessionid;
    data = {
        user: sessionId
    };
    io.emit('endPath', data, sessionId);
}
/*----------emitRemovePath--------------
 * tell other users to remove a path
 */
function emitRemovePath() {
    var sessionId = io.socket.sessionid;
    var data = {
        user: sessionId
    };
    io.emit('removePath', data, sessionId)
}
/*----------emitSelectPath--------------
 * tell other users that yous selected
 * a path
 */
function emitSelectPath(point) {
    var sessionId = io.socket.sessionid;
    var data = {
        user: sessionId,
        x: point.x,
        y: point.y
    };
    io.emit('selectPath', data, sessionId)
}

/******Socket.io Code*********/
io.on('addPoint', function(data) {
    addPoint(data);
})
io.on('drawPath', function(data) {
    drawPath(data);
})
io.on('typeText', function(data) {
    typeText(data);
})
io.on('endPath', function(data) {
    endPath(data.user);
});
io.on('removePath', function(data) {
    removePath(data.user);
});
io.on('selectPath', function(data) {
    selectPath(data);
});
io.on('disconnectedUser', function(data) {
    disconnectedUser(data);
});
io.on('getProject', function(data) {
    dataSend = getProject(data);
    io.emit('updateProject', dataSend);

});
io.on('setProject', function(data) {
    setProject(data);
})

/*-------Map Buttons to Functions----------*/
$(function() {
    $("#freeDraw").click(function() {
        activateFreeDraw()
    });
    $("#lineDraw").click(function() {
        activateLineDraw();
        $("#freeDraw").removeClass("active");
    });
    $("#circleDraw").click(function() {
        activateCircleDraw();
        $("#freeDraw").removeClass("active");
    });
    $("#rectangleDraw").click(function() {
        activateRectangleDraw();
        $("#freeDraw").removeClass("active");
    });
    $("#ellipseDraw").click(function() {
        activateEllipseDraw();
        $("#freeDraw").removeClass("active");
    });
    $("#starDraw").click(function() {
        activateStarDraw();
        $("#freeDraw").removeClass("active");
    });
    $("#textType").click(function() {
        activateTextType();
        $("#freeDraw").removeClass("active");
    });
    $("#selectionTool").click(function() {
        activateSelectionTool();
        $("#freeDraw").removeClass("active");
    });
    $("#save").click(function() {
        saveCanvas();
    });
});

$(document).ready(function() {
    $("[rel='tooltip']").tooltip();
});