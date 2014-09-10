/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "simplepen",
	name : "ペン",
	element : null,
	parent : null,
	setFolder : "pen",
	defaults : [4,"#000000"],
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":parentElement.colorpicker,
			"pressure":true,
			"complete":true
		};
		context.globalCompositeOperation = "source-over";
		context.globalAlpha = 1.0;
		context.strokeStyle = parentElement.colorpicker; 
		context.lineWidth = current["size"];
		context.shadowColor = parentElement.colorpicker;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 2;
		context.lineCap = "round";
		
		return current;
	},
	prepare : function (event, context, pressure2){
	},
	drawMain : function(context,startX,startY,offsetX,offsetY,event,parentElement){
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(offsetX, offsetY);
		context.stroke();
	},
	initialize : function(parentelement,ownelement){
		this.parent = parentelement;
		this.element = ownelement;
	},
	
});