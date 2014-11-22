/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "airbrush",
	name : {
		"ja" :"エアブラシ",
		"en" :"Air brush",
		"eo" :"Aerbroso"
	},
	element : null,
	parent : null,
	setFolder : "brush",
	defaults : [20,"#000000"],
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":parentElement.colorpicker,
			"pressure":true,
			"complete":true,
			"delay" : 0,
			"delay_assist" : true
		};
		context.globalCompositeOperation = "source-over";
		context.globalAlpha = 1.0;
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
		//---エアブラシの筆圧感度を下げる。（強くペンを当てないと濃く描けないようにする）
		temppressure = temppressure * 0.5;
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
		var bakalp = context.globalAlpha;

		var StXarr = [];
		var StYarr = [];
		var Xarr = [];
		var Yarr = [];
		var alparr = [];
		var widarr = [];
		var shadowarr = [];
		var compoarr = [];
		var caparr = [];
        var Xdir = -1, Ydir = -1;
        if (startX > offsetX) {
            Xdir = 1;
        } else if (startX == offsetX) {
            Xdir = 0;
        }
        if (startY > offsetY) {
            Ydir = 1;
        } else if (startY == offsetY) {
            Ydir = 0;
        }
		
		//---new
		context.globalCompositeOperation = "";
		context.globalAlpha = 0.08 * hairpressure * 1;
		context.lineCap = "round";
		if (hairpressure < 0.5) {
			context.lineWidth = parentElement.current["size"] * (hairpressure * 6);
		}else{
			context.lineWidth = parentElement.current["size"] * (hairpressure * 2);
		}
		context.shadowOffsetX = 5 * Xdir;
		context.shadowOffsetY = 5 * Ydir;
		context.shadowBlur = 1;
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(offsetX, offsetY);
		context.stroke();
		//---エアブラシ中身
		context.globalAlpha = 0.015 * hairpressure * 1;
		context.shadowBlur = 0;
		context.lineCap = "butt";
		for (var i = 0; i < 4; i++) {
			context.lineWidth *= 0.7;
			context.beginPath();
			context.moveTo(startX, startY);
			context.lineTo(offsetX, offsetY);
			context.stroke();
		}
		
		context.globalAlpha = bakalp;
	},
	initialize : function(parentelement,ownelement){
		this.parent = parentelement;
		this.element = ownelement;
	},
	
});