/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "fudepen",
	name : {
		"ja":"筆ペン",
		"en":"Ink brush pen",
		"eo":"Inkbrosa plumo"
	},
	element : null,
	parent : null,
	setFolder : "pen",
	defaults : [10,"#000000"],
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":parent.colorpicker.value,
			"pressure":true,
			"complete":true,
			"delay" : 0,
			"delay_assist" : false
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
		var tempcontext = context;
		var temppressure = pressure2;
		//---Editable begin
		//---鉛筆の筆圧感度を下げる。（強くペンを当てないと濃く描けないようにする）
		temppressure = temppressure * 0.4;
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
		if (parentElement["pointHistory"].length > 0) {
			hairpressure = parentElement["pointHistory"][0].pressure;
		}
		var hairStX = 0;
		var hairStY = 0;
		var hairX = 0;
		var hairY = 0;
		var hairWidth = 0;
		var hairDist = 0;
		var hair_outblur = 0;
		context.lineWidth = context.lineWidth * hairpressure * 2;
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(offsetX, offsetY);
		context.stroke();
		hairStX = startX;
		hairStY = startY;
		hairX = offsetX;
		hairY = offsetY;
		hairWidth = context.lineWidth;
		hairDist = 0.3;
		//---毛先は中心と、上下3つ
		//---new
		var ueCPY = 0, shitaCPY = 0;
		var hairCPX = 0;
		if (parentElement["pointHistory"].length > 0) {
			hairCPX = parentElement["pointHistory"][0].x;
			ueCPY = parentElement["pointHistory"][0].y;
			shitaCPY = parentElement["pointHistory"][0].y;
		}
		//毛先上
		var hairheadcnt = 7 * hairpressure;
		var ueStY = startY, shitaStY = startY;
		var ueY = offsetY, shitaY = offsetY;
		for (var i = 0; i < hairheadcnt; i++) {
			//hairX = hairX - (this.context.lineWidth * hairDist);
			ueCPY = ueCPY - (hairWidth * hairDist*2);
			shitaCPY = shitaCPY + (hairWidth * hairDist*2);
			//---
			ueY = ueY - (hairWidth * hairDist*2);
			shitaY = shitaY + (hairWidth * hairDist*2);
			//---
			//hairStX = hairStX - (this.context.lineWidth * hairDist);
			ueStY = ueStY - (hairWidth * hairDist*2);
			shitaStY = shitaStY + (hairWidth * hairDist*2);
			hairWidth = hairWidth * (hairDist + hairDist);
			//console.log("上:" + i);
			//console.log("calc="+(hairWidth * hairDist*2));
			//console.log(hairStX + ":" + hairStY);
			//console.log(hairX + ":" + hairY);
			context.beginPath();
			if (parentElement["pointHistory"].length == 0) {
				context.lineWidth = hairWidth * hairpressure * 2;
				context.moveTo(hairStX,ueStY);
				context.lineTo(hairX, ueY);
				context.stroke();
				context.beginPath();
				context.lineWidth = hairWidth * hairpressure * 2;
				context.moveTo(hairStX,shitaStY);
				context.lineTo(hairX, shitaY);
			}else{
				context.lineWidth = hairWidth * hairpressure * 2;
				context.moveTo(hairCPX,ueCPY);
				context.quadraticCurveTo(hairStX,ueStY, hairX, ueY);
				context.stroke();
				context.beginPath();
				context.lineWidth = hairWidth * hairpressure * 2;
				context.moveTo(hairCPX,shitaCPY);
				context.quadraticCurveTo(hairStX,shitaStY, hairX, shitaY);
			}
			context.stroke();
		}
		return;

		//--old
		for (var i = 0; i < hairheadcnt; i++) {
			//hairX = hairX - (this.context.lineWidth * hairDist);
			hairY = hairY - (hairWidth * hairDist*2);
			//hairStX = hairStX - (this.context.lineWidth * hairDist);
			hairStY = hairStY - (hairWidth * hairDist*2);
			hairWidth = hairWidth * (hairDist + hairDist);
			console.log("上:" + i);
			console.log("calc="+(hairWidth * hairDist*2));
			console.log(hairStX + ":" + hairStY);
			console.log(hairX + ":" + hairY);
			context.beginPath();
			context.lineWidth = hairWidth * hairpressure * 2;
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
		for (var i = 0; i < hairheadcnt; i++) {
			//hairX = hairX + (context.lineWidth * hairDist);
			hairY = hairY + (hairWidth * hairDist*3*2);
			//hairStX = hairStX + (context.lineWidth * hairDist);
			hairStY = hairStY + (hairWidth * hairDist*3*2);
			hairWidth = hairWidth * (hairDist + hairDist);
			console.log("下:" + i);
			console.log("calc="+(hairWidth * hairDist*3*2));
			console.log(hairStX + ":" + hairStY);
			console.log(hairX + ":" + hairY);
			context.beginPath();
			context.lineWidth = hairWidth * hairpressure * 2;
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