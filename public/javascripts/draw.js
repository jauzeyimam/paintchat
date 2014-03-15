/**Javascript file conrolling drawing on canvas**/
var myPath;
var otherPath = new Path();		//used for paths from other users
var canvas = document.getElementById("draw");
var maxx = canvas.offsetWidth;
var maxy = canvas.offsetHeight;
paper.view.viewSize = [maxx,maxy];	//Makes the input area same size as the canvas
console.log("max x " + maxx + " max y " + maxy);
// console.log("min->max x,y: ",minx,maxx,miny,maxy);*/

function onMouseDown(event) {
	myPath = new Path();
	myPath.strokeColor = randomColor();
}

function onMouseDrag(event) {
	if(myPath != null)
	{
		myPath.add(event.point);
		emitPoint(event.point);
	}
}

/**Changing the commented lines in this function can
switch from emitting point by point to emitting the
whole path at once**/
function onMouseUp(event) {
	// console.log("Event: ",event.point.x,event.point.y);
	emitEndPath();
	// emitPath(myPath);
	myPath = null;
}

function addPoint(data)
{
	point = new Point(data.x, data.y);
	// console.log(point);
	otherPath.strokeColor = data.color
	otherPath.add(point);
	view.draw();
}
//End a path
function endPath() {
	otherPath = new Path();
}
//Draw a path
function drawPath(data){
	var path = new Path(data.datapath);
	path.strokeColor = data.color;
	//console.log("path : ", path);
	view.draw();
}
// Returns an object specifying a semi-random color
// The color will always have a red value of 0
// and will be semi-transparent (the alpha value)
function randomColor() {
    return {
        red: Math.random(),
        green: Math.random(),
        blue: Math.random(),
        alpha: 1 //( Math.random() * 0.25 ) + 0.05
    };
}

function emitPoint(point)
{
	var sessionId = io.socket.sessionid;
	var data = {x:point.x, y:point.y, color:myPath.strokeColor};
	io.emit('addPoint',data,sessionId);
	//console.log('emitting ',data);
}
//This functions sends a path to other users
function emitPath(path){
	var sessionId = io.socket.sessionid;
	data = {datapath: path.pathData, color:path.strokeColor};
	io.emit('drawPath',data,sessionId);
	// console.log('emitting ', data);
}
//This function just tells other users that a path is completed
function emitEndPath() {
	var sessionId = io.socket.sessionid;
	io.emit( 'endPath', sessionId )
}

io.on('addPoint',function(data) {
	// console.log('addPoint event recieved: ', data)
	addPoint(data);
})
// Listen for 'drawPath' events
// created by other users
io.on( 'drawPath', function(data) {
	// console.log('Path Received');
	drawPath(data);
})
// Listen for 'endPath' events
// created by other users
io.on( 'endPath', function( data ) {
    // console.log( 'Path Complete');
	endPath();
});
