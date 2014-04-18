/**Javascript file conrolling drawing on canvas**/
var canvas = document.getElementById("draw"); // Canvas element
paper.view.viewSize = [canvas.offsetWidth,canvas.offsetHeight];	//Makes the input area same size as the canvas

/**Path Variables***/
var myPath;						//Current path being drawn by this user
var otherPath = new Path();		//Used for drawing paths from other users
var startPoint;					//Starting point of a path - used to draw lines
var lastPaths = {};				//Map for every other users last path drawn
var myColor = "";
/***Drawing Tools****/
var freeDraw = new Tool();
var lineDraw = new Tool();
var circleDraw = new Tool();
var rectangleDraw = new Tool();
var ellipseDraw = new Tool();
var textType = new Tool();

/********Free Draw Functions**********/
function activateFreeDraw(){
	freeDraw.activate();
}
freeDraw.onMouseDown = function(event) {
	myPath = new Path();
	myPath.strokeColor = new Color($('#hexVal').val());
	view.draw();		//DOES THIS CAUSE LAG?
}
freeDraw.onMouseDrag = function(event) {
	if(myPath != null)
	{
		emitRemovePath(myPath);
		myPath.add(event.point);
		if(myPath.pathData != null){
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
function activateLineDraw(){
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

/**********Circle Draw Functions*********/
function activateCircleDraw(){
	circleDraw.activate();
}

circleDraw.onMouseDown = function(event) {
	myPath = new Path.Circle(event.point,0);
	startPoint = event.point;
	myPath.strokeColor = new Color($('#hexVal').val());
	emitPath(myPath);
	view.draw();
}
circleDraw.onMouseDrag = function(event) {
	
	if(myPath != null)
	{
		var color = myPath.strokeColor;
		emitRemovePath(myPath);
		myPath.remove();
		myPath = new Path.Circle(event.point,startPoint.getDistance(event.point));
		myPath.strokeColor = color;
		emitPath(myPath);
		view.draw();
	}
}

/**********Rectangle Draw Functions*********/
function activateRectangleDraw(){
	rectangleDraw.activate();
}

rectangleDraw.onMouseDown = function(event) {
	myPath = new Path.Rectangle(event.point,event.point);
	startPoint = event.point;
	myPath.strokeColor = new Color($('#hexVal').val());
	emitPath(myPath);
	view.draw();
}
rectangleDraw.onMouseDrag = function(event) {
	
	if(myPath != null)
	{
		var color = myPath.strokeColor;
		emitRemovePath(myPath);
		myPath.remove();
		myPath = new Path.Rectangle(startPoint,event.point);
		myPath.strokeColor = color;
		emitPath(myPath);
		view.draw();
	}
}

/**********Ellipse Draw Functions*********/
function activateEllipseDraw(){
	ellipseDraw.activate();
}

ellipseDraw.onMouseDown = function(event) {
	myPath = new Path.Ellipse(new Rectangle(event.point,event.point));
	startPoint = event.point;
	myPath.strokeColor = new Color($('#hexVal').val());
	emitPath(myPath);
	view.draw();
}
ellipseDraw.onMouseDrag = function(event) {
	
	if(myPath != null)
	{
		var color = myPath.strokeColor;
		emitRemovePath(myPath);
		myPath.remove();
		myPath = new Path.Ellipse(new Rectangle(startPoint,event.point));
		myPath.strokeColor = color;
		emitPath(myPath);
		view.draw();
	}
}

ellipseDraw.onMouseUp = function(event) {
	myPath = null;
}

/**********Text Type Functions*********/
function activateTextType(){
	textType.activate();
}
textType.onMouseDown = function(event){
	myPath = new PointText({
		point: event.point,
		fontSize : 12,
		fillColor : new Color($('#hexVal').val()),
		content: 'Release Mouse to type here\nPress escape to stop typing'
	});
	view.draw();
}
textType.onMouseDrag = function(event){
	myPath.point = event.point;
}
textType.onMouseUp = function(event){
	myPath.content = '';
	emitText(myPath);
}
textType.onKeyDown = function(event){
	if(myPath != null)
	{
		emitRemovePath(myPath);
		if(event.key == 'escape')
		{
			myPath = null;
		}
		else if(event.key == 'space')
		{
			myPath.content = myPath.content + ' ';
		}
		else if(event.key == 'enter')
		{
			myPath.content = myPath.content + '\n';
		}
		else if(event.key == 'backspace')
		{
			myPath.content = myPath.content.substring(0,myPath.content.length -1);
		}
		else if(event.key.length > 1)
		{
			//don't show control, alt, home, end etc.
		}
		else
		{
			myPath.content = myPath.content + event.key;
		}
		emitText(myPath);
	}
	view.draw();
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

/*-------------typeText-----------------
* Types Text and updates the lastPaths 
* array to hold that path in the users
* slot
*/
function typeText(data){
	// console.log(data);
	lastPaths[data.user] = new PointText({
		point: new Point(data.x,data.y),
		fontSize : data.fontSize,
		fillColor : new Color(data.colorVal),
		content: data.content
	});
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

/* ---------emitText-------------
* used to send a text object to other
* users. Also sends the color, fontSize
* and content.
*/
function emitText(text){
	var sessionId = io.socket.sessionid;
	console.log(text);
	data = {x:text.point.x, y:text.point.y, fontSize: text.fontSize, content: text.content, colorVal:$('#hexVal').val(), user:sessionId};
	io.emit('typeText',data,sessionId);
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
io.on( 'typeText', function(data) {
	typeText(data);
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
    $("#circleDraw").click(function() {activateCircleDraw();});
    $("#rectangleDraw").click(function() {activateRectangleDraw();});
    $("#ellipseDraw").click(function() {activateEllipseDraw();});
    $("#textType").click(function(){activateTextType();});
    $("#save").click(function() {saveCanvas();});

});