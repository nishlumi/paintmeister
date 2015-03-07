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
		var clr = new RGBColor(parentElement.colorpicker);
		context.strokeStyle = clr.toRGBA(0.0); //parentElement.colorpicker; 
		context.fillStyle = clr.toRGBA(0.0); //parentElement.colorpicker; 
		context.lineWidth = current["size"];
		context.shadowColor = clr.toRGBA(1.0); //parentElement.colorpicker;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 10;
		context.lineCap = "butt";
		
		return current;
	},
	prepare : function (event, context, pressure2){
		var tempcontext = context;
		var temppressure = pressure2;
		//---Editable begin
		//---エアブラシの筆圧感度を下げる。（強くペンを当てないと濃く描けないようにする）
		temppressure = temppressure * 0.6;
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
		
		var clr = new RGBColor(parentElement.current["color"]);
		context.strokeStyle = clr.toRGBA(0.0);
		context.fillStyle = clr.toRGBA(0.0);
		context.shadowOffsetY = (offsetY) * 2;
		context.shadowColor = clr.toRGBA(0.5 * hairpressure);
		context.shadowBlur = 10 * hairpressure;
		context.beginPath();
		context.arc(offsetX, (offsetY ) * -1 , parentElement.current["size"], 0, Math.PI * 2);
		context.fill();
		return;

		var bakalp = context.globalAlpha;
		var haircolor = [null,null,null,null];
		for (var i = 0; i < haircolor.length; i++) {
			haircolor[i] = new RGBColor(parentElement.current["color"]);
			/*if (i < 2) {
				haircolor[i].setR(haircolor[i].r * 1.5);
				haircolor[i].setG(haircolor[i].g * 1.5);
				haircolor[i].setB(haircolor[i].b * 1.5);
			}*/
		}

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
		context.globalCompositeOperation = "source-over";
		//context.globalAlpha = 0.08 * hairpressure * 1;
		context.strokeStyle = haircolor[haircolor.length-1].toRGBA(0.08 * hairpressure * 1);
		context.lineCap = "round";
		if (hairpressure < 0.5) {
			context.lineWidth = parentElement.current["size"] * (hairpressure * 7);
		}else{
			context.lineWidth = parentElement.current["size"] * (hairpressure * 6);
		}
		context.shadowOffsetX = 5 * Xdir;
		context.shadowOffsetY = 5 * Ydir;
		context.shadowBlur = 0;
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(offsetX, offsetY);
		context.stroke();
		//---エアブラシ中身
		//context.globalAlpha = 0.75 * hairpressure * 1;
		context.shadowBlur = 5;
		context.lineCap = "butt";
		for (var i = 0; i < 4; i++) {
			context.strokeStyle = haircolor[i].toRGBA(0.02 * hairpressure * 1);
			//context.lineWidth *= 0.7;
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