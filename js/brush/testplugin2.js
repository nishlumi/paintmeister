/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "testbru2",
	name : {
		"ja":"草ペン",
		"en":"Glass pen"
	},
	element : null,
	parentElement : null,
	setFolder : "pen",
	defaults : [3,"#000000"],
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":parent.colorpicker,
			"pressure":false,
			"complete":false
		};
		context.globalCompositeOperation = "source-over";
		context.globalAlpha = 1.0;
		context.strokeStyle = parentElement.colorpicker; 
		context.lineWidth = current["size"];
		context.shadowColor = parentElement.colorpicker;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 0;
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
		//---Editable begin
		context.lineWidth = parentElement.current["size"];
		var hairpressure = parentElement.lastpressure  ? parentElement.lastpressure : 1 ;
		if (hairpressure == 0) {
			hairpressure = 0.001;
		}else if (hairpressure == undefined) {
			hairpressure = 1;
		}
		
		var thundernum = Math.round(6 * hairpressure);
		var tx, ty;
		var sax, say;
		var repx, repy;
		var pmflagx, pmflagy;
		if (startX < offsetX) {
			tx = startX;
			sax = offsetX - startX;
			pmflagx = -1;
		}else{
			tx = offsetX;
			sax = startX - offsetX;
			pmflagx = 1;
		}
		repx = sax / context.lineWidth;
		if (thundernum < repx) repx = thundernum;
		if (startY < offsetY) {
			ty = startY;
			say = offsetY - startY;
			pmflagy = -1;
		}else{
			ty = offsetY;
			say = startY - offsetX;
			pmflagy = 1;
		}
		repy = say / context.lineWidth;
		if (thundernum < repy) repy = thundernum;
		
		tx = startX;
		ty = startY;
		/*for (var i = 0; i < repx; i++) {
			var rx = Math.round(Math.random() * 10);
			var dx = tx * (rx < 5 ? 1 : -1) + (rx*2);
			for (var j = 0; j < repy; j++) {
				var ry = Math.round(Math.random() * 10);
				var dy = ty * (ry < 5 ? 1 : -1) + (ry*2);
				context.globalAlpha = 1 * hairpressure;
				context.beginPath();
				context.moveTo(tx, ty);
				context.lineTo(dx, dy);
				context.stroke();
				context.closePath();
				ty = dy;
			}
			tx = dx;
			
		}*/
		var rx = Math.round(Math.random() * 10);
		var dx = (rx < 5 ? 1 : -1);
		var ry = Math.round(Math.random() * 10);
		var dy = (ry < 5 ? 1 : -1);
		context.globalAlpha = 0.5 * hairpressure;
		context.beginPath();
		//context.moveTo(tx + (rx * dx), ty + (ry * dy));
		//context.lineTo(offsetX, offsetY);
		context.moveTo(tx + (rx * context.lineWidth * hairpressure), ty + (ry * context.lineWidth * hairpressure));
		context.lineTo(offsetX + (rx * dx), offsetY + (ry * dy));
		context.stroke();
	},
	initialize : function(parent,ownelement){
		this.parentElement = parent;
		this.element = ownelement;
	},
	
});