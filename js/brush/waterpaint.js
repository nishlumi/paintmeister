/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "waterpaint",
	name : {
		"ja":"水彩",
		"en":"Water paint"
	},
	element : null,
	parent : null,
	setFolder : "brush",
	defaults : [15,"#000000"],
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":parentElement.colorpicker,
			"pressure":true,
			"complete":true
		};
		context.globalCompositeOperation = "lighter";
		context.globalAlpha = 1.0;
		context.strokeStyle = parentElement.colorpicker; 
		context.lineWidth = current["size"];
		context.shadowColor = parentElement.colorpicker;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 10;
		context.lineCap = "round";
		context.lineJoin = "round";
		
		return current;
	},
	prepare : function (event, context, pressure2){
		var tempcontext = context;
		var temppressure = pressure2;
		//---Editable begin
		//---水彩の筆圧感度を下げる。（強くペンを当てないと濃く描けないようにする）
		temppressure = temppressure * 0.8;
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
		//---水彩の毛先
		var cursize = parentElement.current["size"];
		
		//1点目：中心
		compoarr.push("source-over");
		StXarr.push(startX);
		StYarr.push(startY);
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(0.1 * hairpressure * 2);
		widarr.push(cursize);
		shadowarr.push(15);
		caparr.push("butt");
		//2点目：上
		compoarr.push("source-over");
		StXarr.push(startX);
		StYarr.push(startY - (cursize * 0.55));
		Xarr.push(offsetX);
		Yarr.push(offsetY - (cursize * 0.55));
		alparr.push(0.02 * hairpressure * 2);
		widarr.push(cursize * 0.5);
		shadowarr.push(10);
		caparr.push("butt");
			//2点目：上,左2
			compoarr.push("source-over");
			StXarr.push(startX - (cursize * 0.25));
			StYarr.push(startY - (cursize * 0.25));
			Xarr.push(offsetX - (cursize * 0.25));
			Yarr.push(offsetY - (cursize * 0.25));
			alparr.push(0.01 * hairpressure * 2);
			widarr.push(cursize * 0.5);
			shadowarr.push(2);
			caparr.push("round");
			//2点目：上,右2
			compoarr.push("source-over");
			StXarr.push(startX + (cursize * 0.25));
			StYarr.push(startY - (cursize * 0.25));
			Xarr.push(offsetX + (cursize * 0.25));
			Yarr.push(offsetY - (cursize * 0.25));
			alparr.push(0.01 * hairpressure * 2);
			widarr.push(cursize * 0.5);
			shadowarr.push(2);
			caparr.push("round");
		//3点目：下
		compoarr.push("source-over");
		StXarr.push(startX);
		StYarr.push(startY + (cursize * 0.55));
		Xarr.push(offsetX);
		Yarr.push(offsetY + (cursize * 0.55));
		alparr.push(0.02 * hairpressure * 2);
		widarr.push(cursize * 0.5);
		shadowarr.push(5);
		caparr.push("butt");
			//3点目：下,左2
			compoarr.push("source-over");
			StXarr.push(startX - (cursize * 0.25));
			StYarr.push(startY + (cursize * 0.25));
			Xarr.push(offsetX - (cursize * 0.25));
			Yarr.push(offsetY + (cursize * 0.25));
			alparr.push(0.01 * hairpressure * 2);
			widarr.push(cursize * 0.5);
			shadowarr.push(2);
			caparr.push("round");
			//3点目：下,右2
			compoarr.push("source-over");
			StXarr.push(startX + (cursize * 0.25));
			StYarr.push(startY + (cursize * 0.25));
			Xarr.push(offsetX + (cursize * 0.25));
			Yarr.push(offsetY + (cursize * 0.25));
			alparr.push(0.01 * hairpressure * 2);
			widarr.push(cursize * 0.5);
			shadowarr.push(2);
			caparr.push("round");
		//3点目：左
		compoarr.push("source-over");
		StXarr.push(startX - (cursize * 0.45));
		StYarr.push(startY);
		Xarr.push(offsetX - (cursize * 0.25));
		Yarr.push(offsetY);
		alparr.push(0.05 * hairpressure * 2);
		widarr.push(cursize * 0.5);
		shadowarr.push(10);
		caparr.push("round");
		//4点目：右
		compoarr.push("source-over");
		StXarr.push(startX + (cursize * 0.45));
		StYarr.push(startY);
		Xarr.push(offsetX + (cursize * 0.25));
		Yarr.push(offsetY);
		alparr.push(0.05 * hairpressure * 2);
		widarr.push(cursize * 0.5);
		shadowarr.push(10);
		caparr.push("round");
		//5点目：中心（再度）
		compoarr.push("source-over");
		StXarr.push(startX);
		StYarr.push(startY);
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(0.2 * hairpressure * 2);
		widarr.push(cursize);
		shadowarr.push(5);
		caparr.push("butt");
		for (var i = 0; i < StXarr.length; i++) {
			context.globalCompositeOperation = compoarr[i];
			context.globalAlpha = alparr[i];
			context.lineCap = caparr[i];
			context.lineWidth = widarr[i];
			context.shadowBlur = shadowarr[i];
			context.beginPath();
			context.moveTo(StXarr[i], StYarr[i]);
			context.lineTo(Xarr[i], Yarr[i]);
			context.stroke();
		}
		context.globalAlpha = bakalp;
	},
	initialize : function(parentelement,ownelement){
		this.parent = parentelement;
		this.element = ownelement;
	},
	
});