/**Javascript file conrolling drawing on canvas**/
var canvas = document.getElementById("draw"); // Canvas element
paper.view.viewSize = [canvas.offsetWidth,canvas.offsetHeight];	//Makes the input area same size as the canvas

/**Path Variables***/
var myPath;						//Current path being drawn by this user
var otherPath = new Path();		//Used for drawing paths from other users

var startPoint;					//Starting point of a path - used to draw lines

/***Drawing Tools****/
var freeDraw = new Tool();
var lineDraw = new Tool();

/********Free Draw Functions**********/
function activateFreeDraw(){
	freeDraw.activate();
}
freeDraw.onMouseDown = function(event) {
	myPath = new Path();
	myPath.strokeColor = randomColor();
}
freeDraw.onMouseDrag = function(event) {
	
	if(myPath != null)
	{
		myPath.add(event.point); 
		emitPoint(event.point);
	}
}
freeDraw.onMouseUp = function(event) {
	emitEndPath();
	// emitPath(myPath); //To prevent other users from seeing incomplete paths uncomment this line, emitPath, and drawPath functions
	myPath = null;
}

/**********Line Draw Functions*********/
function activateLineDraw(){
	lineDraw.activate();
}
$(function() {
    $("#chatControls").hide();
    $("#pseudoSet").click(function() {setPseudo()});
    $("#submit").click(function() {sentMessage();});
});
lineDraw.onMouseDown = function(event) {
	myPath = new Path.Line();
	myPath.from = event.point;
	startPoint = event.point;
	myPath.strokeColor = randomColor();
	view.draw();
	myPath.removeOnDrag();
}
lineDraw.onMouseDrag = function(event) {
	
	if(myPath != null)
	{
		myPath.remove
		myPath = new Path.Line(startPoint,event.point);
		myPath.strokeColor = randomColor();//myPath.strokeColor;
		view.draw();
		myPath.removeOnDrag();
	}
}
function onMouseUp(event) {
	myPath = new Path.Line(startPoint,event.point);
	myPath.strokeColor = randomColor();
	emitEndPath();
	view.draw();
	myPath = null;
}

/*****Resize Function*********/
function onResize(event) {
	paper.view.viewSize = [canvas.offsetWidth,canvas.offsetHeight];
}
/*-----Save Canvas---------
* Saves the canvas as an image
* automatically downloads as .png
*/
function saveCanvas()
{
	var saveImage = document.getElementById("saveImage");
	saveImage.src = canvas.toDataURL();
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
function addPoint(data)
{
	point = new Point(data.x, data.y);
	otherPath.strokeColor = data.color
	otherPath.add(point);
	view.draw();
}
/*--------endPath--------
* invoked when another user is done
* drawing their path
*/
function endPath() {
	otherPath = new Path();
}
/*-------------drawPath-----------------
* Unused function from old implementation
* used to draw another users complete path
*/
function drawPath(data){
	var path = new Path(data.datapath);
	path.strokeColor = data.color;
	view.draw();
}

/*********Sending this Users Path***********/

/* --------emitPoint-----------
* used to send the last point of a path
* to the other users. Also sends the color.
*/
function emitPoint(point)
{
	var sessionId = io.socket.sessionid;
	var data = {x:point.x, y:point.y, color:myPath.strokeColor};
	io.emit('addPoint',data,sessionId);
}

/* ---------emitPath--------------
* used to send an entier path to other
* users. Also sends the color.
*/
function emitPath(path){
	var sessionId = io.socket.sessionid;
	data = {datapath: path.pathData, color:path.strokeColor};
	io.emit('drawPath',data,sessionId);
}

/*------------emitEndPath-------------
* tell other users that a path has been
* completed.
*/
function emitEndPath() {
	var sessionId = io.socket.sessionid;
	io.emit( 'endPath', sessionId )
}

/******Socket.io Code*********/
io.on('addPoint',function(data) {
	addPoint(data);
})
io.on( 'drawPath', function(data) {
	drawPath(data);
})
io.on( 'endPath', function( data ) {
	endPath();
});

/*-------Map Buttons to Functions----------*/
$(function() {
    $("#freeDraw").click(function() {activateFreeDraw()});
    $("#lineDraw").click(function() {activateLineDraw();});
    $("#save").click(function() {saveCanvas();});
});