/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "fudepen",
	name : "筆ペン",
	element : null,
	parent : null,
	setFolder : "pen",
	defaults : [12,"#000000"],
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":parent.colorpicker.value,
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
		var hairStX = 0;
		var hairStY = 0;
		var hairX = 0;
		var hairY = 0;
		var hairWidth = 0;
		var hairDist = 0;
		var hair_outblur = 0;
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(offsetX, offsetY);
		context.stroke();
		hairStX = startX;
		hairStY = startY;
		hairX = offsetX;
		hairY = offsetY;
		hairWidth = context.lineWidth;
		hairDist = 0.4;
		//---毛先は中心と、上下3つ
		//毛先上
		for (var i = 0; i < 3; i++) {
			//hairX = hairX - (this.context.lineWidth * hairDist);
			hairY = hairY - (hairWidth * hairDist);
			//hairStX = hairStX - (this.context.lineWidth * hairDist);
			hairStY = hairStY - (hairWidth * hairDist);
			hairWidth = hairWidth * (hairDist + hairDist);
			context.lineWidth = hairWidth;
			context.moveTo(hairStX,hairStY);
			context.lineTo(hairX, hairY);
			context.stroke();
		}
		//毛先下
		hairStX = startX;
		hairStY = startY;
		hairX = offsetX;
		hairY = offsetY;
		hairWidth = context.lineWidth;
		for (var i = 0; i < 3; i++) {
			//hairX = hairX + (context.lineWidth * hairDist);
			hairY = hairY + (hairWidth * hairDist * 2);
			//hairStX = hairStX + (context.lineWidth * hairDist);
			hairStY = hairStY + (hairWidth * hairDist * 2);
			hairWidth = hairWidth * (hairDist + hairDist);
			context.lineWidth = hairWidth;
			context.moveTo(hairStX,hairStY);
			context.lineTo(hairX, hairY);
			context.stroke();
		}
	},
	initialize : function(parent,ownelement){
		this.parentElement = parent;
		this.element = ownelement;
	},
	
});