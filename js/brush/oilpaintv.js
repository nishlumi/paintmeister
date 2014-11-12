/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
	id : "oilpaintv",
	name : {
		"ja":"油彩(縦)",
		"en":"Oil paint(V)"
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
			"complete":false
		};
		context.globalCompositeOperation = "lighter";
		context.globalAlpha = 1.0;
		context.strokeStyle = parentElement.colorpicker; 
		context.lineWidth = current["size"];
		context.shadowColor = parentElement.colorpicker;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 1;
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
		var hairStX = 0;
		var hairStY = 0;
		var hairX = 0;
		var hairY = 0;
		var hairDist = 0;
		var hair_outblur = 0;
		//油彩筆 - 縦向きの筆バージョン
		//毛先1本あたりは1ピクセル近くする
		var hairWidth = 0.3; //context.lineWidth / (this.current["size"] * 4.5);
		context.lineWidth = hairWidth;
		context.globalCompositeOperation = "lighter";
		context.beginPath();
		/*context.moveTo(startX, startY);
		context.lineTo(offsetX, offsetY);
		context.stroke();*/
		/*メインの点は不要。完全に点の集合体とする。
		---全体的な毛並みは縦＝本来の筆の太さ、横＝本来の太さ/2の楕円の範囲に
		   毛先1本をランダムっぽく描画する
		描画順： il|li
			毛を縦の列単位で描画する。筆圧により描画する毛を上下から調整する
			毛の横の太さは上記の通り。筆圧により描画する割合を調整する（列の集合に対して）
			描画順は右から左（毛が流れる方向に対して）
		毛の点の数
			少→中→多→中→少
			少=60～70%
			中=75～85%
			多=90～100%
			ここからさらに筆圧によって増減させる。
		
		*/
		var hairpressure = parentElement.lastpressure  ? parentElement.lastpressure : 1 ;
		if (hairpressure == 0) {
			hairpressure = 0.001;
		}else if (hairpressure == undefined) {
			hairpressure = 1;
		}
		var hairWidthOnPres = parentElement.current["size"] * 0.5 * hairpressure * 2;
		var hairWidthCount = hairWidthOnPres * 1.1; //少しだけ多め
		var hairHeightCount = hairWidthOnPres / 2;
		var keisubase = hairWidthCount / 2;
		var svkeisu = keisubase;
		var keisu_orikaesi = false;
		
		hairStY = startY - (hairWidthOnPres * 0.25); //開始Xは少し左
		hairStX = startX - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure) * 0.45;
		hairY = offsetY - (hairWidthOnPres * 0.25);
		hairX = offsetX - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure) * 0.45;
		context.lineWidth = hairWidthOnPres;
		context.globalAlpha = 0.07;
		context.lineCap = "butt";
		var bgWidthCount = Math.round(hairWidthCount / 6);
		var sx = startX;
		var ox = offsetX;
		for (var i = 0; i < bgWidthCount; i++) {
			context.moveTo(sx, startY+(hairHeightCount/2));
			context.lineTo(ox, offsetY+(hairHeightCount/2));
			context.stroke();
			sx += (hairWidthOnPres/1.2);
			ox += (hairWidthOnPres/1.2);
		}
		context.globalCompositeOperation = "source-over";
		context.lineWidth = hairWidth;
		context.lineCap = "round";
		
		var hairDistX = hairWidthOnPres - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure);
		var hairDistXhalf = [Math.round(hairDistX / 2), Math.ceil(hairDistX / 2)+hairDistX]
			
		hairDist = 1;
		hair_outblur = context.shadowBlur;
		for (var i = 0; i < hairHeightCount; i++) {
			var keisu = Math.cos(keisubase / 10) * hairpressure;
			hairStY = hairStY + 1;
			hairY = hairY + 1;
			
			var xdist = 0;
			if ((i % 3) == 0) {
				xdist = 3.5;
			}else{
				xdist = 3.5;
			}
			hairStX = startX - (hairWidthCount*xdist/1.8); //(hairWidthOnPres);// * keisu * hairpressure)*0.2;
			hairX = offsetX - (hairWidthCount*xdist/1.8); //(hairWidthOnPres);// * keisu * hairpressure)*0.2;
			hairDistX = Math.round(hairWidthOnPres - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure));
			var hairDistComp = hairWidthCount - hairDistX;
			hairDistXhalf = [hairDistComp/2,hairDistX+hairDistComp/2];//[Math.round(hairDistX / 2), Math.ceil(hairDistX / 2)+hairDistX]
			for (var j = 0; j < hairWidthCount; j++) {
				hairStX = hairStX + xdist;
				hairX = hairX + xdist;
				
				if ((j <= hairDistXhalf[0]) || (j >= hairDistXhalf[1])) {
				}else{
					if (j == hairDistXhalf[0]+1) {
						context.globalAlpha = 0.5 * hairpressure * 2;
					}else if (j == hairWidthCount-1) {
						context.globalAlpha = 0.5 * hairpressure * 2;
					}else{
						context.globalAlpha = 0.7 * hairpressure * 2;
					}
					context.lineWidth = hairWidth;
					context.moveTo(hairStX,hairStY);
					context.lineTo(hairX, hairY);
					context.stroke();
				}
			}
			if (keisu_orikaesi) {
				keisubase -= svkeisu;
			}else{
				if (keisubase >= hairHeightCount/2) {
					keisubase -= svkeisu;
					keisu_orikaesi = true;
				}else{
					keisubase += svkeisu;
				}
			}
		}
		context.globalCompositeOperation = "lighter";
	},
	initialize : function(parentelement,ownelement){
		this.parent = parentelement;
		this.element = ownelement;
	},
	
});