/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "neonpen",
	name : {
		"ja":"ネオンペン",
		"en":"Neon pen",
		"eo":"Neonplumo"
	},
	element : null,
	parent : null,
	setFolder : "pen",
	defaults : [5,"#000000"],
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":parentElement.colorpicker,
			"pressure":true,
			"complete":true,
			"delay" : 0,
			"delay_assist" : false
		};
		context.globalCompositeOperation = "source-over";
		context.globalAlpha = 0.85;
		context.strokeStyle = parentElement.colorpicker; 
		context.lineWidth = current["size"];
		context.shadowColor = parentElement.colorpicker;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 10;
		context.lineCap = "round";
		
		return current;
	},
	prepare : function (event, context, pressure2){
		var tempcontext = context;
		var temppressure = pressure2;
		//---Editable begin
		//---Editable end
		return {
			"pressure" : temppressure,
			"context" : tempcontext
		};
	},
	drawMain : function(context,startX,startY,offsetX,offsetY,event,parentElement){
		context.beginPath();
		if (parentElement["pointHistory"].length == 0) {
			context.moveTo(startX, startY);
			context.lineTo(offsetX, offsetY);
		}else{
			context.moveTo(parentElement["pointHistory"][0].x, parentElement["pointHistory"][0].y);
			context.quadraticCurveTo(startX, startY, offsetX, offsetY);
		}
		context.stroke();
	},
	initialize : function(parentelement,ownelement){
		this.parent = parentelement;
		this.element = ownelement;
	},
	
});