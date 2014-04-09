/**Javascript file conrolling drawing on canvas**/
var canvas = document.getElementById("draw"); // Canvas element
paper.view.viewSize = [canvas.offsetWidth,canvas.offsetHeight];	//Makes the input area same size as the canvas

/**Path Variables***/
var myPath;						//Current path being drawn by this user
var otherPath = new Path();		//Used for drawing paths from other users
var startPoint;					//Starting point of a path - used to draw lines
var lastPaths = {};				//Map for every other users last path drawn

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
	view.draw();
}
freeDraw.onMouseDrag = function(event) {
	if(myPath != null)
	{
		myPath.add(event.point);
		if(myPath.pathData != null){
			emitPath(myPath); 
			emitPoint(event.point);
		}
		view.draw();
	}
}
freeDraw.onMouseUp = function(event) {
	emitEndPath();
	myPath = null;
}

/**********Line Draw Functions*********/
function activateLineDraw(){
	lineDraw.activate();
}

lineDraw.onMouseDown = function(event) {
	myPath = new Path.Line();
	myPath.from = event.point;
	startPoint = event.point;
	myPath.strokeColor = randomColor();
	emitPath(myPath);
	view.draw();
}
lineDraw.onMouseDrag = function(event) {
	
	if(myPath != null)
	{
		var color = myPath.strokeColor;
		emitRemovePath(myPath);
		myPath.remove();
		myPath = new Path.Line(startPoint,event.point);
		myPath.strokeColor = color;
		emitPath(myPath);
		view.draw();
	}
}
lineDraw.onMouseUp = function(event) {
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
    context.fillRect(0,0,w,h);

    //get the image data from the canvas
    var imageData = canvas.toDataURL("image/png");

    //clear the canvas
    context.clearRect (0,0,w,h);

    //restore it with original / cached ImageData
    context.putImageData(data, 0,0);        

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
function addPoint(data)
{
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
	delete lastPaths[user];
	// console.log("Last path cleared for ", user);
}
/*-------------drawPath-----------------
* Draws a path and updates the lastPaths 
* array to hold that path in the users
* slot
*/
function drawPath(data){
	lastPaths[data.user]= new Path(data.datapath);
	lastPaths[data.user].strokeColor = data.color;
	view.draw();
}

/*------------removePath---------------
* Cycles through lastPaths array and removes
* the last path drawn by the user
*/
function removePath(user){
	for(key in lastPaths)
	{
		if(key == user)
		{
			lastPaths[key].remove();
		} 
	}
}

/*********Sending this Users Path***********/

/* --------emitPoint-----------
* used to send the last point of a path
* to the other users. Also sends the color.
*/
function emitPoint(point)
{
	var sessionId = io.socket.sessionid;
	var data = {x:point.x, y:point.y, color:myPath.strokeColor, user:sessionId};
	io.emit('addPoint',data,sessionId);
}

/* ---------emitPath--------------
* used to send an entier path to other
* users. Also sends the color.
*/
function emitPath(path){
	var sessionId = io.socket.sessionid;
	// console.log(path.pathData);
	data = {datapath: path.pathData, color:path.strokeColor, user:sessionId};
	io.emit('drawPath',data,sessionId);
}

/*------------emitEndPath-------------
* tell other users that a path has been
* completed.
*/
function emitEndPath() {
	var sessionId = io.socket.sessionid;
	data = {user:sessionId};
	io.emit('endPath',data,sessionId);
}
/*----------emitRemovePath--------------
* tell other users to remove a path
*/
function emitRemovePath(path){
	var sessionId = io.socket.sessionid;
	var data = {user:sessionId};
	io.emit('removePath',data,sessionId)
}

/******Socket.io Code*********/
io.on('addPoint',function(data) {
	addPoint(data);
})
io.on( 'drawPath', function(data) {
	drawPath(data);
})
io.on( 'endPath', function( data ) {
	endPath(data.user);
});
io.on('removePath',function(data){
	removePath(data.user);
});

/*-------Map Buttons to Functions----------*/
$(function() {
    $("#freeDraw").click(function() {activateFreeDraw()});
    $("#lineDraw").click(function() {activateLineDraw();});
    $("#save").click(function() {saveCanvas();});
});