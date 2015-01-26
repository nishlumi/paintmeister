/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "testbru3",
	name : {
		"ja":"色替え+ぼかし",
		"en":"Color change + Blur",
		"eo":"Kolorŝanĝo + Nebuli"
	},
	element : null,
	parent : null,
	setFolder : "special",
	defaults : [15,"#000000"],
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":"#FFFFFF",
			"pressure":true,
			"complete":false
		};
		context.globalCompositeOperation = "source-atop";
		context.globalAlpha = 1.0;
		var clr = new RGBColor(parentElement.colorpicker);
		context.strokeStyle = clr.toRGBA(0.0); //parentElement.colorpicker; 
		context.lineWidth = current["size"];
		context.shadowColor = clr.toRGBA(0.3); //parentElement.colorpicker;
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
		context.lineWidth = parentElement.current["size"];
		var hairpressure = parentElement.lastpressure  ? parentElement.lastpressure : 1 ;
		if (hairpressure == 0) {
			hairpressure = 0.001;
		}else if (hairpressure == undefined) {
			hairpressure = 1;
		}
		if (hairpressure > 0.5) hairpressure = 0.5;
		context.beginPath();
		//context.moveTo(startX, startY);
		//context.lineTo(offsetX, offsetY);
		//context.stroke();
		var i = startX;
		var j = startY;
		var clr = new RGBColor(parentElement.current["color"]);
		context.shadowOffsetY = offsetY * 2;
		context.shadowColor = clr.toRGBA(1 * hairpressure);
		context.arc(offsetX, offsetY * -1, parentElement.current["size"], 0, Math.PI * 2);
		context.fill();

	},
	initialize : function(parentelement,ownelement){
		this.parent = parentelement;
		this.element = ownelement;
	},
	
});