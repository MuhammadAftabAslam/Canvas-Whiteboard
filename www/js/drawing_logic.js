RecordableDrawing = function (canvasId)
{
	var self = this;
	this.canvas = null;
	this.width = this.height = 0;
	this.actions = new Array();
	this.drawingObjects = new Array();
	this.ctx = null;
	this.mouseDown = false;
	this.mouseDownForObject = false;
	this.currentRecording = null; //instance of Recording
	this.recordings = new Array(); //array of Recording objects
	this.lastMouseX = this.lastMouseY = -1;
	this.bgColor = "rgb(0,0,0)";
	this.currentLineWidth = 5;
	this.drawingColor = "rgb(255,255,255)";
	var pauseInfo = null;





	var canvas = document.getElementById(canvasId);
	canvas.addEventListener("touchstart", function (e) {
		mousePos = getTouchPos(canvas, e);
		var touch = e.touches[0];
		var mouseEvent = new MouseEvent("mousedown", {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
		canvas.dispatchEvent(mouseEvent);
	}, false);
	canvas.addEventListener("touchend", function (e) {
		var mouseEvent = new MouseEvent("mouseup", {});
		canvas.dispatchEvent(mouseEvent);
	}, false);
	canvas.addEventListener("touchmove", function (e) {
		var touch = e.touches[0];
		var mouseEvent = new MouseEvent("mousemove", {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
		canvas.dispatchEvent(mouseEvent);
	}, false);

// Get the position of a touch relative to the canvas
	function getTouchPos(canvasDom, touchEvent) {
		var rect = canvasDom.getBoundingClientRect();
		return {
			x: touchEvent.touches[0].clientX - rect.left,
			y: touchEvent.touches[0].clientY - rect.top
		};
	}

	// Prevent scrolling when touching the canvas
	document.body.addEventListener("touchstart", function (e) {
		if (e.target == canvas) {
			e.preventDefault();
		}
	}, false);
	document.body.addEventListener("touchend", function (e) {
		if (e.target == canvas) {
			e.preventDefault();
		}
	}, false);
	document.body.addEventListener("touchmove", function (e) {
		if (e.target == canvas) {
			e.preventDefault();
		}
	}, false);










	onMouseDown = function(event)
	{
		var canvasX = $(self.canvas).offset().left;
		var canvasY = $(self.canvas).offset().top;

		self.mouseDown = true;
		var x = Math.floor(event.pageX - canvasX);
		var y = Math.floor(event.pageY - canvasY);

		var startX = parseInt(event.clientX - canvasX);
		var startY = parseInt(event.clientY - canvasY);
		var obj = getDrawingObject(startX, startY);
		//console.log('startx starty ',startX, startY);
		//console.log('on mouse down anchorHitTest',anchorHitTest(startX, startY, obj));
		//console.log('obj : ',obj);
		if(obj) {
			self.mouseDownForObject = obj;
			obj.startX = startX;
			obj.startY = startY;
			obj.draggingResizer = anchorHitTest(startX, startY, obj);
			//console.log('obj.draggingResizer : ',obj.draggingResizer);
			obj.draggingImage = obj.draggingResizer < 0 && hitImage(startX, startY);
		}
		else {
			console.log('mosue down on canvas for point');
			var currAction = new Point(x, y, 0);
			self.drawAction(currAction, true);
			if (self.currentRecording != null)
				self.currentRecording.addAction(currAction);
		}
		self.lastMouseX = x;
		self.lastMouseY = y;
		event.preventDefault();
		return false;
	}

	function hitImage(x, y) {
		var temp = false;
		for (var i = 0; i < self.drawingObjects.length; i++) {
			if (self.drawingObjects[i].actionType == 4) {
				if((x > self.drawingObjects[i].imageX && x < self.drawingObjects[i].imageX + self.drawingObjects[i].imageWidth && y > self.drawingObjects[i].imageY && y < self.drawingObjects[i].imageY + self.drawingObjects[i].imageHeight))
				{
					temp = true;
				}
			}
			else{
				return false;
			}
		}
		return temp;
	}

	getDrawingObject = function (x, y) {
		var ifElementFound = false;
		var index = 0;
		for (var i = 0; i < self.drawingObjects.length; i++) {
			if (self.drawingObjects[i].actionType == 4) {
				if ((x > self.drawingObjects[i].imageX - 5 && x < self.drawingObjects[i].imageX + self.drawingObjects[i].imageWidth + 5 && y + 5 > self.drawingObjects[i].imageY && y < self.drawingObjects[i].imageY + self.drawingObjects[i].imageHeight + 5)) {
					ifElementFound = true;
					index = i;
				}
			}
		}
		if (ifElementFound) {
			return self.drawingObjects[index]
		} else {
			return false
		}
	}

	anchorHitTest = function (x, y, obj) {

		var dx, dy;

		// top-left
		dx = x - obj.imageX;
		dy = y - obj.imageY;
		if (dx * dx + dy * dy <= obj.rr) {
			return (0);
		}
		// top-right
		//console.log('x : ',x,'y : ',y);
		//console.log('obj.imageRight : ',obj.imageRight,'obj.imageY : ',obj.imageY);
		dx = x - obj.imageRight;
		dy = y - obj.imageY;

		if (dx * dx + dy * dy <= obj.rr) {
			return (1);
		}
		// bottom-right
		dx = x - obj.imageRight;
		dy = y - obj.imageBottom;
		if (dx * dx + dy * dy <= obj.rr) {
			return (2);
		}
		// bottom-left
		dx = x - obj.imageX;
		dy = y - obj.imageBottom;
		if (dx * dx + dy * dy <= obj.rr) {
			return (3);
		}
		return (-1);

	}


	function handleMouseMoveForDrawingObjects(e, selectedObj) {

		var mouseX = parseInt(e.pageX - $(self.canvas).offset().left);
		var mouseY = parseInt(e.pageY - $(self.canvas).offset().top);
		//console.log('mouseX, mouseY : ',mouseX, mouseY);

		var obj = getDrawingObject(mouseX, mouseY) || selectedObj;
		//console.log('obj : == > ',obj);
		if (obj && obj.draggingResizer > -1) {
			//debugger; //off this functionality for now
			// resize the image
			switch (obj.draggingResizer) {
				case 0:
					//top-left
					obj.imageX = mouseX;
					obj.imageWidth = obj.imageRight - mouseX;
					obj.imageY = mouseY;
					obj.imageHeight = obj.imageBottom - mouseY;
					break;
				case 1:
					//top-right
					obj.imageY = mouseY;
					obj.imageWidth = mouseX - obj.imageX;
					obj.imageHeight = obj.imageBottom - mouseY;
					break;
				case 2:
					//bottom-right
					obj.imageWidth = mouseX - obj.imageX;
					obj.imageHeight = mouseY - obj.imageY;
					break;
				case 3:
					//bottom-left
					obj.imageX = mouseX;
					obj.imageWidth = obj.imageRight - mouseX;
					obj.imageHeight = mouseY - obj.imageY;
					break;
			}

			if (obj.imageWidth < 50) {
				obj.imageWidth = 50;
			}
			if (obj.imageHeight < 50) {
				obj.imageHeight = 50;
			}

			// set the image right and bottom
			obj.imageRight = obj.imageX + obj.imageWidth;
			obj.imageBottom = obj.imageY + obj.imageHeight;

			self.drawAction(obj, true, true);
			if (self.currentRecording != null){
				var copy = $.extend(true, {}, obj);//Object.clone(obj);
				self.currentRecording.addAction(copy);
			}

			return true;
		} else if (obj.draggingImage) {

			//imageClick = false;

			//mouseX = parseInt(e.clientX - offsetX);
			//mouseY = parseInt(e.clientY - offsetY);

			// move the image by the amount of the latest drag
			var dx = mouseX - obj.startX;
			var dy = mouseY - obj.startY;
			obj.imageX += dx;
			obj.imageY += dy;
			obj.imageRight += dx;
			obj.imageBottom += dy;
			// reset the startXY for next time
			obj.startX = mouseX;
			obj.startY = mouseY;

			self.drawAction(obj, true, true);
			if (self.currentRecording != null){
				var copy = $.extend(true, {}, obj);
				self.currentRecording.addAction(copy);
			}

			return true;
		}
		else {
			return false;
		}
	}


	onMouseMove = function (event) {
		if (self.mouseDown) {
			//console.log('mouse move : ');
			var canvasX = $(self.canvas).offset().left;
			var canvasY = $(self.canvas).offset().top;

			var x = Math.floor(event.pageX - canvasX);
			var y = Math.floor(event.pageY - canvasY);

			var res = handleMouseMoveForDrawingObjects(event,self.mouseDownForObject);
			var startX = parseInt(event.clientX - canvasX);
			var startY = parseInt(event.clientY - canvasY);
			//console.log('mouse move hit image',hitImage(startX, startY));
			//console.log('handleMouseMoveForDrawingObjects  :', res);
			//console.log('self.currentRecording  :', self.currentRecording);

			if (!res && !self.mouseDownForObject) {
				var action = new Point(x, y, 1,{x:self.lastMouseX,y:self.lastMouseY});
				if (self.currentRecording != null)
					self.currentRecording.addAction(action);
				self.drawAction(action, true);
			}

			event.preventDefault();
			self.lastMouseX = x;
			self.lastMouseY = y;
			return false;
		}
	}

	setDraggingResizing = function (draggingResizer, draggingImage, actionType) //actiontype == 4 for images
	{
		for (var i = 0; i < self.drawingObjects.length; i++) {
			if (self.drawingObjects[i].actionType == actionType) {
				self.drawingObjects[i].draggingResizer = draggingResizer;
				self.drawingObjects[i].draggingImage = draggingImage;
			}
		}
	}

	onMouseUp = function(event)
	{
		setDraggingResizing(-1,false,4);
		self.mouseDownForObject = false;
		self.mouseDown = false;
		//self.lastMouseX = -1;
		//self.lastMouseY = -1;
	}

	this.setColor = function (color)
	{
		self.drawingColor = color;
		var colorAction = new SetColor(color);
		self.actions.push(colorAction);
		if (self.currentRecording != null)
			self.currentRecording.addAction(colorAction);
	}

  this.setImage = function (url,id) {
    //self.drawingColor = color;
    //var img = new Image();
    //img.src = url;
    var imageAction = new SetImage(url, self.lastMouseX, self.lastMouseY, false, id);

    self.drawAction(imageAction, true);
		var copy = $.extend(true, {}, imageAction);
    //self.actions.push(imageAction);
		self.drawingObjects.push(imageAction);
    if (self.currentRecording != null)
      self.currentRecording.addAction(copy);
  }

	this.setStokeSize = function (sizeArg)
	{
		self.currentLineWidth = sizeArg;
		var sizeAction = new SetStokeSize(sizeArg);
		self.actions.push(sizeAction);
		if (self.currentRecording != null)
			self.currentRecording.addAction(sizeAction);
	}

	this.startRecording = function()
	{
		self.currentRecording = new Recording(this);
		self.recordings = new Array();
		self.recordings.push(self.currentRecording);
		self.currentRecording.start();
	}

	this.stopRecording = function()
	{
		if (self.currentRecording != null)
			self.currentRecording.stop();
		self.currentRecording = null;
	}

	this.pauseRecording = function()
	{
		if (self.currentRecording != null)
			self.currentRecording.pause();
	}

	this.resumeRecording = function()
	{
		if (self.currentRecording != null)
			self.currentRecording.resumeRecording();
	}

	this.playRecording = function(onPlayStart, onPlayEnd, onPause, interruptActionStatus)
	{
		if (typeof interruptActionStatus == 'undefined')
			interruptActionStatus = null;

		if (self.recordings.length == 0)
		{
			alert("No recording loaded to play");
			onPlayEnd();
			return;
		}

		self.clearCanvas();

		onPlayStart();

		self.pausedRecIndex = -1;

		for (var rec = 0; rec < self.recordings.length; rec++)
		{
			if (interruptActionStatus != null)
			{
				var status = interruptActionStatus();
				if (status == "stop") {
					pauseInfo = null;
					break;
				}
				else
					if (status == "pause") {
						__onPause(rec-1, onPlayEnd, onPause, interruptActionStatus);
						break;
					}
			}
			self.recordings[rec].playRecording(self.drawActions, onPlayEnd, function(){
				__onPause(rec-1, onPlayEnd, onPause, interruptActionStatus);
			}, interruptActionStatus);
		}
	}

	function __onPause(index, onPlayEnd, onPause, interruptActionStatus)
	{
		pauseInfo = {
			"index": index,
			"onPlayend": onPlayEnd,
			"onPause":onPause,
			"interruptActionStatus": interruptActionStatus
		};
		if (onPause)
			onPause();
	}

	this.resumePlayback = function (onResume)
	{
		if (pauseInfo == null) {
			if (onResume)
				onResume(false);
			return;
		}

		var index = pauseInfo.index;
		var onPlayEnd = pauseInfo.onPlayend;
		var interruptActionStatus = pauseInfo.interruptActionStatus;
		var onPause = pauseInfo.onPause;

		if (self.recordings.length == 0)
		{
			alert("No recording loaded to play");
			onPlayEnd();
			return;
		}

		onResume(true);

		pauseInfo = null;

		for (var rec = index; rec < self.recordings.length; rec++)
		{
			if (interruptActionStatus != null)
			{
				var status = interruptActionStatus();
				if (status == "stop")
					break;
				else if (status == "pause")
				{
					__onPause(rec-1, onPlayEnd, onPause, interruptActionStatus);
					break;
				}
			}
			self.recordings[rec].playRecording(self.drawActions, onPlayEnd, function(){
				__onPause(rec-1, onPlayEnd, onPause, interruptActionStatus);
			},interruptActionStatus);
		}
	}

	this.clearCanvas = function()
	{
		self.ctx.fillStyle = self.bgColor;
		self.ctx.fillRect(0,0,self.canvas.width,self.canvas.height);
	}

	this.removeAllRecordings = function()
	{
		self.recordings = new Array()
		self.currentRecording = null;
	}

	// Draw last points of already created objects
	var drawAlreadyCreatedObjects = function (index,id) {
		for (var rec = index; rec < self.actions.length; rec++) {
			if (self.actions[rec].id == id) {
				return true;
			}
		}
		return false;
	}

	this.drawAction = function (actionArg, addToArray,reDraw,playingVideo)
	{
		if (playingVideo && actionArg.actionType == 4) {
			self.clearCanvas();
			for (var rec = 0; rec < self.actions.length; rec++) {
				if (actionArg.actionType == 4 && !drawAlreadyCreatedObjects(rec + 1, self.actions[rec].id)) {
					self.drawAction(self.actions[rec], false, false, false);
				}
				//else return;
				else if (self.actions[rec].actionType != 4) {
					self.drawAction(self.actions[rec], false, false, false);
				}
			}
		}

		switch (actionArg.actionType)
		{
			case _POINT_ACTION :
				drawPoint(actionArg);
				break;
			case _SET_COLOR_ACTION :
				self.drawingColor = actionArg.color;
				break;
			case _SET_IMAGE :
				drawImage(actionArg);
				break;
			case _SET_STOKE_SIZE:
				self.currentLineWidth = actionArg.size;
			default:
				break;
		}

		if (addToArray) {
			self.actions.push(actionArg);
		}

		if (!playingVideo && reDraw && actionArg.actionType == 4) {
			//debugger;
			reDrawCanvas();
		}
	}

	function drawPoint(actionArg) {
		var x = actionArg.x;
		var y = actionArg.y;
		self.ctx.lineJoin = self.ctx.lineCap = 'round';
		self.ctx.shadowBlur = 1;
		self.ctx.shadowColor = self.drawingColor;
		switch (actionArg.type) {
			case 0: //moveto
				console.log('action type : ',0);
				console.log('action point : ',actionArg );
				self.ctx.beginPath();
				self.ctx.moveTo(x, y);
				self.ctx.strokeStyle = self.drawingColor;
				self.ctx.lineWidth = self.currentLineWidth;
				break;
			case 1: //lineto
				console.log('action type : ',1);
				console.log('action point : ',actionArg);
				var midPoint = midPointBtw(actionArg.bezier,{x:x,y:y});
				//self.ctx.lineTo(x, y);

				self.ctx.quadraticCurveTo(actionArg.bezier.x,actionArg.bezier.y,midPoint.x, midPoint.y);
				self.ctx.stroke();
				break;
		}
	}

	var reDrawCanvas = function(){
		self.clearCanvas();
		for (var rec = 0; rec < self.actions.length; rec++)
		{
			self.drawAction(self.actions[rec], false, false);
		}
	}

	function drawImage(actionArg) {
		var x = actionArg.x;
		var y = actionArg.y;
		var img = new Image();
		img.src = actionArg.url;
		/*var ratioX = canvas.width / image.naturalWidth;
		 var ratioY = canvas.height / image.naturalHeight;
		 var ratio = Math.min(ratioX, ratioY);*/

		self.ctx.drawImage(actionArg.img, 0, 0, img.width, img.height, actionArg.imageX, actionArg.imageY, actionArg.imageWidth, actionArg.imageHeight);
		if (actionArg.withAnchors) {
			drawDragAnchor(actionArg.imageX, actionArg.imageY, actionArg);
			drawDragAnchor(actionArg.imageRight, actionArg.imageY, actionArg);
			drawDragAnchor(actionArg.imageRight, actionArg.imageBottom, actionArg);
			drawDragAnchor(actionArg.imageX, actionArg.imageBottom, actionArg);
		}

		// optionally draw the connecting anchor lines
		if (actionArg.withBorders) {
			self.ctx.beginPath();
			self.ctx.moveTo(actionArg.imageX, actionArg.imageY);
			self.ctx.lineTo(actionArg.imageRight, actionArg.imageY);
			self.ctx.lineTo(actionArg.imageRight, actionArg.imageBottom);
			self.ctx.lineTo(actionArg.imageX, actionArg.imageBottom);
			self.ctx.closePath();
			self.ctx.strokeStyle = '#ff0000';
			self.ctx.stroke();
		}

		self.ctx.strokeStyle = self.drawingColor;


	}

	function midPointBtw(p1, p2) {
		return {
			x: p1.x + (p2.x - p1.x) / 2,
			y: p1.y + (p2.y - p1.y) / 2
		};
	}

	function drawDragAnchor(x,y,actionArg){
		self.ctx.beginPath();
    self.ctx.arc(x, y, actionArg.resizerRadius, 0, actionArg.pi2, false);
    self.ctx.closePath();
		self.ctx.fillStyle = "#ff0000"; //blue
    self.ctx.fill();
	}

	__init = function()
	{
		self.canvas = $("#" + canvasId);
		if (self.canvas.length == 0)
		{
			return;
		}
		self.canvas = self.canvas.get(0);
		self.width = $(self.canvas).width();
		self.height = $(self.canvas).height();
		self.ctx = self.canvas.getContext("2d");

		//$(self.canvas).bind("vmousedown", onMouseDown);
		//$(self.canvas).bind("vmouseup", onMouseUp);
		//$(self.canvas).bind("vmousemove", onMouseMove);

		$(self.canvas).bind("mousedown", onMouseDown);
		$(self.canvas).bind("mouseup", onMouseUp);
		$(self.canvas).bind("mousemove", onMouseMove);
		$(window).on('mouseup',onMouseUp);


		//  var el = document.getElementById(canvasId);
		//el.addEventListener("touchstart", onMouseDown, false);
		//el.addEventListener("touchend", onMouseUp, false);
		////el.addEventListener("touchcancel", handleCancel, false);
		//el.addEventListener("touchmove", onMouseMove, false);
		//console.log("initialized.");

		self.clearCanvas();
	}

	__init();
}















Recording = function (drawingArg)
{
	var self = this;
	this.drawing = drawingArg;

	this.buffer = new Array(); //array of Point objects
	this.timeInterval = 10; //10 miliseconds
	this.currTime = 0;
	this.started = false;
	this.intervalId = null;
	this.currTimeSlot = 0;
	this.actionsSet = null; //of type ActionSet
	this.currActionSet = null;
	this.recStartTime = null;
	this.pauseInfo = null;

	var totalPauseTime = 0;
	var pauseStartTime = 0;

	this.start = function()
	{
		self.currTime = 0;
		self.currTimeSlot = -1;
		self.actionsSet = null;
		self.pauseInfo = null;

		self.recStartTime = (new Date()).getTime();
		self.intervalId = window.setInterval(self.onInterval, self.timeInterval);
		self.started = true;
	}

	this.stop = function()
	{
		if (self.intervalId != null)
		{
			window.clearInterval(self.intervalId);
			self.intervalId = null;
		}
		self.started = false;
	}

	this.pause = function()
	{
		pauseStartTime = (new Date()).getTime();
		window.clearInterval(self.intervalId);
	}

	this.resumeRecording = function() {
		totalPauseTime += (new Date()).getTime() - pauseStartTime;
		pauseStartTime = 0;
		self.intervalId = window.setInterval(self.onInterval, self.timeInterval);
	}

	this.redoRecording = function() {
		totalPauseTime += (new Date()).getTime() - pauseStartTime;
		pauseStartTime = 0;
		self.intervalId = window.setInterval(self.onInterval, self.timeInterval);
	}

	this.undoRecording = function() {
		totalPauseTime += (new Date()).getTime() - pauseStartTime;
		pauseStartTime = 0;
		self.intervalId = window.setInterval(self.onInterval, self.timeInterval);
	}


	this.onInterval = function()
	{
		if (self.buffer.length > 0)
		{
			var timeSlot = (new Date()).getTime() - self.recStartTime - totalPauseTime;

			if (self.currActionSet == null)
			{
				//console.log('current actionset is null');
				self.currActionSet = new ActionsSet(timeSlot, self.buffer);
				//console.log('current actionset is null',self.currActionSet);
				self.actionsSet = self.currActionSet;
			}
			else
			{
				var tmpActionSet = self.currActionSet;
				//console.log('current actionset is not null',tmpActionSet);
				self.currActionSet = new ActionsSet(timeSlot, self.buffer);
				tmpActionSet.next = self.currActionSet;
			}

			self.buffer = new Array();
		}
		self.currTime += self.timeInterval;
	}

	this.addAction = function(actionArg)
	{
		if (!self.started)
			return;
		self.buffer.push(actionArg);
	}

	this.playRecording = function(callbackFunctionArg, onPlayEnd, onPause, interruptActionStatus)
	{
		if (self.actionsSet == null)
		{
			if (typeof onPlayEnd != 'undefined' && onPlayEnd != null)
				onPlayEnd();
			return;
		}

		self.scheduleDraw(self.actionsSet,self.actionsSet.interval,callbackFunctionArg, onPlayEnd, onPause, true, interruptActionStatus);
	}

	this.scheduleDraw = function (actionSetArg, interval, callbackFunctionArg, onPlayEnd, onPause, isFirst, interruptActionStatus)
	{
		window.setTimeout(function(){
			var status = "";
			if (interruptActionStatus != null)
			{
				status = interruptActionStatus();
				if (status == 'stop')
				{
					self.pauseInfo = null;
					onPlayEnd();
					return;
				}
			}

			if (status == "pause")
			{
				self.pauseInfo = {
					"actionset":actionSetArg,
					"callbackFunc":callbackFunctionArg,
					"onPlaybackEnd":onPlayEnd,
					"onPause":onPause,
					"isFirst":isFirst,
					"interruptActionsStatus":interruptActionStatus
				};

				if (onPause)
					onPause();
				return;
			}

			var intervalDiff = -1;
			var isLast = true;
			if (actionSetArg.next != null)
			{
				isLast = false;
				intervalDiff = actionSetArg.next.interval - actionSetArg.interval;
			}
			if (intervalDiff >= 0)
				self.scheduleDraw(actionSetArg.next, intervalDiff, callbackFunctionArg, onPlayEnd, onPause, false,interruptActionStatus);

			self.drawActions(actionSetArg.actions, onPlayEnd, isFirst, isLast);
		},interval);
	}

	this.resume = function()
	{
		if (!self.pauseInfo)
			return;

		self.scheduleDraw(self.pauseInfo.actionset, 0,
			self.pauseInfo.callbackFunc,
			self.pauseInfo.onPlaybackEnd,
			self.pauseInfo.onPause,
			self.pauseInfo.isFirst,
			self.pauseInfo.interruptActionsStatus);

		self.pauseInfo = null;
	}

	this.drawActions = function (actionArray, onPlayEnd, isFirst, isLast)
	{
		for (var i = 0; i < actionArray.length; i++)
			self.drawing.drawAction(actionArray[i],true,true,true);

		if (isLast)
		{
			self.drawing.actions = new Array();
			onPlayEnd();
		}
	}
}






















_POINT_ACTION = 1;
_SET_COLOR_ACTION = 2;
_SET_STOKE_SIZE = 3;
_SET_IMAGE = 4;

//Action Types
//	1 - Point
//	2 = SetColor
Action = function()
{
	var self = this;
	this.actionType; // 1 - Point, other action types could be added later
	this.x = 0;
	this.y = 0;
	this.isMovable = false;

	if (arguments.length > 0)
	{
		self.actionType = arguments[0];
	}
	if (arguments.length > 2)
	{
		self.x = arguments[1];
		self.y = arguments[2];
	}
}

Point = function (argX,argY,typeArg,bezier)
{
	var self = this;
	this.type = typeArg; //0 - moveto, 1 - lineto
	this.bezier = {
		x: bezier ? bezier.x : argX,
		y: bezier ? bezier.y : argY
	}

	Action.call(this,_POINT_ACTION,argX,argY);
}

Point.prototype = new Action();

ActionsSet = function (interalArg, actionsArrayArg)
{
	var self = this;

	this.actions = actionsArrayArg;
	this.interval = interalArg;
	this.next = null;
}

SetColor = function (colorValue)
{
	var self = this;
	this.color = colorValue;

	Action.call(this,_SET_COLOR_ACTION);
}
SetColor.prototype = new Action();

SetStokeSize = function (sizeArg)
{
	var self = this;
	this.size = sizeArg;

	Action.call(this,_SET_STOKE_SIZE);
}
SetStokeSize.prototype = new Action();

SetImage = function (url,argX,argY,typeArg,elementId) //typeArg is for dragging to a new point or not
{
	var self = this;
	this.img = new Image();
		self.img.src = url;
	self.img.onload = function () {
		console.log('************************************************************************************************************************************')
	}
	this.url = url;
	this.id = elementId;
	this.imageWidth = self.img.width * 0.50;
	this.imageHeight = self.img.height * 0.50;
	this.imageX = 100;
	this.imageY = 100;
	this.imageRight = this.imageX + this.imageWidth;
	this.imageBottom = this.imageY + this.imageHeight;
	this.draggingImage = false;
	this.pi2 = Math.PI * 2;
	this.resizerRadius = 6;
	this.rr = this.resizerRadius * this.resizerRadius;
	this.draggingResizer = {
		x: 0,
		y: 0
	};
	this.startX = 0;
	this.created = false;
	this.startY = 0;
	this.withAnchors = true;
	this.withBorders = false;
	//this.size = sizeArg;
  //this.rotate = rotateArg;

	Action.call(this,_SET_IMAGE,argX,argY,typeArg);
}
SetImage.prototype = new Action();