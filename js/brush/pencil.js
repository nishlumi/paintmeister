/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "pencil",
	name : "鉛筆",
	element : null,
	parent : null,
	setFolder : "pen",
	defaults : [3,"#000000"],
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
		context.shadowBlur = 2;
		context.lineCap = "round";
		
		return current;
	},
	prepare : function (event, context, pressure2){
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
		var cursize = parentElement.current["size"];
		//5点目：中心（再度）ベースの線
		compoarr.push("source-over");
		StXarr.push(startX + (cursize * 0.05));
		StYarr.push(startY - (cursize * 0.09));
		Xarr.push(offsetX + (cursize * 0.05));
		Yarr.push(offsetY - (cursize * 0.09));
		if (hairpressure > 0.3) {
			alparr.push(1 * hairpressure * 1);
			widarr.push(cursize*0.9);
			shadowarr.push(2);
			caparr.push("round");
		}else{
			alparr.push(0.5 * hairpressure * 1);
			widarr.push(cursize * 0.9);
			shadowarr.push(1);
			caparr.push("round");
		}
		//6点目：中心（再々度）
		compoarr.push("source-over");
		StXarr.push(startX - (cursize * 0.06));
		StYarr.push(startY + (cursize * 0.085));
		Xarr.push(offsetX - (cursize * 0.06));
		Yarr.push(offsetY + (cursize * 0.085));
		if (hairpressure > 0.3) {
			alparr.push(1 * hairpressure * 1);
			widarr.push(cursize*0.9);
			shadowarr.push(2);
			caparr.push("round");
		}else{
			alparr.push(0.5 * hairpressure * 1);
			widarr.push(cursize * 0.9);
			shadowarr.push(1);
			caparr.push("round");
		}
		//1点目：中心
		compoarr.push("source-over");
		StXarr.push(startX);
		StYarr.push(startY);
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(1 * hairpressure * 2);
		widarr.push(cursize * 0.90);
		shadowarr.push(1);
		caparr.push("butt");
		for (var i = 1; i < StXarr.length; i++) {
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