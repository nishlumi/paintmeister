/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "calligraphy",
	name : {
		"ja":"カリグラフィ",
		"en":"Calligraphy",
		"eo":"Kaligrafio"
	},
	element : null,
	parent : null,
	setFolder : "pen",
	defaults : [12,"#000000"],
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":parentElement.colorpicker,
			"pressure":true,
			"complete":false,
			"delay" : 1,
			"delay_assist" : true
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
		temppressure = temppressure * 0.3;
		//---Editable end
		return {
			"pressure" : temppressure,
			"context" : tempcontext
		};
	},
	drawMain : function(context,startX,startY,offsetX,offsetY,event,parentElement){
		var hairStX = 0;
		var hairStY = 0;
		var hairX = 0;
		var hairY = 0;
		var hairDist = 0;
		var hair_outblur = 0;
		var hairWidth = context.lineWidth / 12; //pen.current["size"];
		context.lineWidth = hairWidth;
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(offsetX, offsetY);
		context.stroke();
		hairStX = startX;
		hairStY = startY;
		hairX = offsetX;
		hairY = offsetY;
		hairDist = 0.5;
		hair_outblur = context.shadowBlur;
		var ueCPX = 0, shitaCPX = 0;
		if (parentElement["pointHistory"].length > 0) {
			ueCPX = parentElement["pointHistory"][0].x;
			ueCPY = parentElement["pointHistory"][0].y;
			shitaCPX = parentElement["pointHistory"][0].x;
			shitaCPY = parentElement["pointHistory"][0].y;
		}
		var ueStX = startX, shitaStX = startX;
		var ueStY = startY, shitaStY = startY;
		var ueX = offsetX, shitaX = offsetX;
		var ueY = offsetY, shitaY = offsetY;
		//---毛先は細かく複数
		for (var i = 0; i < 5; i++) {
			ueCPX = ueCPX + (hairWidth * 1);
			ueCPY = ueCPY - (hairWidth * 1);
			ueStX = ueStX + (hairWidth * 1);
			ueStY = ueStY - (hairWidth * 1);
			ueX = ueX + (hairWidth * 1);
			ueY = ueY - (hairWidth * 1);
			
			shitaCPX = shitaCPX - (hairWidth * 1);
			shitaCPY = shitaCPY + (hairWidth * 1);
			shitaStX = shitaStX - (hairWidth * 1);
			shitaStY = shitaStY + (hairWidth * 1);
			shitaX = shitaX - (hairWidth * 1);
			shitaY = shitaY + (hairWidth * 1);
			if (i == 5) context.shadowBlur = 1;
			context.lineWidth = hairWidth;
			console.log("ueCP=" + ueCPX + "x" + ueCPY);
			console.log("shitaCP=" + shitaCPX + "x" + shitaCPY);
			console.log("ueSt=" + ueStX + "x" + ueCPY);
			console.log("shitaSt=" + shitaStX + "x" + shitaStY);
			console.log("ue  =" + ueX + "x" + ueY);
			console.log("shita  =" + shitaX + "x" + shitaY);
			if (parentElement["pointHistory"].length == 0) {
				context.beginPath();
				context.moveTo(ueStX,ueStY);
				context.lineTo(ueX, ueY);
				context.stroke();
				context.beginPath();
				context.moveTo(shitaStX,shitaStY);
				context.lineTo(shitaX, shitaY);
				context.stroke();
			}else{
				context.beginPath();
				context.moveTo(ueCPX,ueCPY);
				context.quadraticCurveTo(ueStX,ueStY, ueX, ueY);
				context.stroke();
				context.beginPath();
				context.moveTo(shitaCPX,shitaCPY);
				context.quadraticCurveTo(shitaStX,shitaStY, shitaX, shitaY);
				context.stroke();
			}
			context.closePath();
		}
		return;
		
		//---old
		//毛先上
		for (var i = 0; i < 5; i++) {
			hairX = hairX + (hairWidth * 1);
			hairY = hairY - (hairWidth * 1);
			hairStX = hairStX + (hairWidth * 1);
			hairStY = hairStY - (hairWidth * 1);
			//hairWidth = hairWidth * hairDist;
			if (i == 5) context.shadowBlur = 1;
			context.lineWidth = hairWidth;
			context.moveTo(hairStX,hairStY);
			context.lineTo(hairX, hairY);
			context.stroke();
		}
		//毛先下
		context.shadowBlur = hair_outblur;
		hairStX = startX;
		hairStY = startY;
		hairX = offsetX;
		hairY = offsetY;
		//hairWidth = pen.current["size"];
		for (var i = 0; i < 5; i++) {
			hairX = hairX - (hairWidth * 1);
			hairY = hairY + (hairWidth * 1);
			hairStX = hairStX - (hairWidth * 1);
			hairStY = hairStY + (hairWidth * 1);
			//hairWidth = hairWidth * hairDist;
			if (i == 5) context.shadowBlur = 1;
			context.lineWidth = hairWidth;
			context.moveTo(hairStX,hairStY);
			context.lineTo(hairX, hairY);
			context.stroke();
		}
	},
	initialize : function(parentelement,ownelement){
		this.parent = parentelement;
		this.element = ownelement;
	},
	
});