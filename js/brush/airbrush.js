/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "airbrush",
	name : "エアブラシ",
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
			"complete":true
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
		//---テスト的にエアブラシの毛先は5点+全体を覆う1点とする
		
		compoarr.push("source-over");
		StXarr.push(startX);
		StYarr.push(startY);
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(0.05 * hairpressure * 2);
		widarr.push(parentElement.current["size"]*1.0);
		shadowarr.push(0);
		caparr.push("round");
		
		compoarr.push("source-over");
		StXarr.push(startX);
		StYarr.push(startY);
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(0.08 * hairpressure * 2);
		widarr.push(parentElement.current["size"]*0.5);
		shadowarr.push(0);
		caparr.push("round");
		
		compoarr.push("source-over");
		StXarr.push(startX);
		StYarr.push(startY);
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(0.065 * hairpressure * 2);
		widarr.push(parentElement.current["size"]*0.8);
		shadowarr.push(0);
		caparr.push("round");
		
		compoarr.push("source-over");
		StXarr.push(startX);
		StYarr.push(startY);
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(0.07 * hairpressure * 2);
		widarr.push(parentElement.current["size"]*1.2);
		shadowarr.push(0);
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