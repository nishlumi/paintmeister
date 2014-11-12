/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "simplepen",
	name : {
		"ja":"ペン",
		"en":"Pen"
	},
	element : null,
	parent : null,
	setFolder : "pen",
	defaults : [4.5,"#000000"],
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
		context.shadowBlur = 1;
		context.lineCap = "round";
		context.lineJoin = "round";
		
		return current;
	},
	prepare : function (event, context, pressure2){
		var tempcontext = context;
		var temppressure = pressure2;
		//---Editable begin
		//---ペンの筆圧感度を下げる。（強くペンを当てないと濃く描けないようにする）
		temppressure = temppressure * 0.8;
		//---Editable end
		return {
			"pressure" : temppressure,
			"context" : tempcontext
		};
	},
	drawMain : function(context,startX,startY,offsetX,offsetY,event,parentElement){
		var hairpressure = parentElement.lastpressure  ? parentElement.lastpressure : 1 ;
		if (hairpressure == 0) {
			hairpressure = 0.001;
		}else if (hairpressure == undefined) {
			hairpressure = 1;
		}
		context.lineWidth = parentElement.current["size"] * hairpressure;
		
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