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
		removePath(myPath.id);
		myPath = new Path.Line(startPoint,event.point);
		myPath.strokeColor = color;
		view.draw();
		emitPath(myPath);
	}
}
lineDraw.onMouseUp = function(event) {
	var color = myPath.strokeColor;
	// emitRemovePath(myPath.id);
	console.log(project.activeLayer.children[project.activeLayer.children.length-1]);
	myPath.remove();
	myPath = new Path.Line(startPoint,event.point);
	myPath.strokeColor = color;
	emitPath(myPath);
	view.draw();
	console.log("Last Path drawn: ", myPath.id);
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
	console.log(project.activeLayer.lastChild);
}

/*INCOMPLETE!!***/
function removePath(id){
	console.log("Removing Path",id);
	for(var i=0;i<project.activeLayer.children.length;i++){
		if(project.activeLayer.children[i].id == id){
			console.log("Path Removed ID: ",id);
			project.activeLayer.children[i].remove();
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
	io.emit('endPath',sessionId);
}
/*----------emitRemovePath--------------
* tell other users to remove a path
*/
function emitRemovePath(path){
	var sessionId = io.socket.sessionid;
	var data = {id:path.id};
	console.log(path.id);
	io.emit('removePath',data,sessionId)
}

/*******Refactoring Path Emission 4/2*********/
function emitTempPathRefactored(path) {
	var sessionId = io.socket.sessionid;
	data = {datapath: path.pathData, color:path.strokeColor, id:sessionId};
	io.emit('drawTempPathRefactored',data,sessionId);
}

function emitCompletePathRefactored(path) {
	var sessionId = io.socket.sessionid;
	data = {datapath: path.pathData, color:path.strokeColor, id:sessionId};
	io.emit('drawCompletePathRefactored',data,sessionId);
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
io.on('removePath',function(data){
	removePath(data.id);
});
/*-------Map Buttons to Functions----------*/
$(function() {
    $("#freeDraw").click(function() {activateFreeDraw()});
    $("#lineDraw").click(function() {activateLineDraw();});
    $("#save").click(function() {saveCanvas();});
});