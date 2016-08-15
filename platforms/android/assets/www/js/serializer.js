/*
* @author : Ram Kulkarni (http://ramkulkarni.com)
*/

function serializeDrawing (drawingObj)
{
	if (drawingObj.recordings.length == 0)
		return "";

	var modifiedRecordings = new Array();

	for (var i = 0; i < drawingObj.recordings.length; i++)
	{
		modifiedRecordings.push(serializeRecording(drawingObj.recordings[i]));
	}

	return JSON.stringify(modifiedRecordings);
}

function serializeRecording (recording)
{
	var recordingWrp = new RecordingWrapper();

	var currActionSet = recording.actionsSet;

	while (currActionSet != null)
	{
		recordingWrp.actionsets.push(serializeActionSet(currActionSet));
		currActionSet = currActionSet.next;
	}

	return recordingWrp;
}

function serializeActionSet (actionSet)
{
	var actionSetWrp = new ActionSetWrapper();
	actionSetWrp.interval = actionSet.interval;
	for (var i = 0; i < actionSet.actions.length; i++)
	{
		var actionWrp = serializeAction(actionSet.actions[i]);
		if (actionWrp != null)
			actionSetWrp.actions.push(actionWrp);
	}
	return actionSetWrp;
}

function serializeAction (action)
{
	switch (action.actionType)
	{
		case 1: //Point Action
			return serializePoint (action);
		case 2: //SeColor Action
			return {actionType : 2,
					color : action.color};
		case 3: //Set Stroke Size
			return {actionType : 3,
					size : action.size};
		case 4: //Set Image on canvas
			return serializeDrawImage (action);
	}
	return null;
}

function serializePoint (point)
{
	var pointWrp = new PointWrapper();
	pointWrp.type = point.type;
	pointWrp.actionType = point.actionType;
	pointWrp.bezier = {};
	pointWrp.bezier.x = point.bezier.x;
	pointWrp.bezier.y = point.bezier.y;
	pointWrp.x = point.x;
	pointWrp.y = point.y;
	pointWrp.isMovable = point.isMovable;

	return pointWrp;
}
function serializeDrawImage (img)
{
	var imageWrp = new SetImage();
	imageWrp.type = img.type;
	imageWrp.actionType = img.actionType;
	imageWrp.x = img.x;
	imageWrp.y = img.y;
	imageWrp.url = img.url;
	imageWrp.isMovable = img.isMovable;
	imageWrp.img = new Image();
	imageWrp.img.src = img.url;
	imageWrp.id = img.id;
	imageWrp.imageWidth = img.imageWidth;
	imageWrp.imageHeight = img.imageHeight;
	imageWrp.imageX = img.imageX;
	imageWrp.imageY = img.imageY;
	imageWrp.imageRight = img.imageRight;
	imageWrp.imageBottom = img.imageBottom;
	imageWrp.draggingImage = img.draggingImage;
	imageWrp.pi2 = img.pi2;
	imageWrp.resizerRadius = img.resizerRadius;
	imageWrp.rr = img.rr;
	imageWrp.draggingResizer = img.draggingResizer;
	imageWrp.startX = img.startX;
	imageWrp.created = img.created;
	imageWrp.startY = img.startY;
	imageWrp.withAnchors = img.withAnchors;
	imageWrp.withBorders = img.withBorders;

	//imageWrp.img.onload = function () {
	  return imageWrp;
	//}
}

function deserializeDrawing (serData)
{
	try
	{
		var recordings = JSON.parse(serData);
		var result = new Array();
		if (recordings instanceof Array )
		{
			for (var i = 0; i < recordings.length; i++)
			{
				var rec = deserializeRecording(recordings[i]);
				if (rec != null)
					result.push(rec);
			}
		}

		return result;
	}
	catch (e)
	{
		return "Error : " + e.message;
	}

	return null;
}

function deserializeRecording(recordingWrp)
{
	var rec = new Recording();

	var prevActionSet = null;
	for (var i = 0; i < recordingWrp.actionsets.length; i++)
	{
		var actionSet = deserializeActionSet(recordingWrp.actionsets[i]);
		if (actionSet != null)
		{
			if (prevActionSet == null)
				rec.actionsSet = actionSet;
			else
				prevActionSet.next = actionSet;
			prevActionSet = actionSet;
		}
	}

	return rec;
}

function deserializeActionSet(actionSetWrp)
{
	var actionSet = new ActionsSet();
	actionSet.actions = new Array();
	actionSet.interval = actionSetWrp.interval;
	for (var i = 0; i < actionSetWrp.actions.length; i++)
	{
		var action = deserializeAction(actionSetWrp.actions[i]);
		if (action != null)
			actionSet.actions.push(action);
	}

	return actionSet;
}

function deserializeAction (actionWrp)
{
	//console.log('desearlize : ',actionWrp);
	switch (actionWrp.actionType)
	{
		case 1: //Point action
			return deserializePoint(actionWrp);
		case 2: //SetColor action
			return new SetColor(actionWrp.color);
		case 3: //Set Stroke Size
			return new SetStokeSize(actionWrp.size);
		case 4: //Point action
			return deserializeDrawImage(actionWrp);
	}
	return null;
}

function deserializePoint (pointWrp)
{
	var point = new Point();
	point.type = pointWrp.type;
	point.x = pointWrp.x;
	point.y = pointWrp.y;
	point.bezier = {};
	point.bezier.x = pointWrp.bezier.x;
	point.bezier.y = pointWrp.bezier.y;

	point.actionType = pointWrp.actionType;
	point.isMovable = pointWrp.isMovable;

	return point;
}
function deserializeDrawImage (img)
{
	var imageWrp = new SetImage();
	imageWrp.type = img.type;
	imageWrp.x = img.x;
	imageWrp.y = img.y;
	imageWrp.actionType = img.actionType;
	imageWrp.isMovable = img.isMovable;
	imageWrp.url = img.url;
	imageWrp.img = new Image();
	imageWrp.img.src = img.url
	imageWrp.id = img.id;
	imageWrp.imageWidth = img.imageWidth;
	imageWrp.imageHeight = img.imageHeight;
	imageWrp.imageX = img.imageX;
	imageWrp.imageY = img.imageY;
	imageWrp.imageRight = img.imageRight;
	imageWrp.imageBottom = img.imageBottom;
	imageWrp.draggingImage = img.draggingImage;
	imageWrp.pi2 = img.pi2;
	imageWrp.resizerRadius = img.resizerRadius;
	imageWrp.rr = img.rr;
	imageWrp.draggingResizer = img.draggingResizer;
	imageWrp.startX = img.startX;
	imageWrp.created = img.created;
	imageWrp.startY = img.startY;
	imageWrp.withAnchors = img.withAnchors;
	imageWrp.withBorders = img.withBorders;
	//imageWrp.img.onload = function () {
	  return imageWrp;
	//}

}

function RecordingWrapper()
{
	var self = this;
	this.actionsets = new Array();
}

function ActionSetWrapper()
{
	var self = this;
	this.actions = new Array();
	this.interval = 0;
}

function ActionWapper()
{
	var self = this;
	this.actionType; // 1 - Point, other action types could be added later
	this.x = 0;
	this.y = 0;
	this.isMovable = false;
}

function PointWrapper()
{
	var self = this;
	this.type ; //0 - moveto, 1 - lineto
}

PointWrapper.prototype = new ActionWapper();