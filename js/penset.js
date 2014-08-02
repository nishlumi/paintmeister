var PenType = {
	"normal" : 0,
	"fill" : 1,
	"operate" : 2
};
//#################################################################################
//#################################################################################
	var PenSet = {
		parent : null,
		simplepen : null, 
		pencil : null, 
		airbrush : null,
		neonpen : null,
		fudepen : null,
		calligraphy : null,
		oilpaint : null,
		oilpaintv : null,
		waterpaint : null,
		eraser : null, 
			
		//special pen
		fillpen : null,
		colorchangepen : null,
		
		sizebar : null,
		colorpicker : null,
		defaults : {
			"simplepen" : [4,"#000000"],
			"pencil" : [3,"#000000"],
			"airbrush" : [10,"#000000"],
			"neonpen" : [8,"#000000"],
			"fudepen" : [12,"#000000"],
			"calligraphy" : [8,"#000000"],
			"oilpaint" : [20,"#000000"],
			"oilpaintv" : [20,"#000000"],
			"waterpaint" : [15,"#000000"],
			"eraser" : [20,"#000000"],
			"fillpen" : [0, "#000000"],
			"colorchangepen" : [15,"#000000"]
		},
		current : {"mode":"","size":-1,"color":"#000000","complete":false}, //0=mode, 1=size, 2=color, 3=complete?
		pentype : 0,

		updateInfo : function(panname,pensize){
			document.getElementById("info_pen_mode").textContent = panname;
			//document.getElementById("info_pen_size").innerHTML = Math.ceil(pensize);
			document.getElementById("lab_pensize").textContent = pensize;
			this.sizebar.value = this.current["size"];
		},
		setSimplePen : function(context) {
			this.current = {
				"mode":"simplepen",
				"size":4,
				"color":this.parent.colorpicker.value,
				"complete":false
			};
			context.globalCompositeOperation = "source-over";
			context.globalAlpha = 1.0;
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current["size"];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0.5;
			context.lineCap = "round";
			
			this.updateInfo("ペン",context.lineWidth);
			this.pentype = PenType.normal;
		},
		setPencil : function(context) {
			this.current = {
				"mode":"pencil",
				"size":3,
				"color":this.parent.colorpicker.value,
				"complete":true
			};
			context.globalCompositeOperation = "source-over";
			context.globalAlpha = 0.9;
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current["size"];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 2;
			context.lineCap = "round";
			
			this.updateInfo("鉛筆",context.lineWidth);
			this.pentype = PenType.normal;
		},
		setAirbrush : function(context) {
			this.current = {
				"mode":"airbrush",
				"size":20,
				"color":this.parent.colorpicker.value,
				"complete":true
			};
			context.globalCompositeOperation = "source-over";
			context.globalAlpha = 0.5;
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current["size"];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 10;
			context.lineCap = "round";
			//context.lineJoin = "miter";
			
			this.updateInfo("エアブラシ",context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.normal;
		},
		setNeonpen : function(context) {
			this.current = {
				"mode":"neonpen",
				"size":8,
				"color":this.parent.colorpicker.value,
				"complete":false
			};
			context.globalCompositeOperation = "source-over";
			context.globalAlpha = 0.85;
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current["size"] * 0.7;
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 10;
			context.lineCap = "round";
			
			this.updateInfo("ネオンペン",context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.normal;
		},
		setFudePen : function(context) {
			this.current = {
				"mode":"fudepen",
				"size":12,
				"color":this.parent.colorpicker.value,
				"complete":false
			};
			context.globalCompositeOperation = "source-over";
			
			context.globalAlpha = 1;
			
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current["size"];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 2;
			context.lineCap = "round";
			
			this.updateInfo("筆ペン",context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.normal;
		},
		setcalligraphy : function(context) {
			this.current = {
				"mode":"calligraphy",
				"size":8,
				"color":this.parent.colorpicker.value,
				"complete":false
			};
			context.globalCompositeOperation = "source-over";
			
			context.globalAlpha = 1;
			
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current["size"];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 2;
			context.lineCap = "round";
			
			this.updateInfo("カリグラフィ",context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.normal;
		},
		setOilPaintPen : function(context) {
			this.current = {
				"mode":"oilpaint",
				"size":20,
				"color":this.parent.colorpicker.value,
				"complete":false
			};
			if (arguments.length > 1)  { //指定ありの場合はそれを優先
				this.current["mode"] = arguments[1]["name"];
			}
			context.globalCompositeOperation = "lighter";
			
			context.globalAlpha = 1;
			
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current["size"];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 1;
			context.lineCap = "round";
			
			if (arguments.length > 1)  {
				this.updateInfo("油彩(縦)",context.lineWidth);
			}else{
				this.updateInfo("油彩",context.lineWidth);
			}
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.normal;
		},
		setWaterPaintPen : function(context) {
			this.current = {
				"mode":"waterpaint",
				"size":15,
				"color":this.parent.colorpicker.value,
				"complete":true
			};
			context.globalCompositeOperation = "lighter";
			context.globalAlpha = 1;
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current["size"];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 10;
			context.lineCap = "round";
			context.lineJoin = "round";
			
			this.updateInfo("水彩",context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.normal;
		},
		setEraser : function(context) {
			this.current = {
				"mode":"eraser",
				"size":20,
				"color":"#000000",
				"complete":false
			};
			if (arguments.length > 1)  { //指定ありの場合はそれを優先
				this.current["size"] = arguments[1]["size"];
			}
			context.globalCompositeOperation = "destination-out";
			context.strokeStyle = "#000000";
			context.lineWidth = this.current["size"];
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0;
			context.lineCap = "round";
			
			this.updateInfo("消しゴム",context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.normal;
		},
		setFillpen : function(context) {
			this.current = {
				"mode":"fillpen",
				"size":1,
				"color":"#000000",
				"complete":false
			};
			context.globalCompositeOperation = "destination-over";
			context.strokeStyle = this.parent.colorpicker.value;
			context.fillStyle = this.parent.colorpicker.value;
			context.lineWidth = this.current["size"];
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0;
			context.lineCap = "round";
			
			this.updateInfo("塗りつぶし",context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.fill;
		},
		setColorChangepen : function(context) {
			this.current = {
				"mode":"colorchangepen",
				"size":15,
				"color":"#000000",
				"complete":false
			};
			context.globalCompositeOperation = "source-atop";
			context.strokeStyle = this.parent.colorpicker.value;
			context.fillStyle = this.parent.colorpicker.value;
			context.lineWidth = this.current["size"];
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0;
			context.lineCap = "round";
			
			this.updateInfo("色替え",context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.normal;
		},
		prepare : function (event, context, pressure2){
			var pres = 0;
			if ((event.pressure) || (event.mozPressure)) {
				pres = event.pressure;
				if (event.mozPressure) pres = event.mozPressure;
				if (event.pressure == 0) pres = 0.001;
				/*if ((pressure2 != null) && (pressure2 > 0)) { //手動筆圧があれば使用
					pres = pressure2;
				}*/
				if (document.getElementById("chk_enable_handpres").className == "switchbutton_on") {
					pres = parseInt(document.getElementById("pres_curline").value) / 100;
					if (pres <= 0) pres = 0.001;
				}
				if ((this.current["mode"] == "airbrush") || 
					(this.current["mode"] == "fudepen") || 
					(this.current["mode"] == "calligraphy") || 
					(this.current["mode"] == "oilpaintv") || 
					(this.current["mode"] == "oilpaint")) {
					context.lineWidth = (this.sizebar.value * 0.5 * pres) * 2;
				}else{
					context.lineWidth = (this.sizebar.value * pres) * 2 + (pres * 0.5);
					//document.getElementById("log2").innerHTML = "pressure on:" + context.lineWidth;
				}
				this.parent.lastpressure = pres;
				//document.getElementById("log").innerHTML =  "pressure on:" + this.parent.lastpressure;
			}else{
				if (event.pressure == 0) {
					pres = 0.001;
				}else if (event.pressure == undefined) {
					pres = 0.5;
				}else{
					pres = 0.5;
				}
				/*if ((pressure2 != null) && (pressure2 > 0)) { //手動筆圧があれば使用
					pres = pressure2;
				}*/
				if (document.getElementById("chk_enable_handpres").className == "switchbutton_on") {
					pres = parseInt(document.getElementById("pres_curline").value) / 100;
					if (pres <= 0) pres = 0.001;
				}
				if ((this.current["mode"] == "airbrush") || (this.current["mode"] == "fudepen") || (this.current["mode"] == "calligraphy") || (this.current["mode"] == "oilpaint") || (this.current["mode"] == "oilpaintv")) {
					context.lineWidth = (this.sizebar.value * 0.5 * pres) * 2;
				}else{
					context.lineWidth = (this.sizebar.value * pres) * 2 + (pres * 0.5);
				}
				console.log(context.lineWidth);
				this.parent.lastpressure = pres;
				//document.getElementById("log").innerHTML = "pressure off:" + this.parent.lastpressure;
			}
		},
		drawMain : function(context,startX,startY,offsetX,offsetY){
			var hairStX = 0;
			var hairStY = 0;
			var hairX = 0;
			var hairY = 0;
			var hairWidth = 0;
			var hairDist = 0;
			var hair_outblur = 0;
			if (this.current["mode"] == "fudepen") {
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(offsetX, offsetY);
				context.stroke();
				hairStX = startX;
				hairStY = startY;
				hairX = offsetX;
				hairY = offsetY;
				hairWidth = context.lineWidth;
				hairDist = 0.4;
				//---毛先は中心と、上下3つ
				//毛先上
				for (var i = 0; i < 3; i++) {
					//hairX = hairX - (this.context.lineWidth * hairDist);
					hairY = hairY - (hairWidth * hairDist);
					//hairStX = hairStX - (this.context.lineWidth * hairDist);
					hairStY = hairStY - (hairWidth * hairDist);
					hairWidth = hairWidth * (hairDist + hairDist);
					context.lineWidth = hairWidth;
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
				for (var i = 0; i < 3; i++) {
					//hairX = hairX + (context.lineWidth * hairDist);
					hairY = hairY + (hairWidth * hairDist * 2);
					//hairStX = hairStX + (context.lineWidth * hairDist);
					hairStY = hairStY + (hairWidth * hairDist * 2);
					hairWidth = hairWidth * (hairDist + hairDist);
					context.lineWidth = hairWidth;
					context.moveTo(hairStX,hairStY);
					context.lineTo(hairX, hairY);
					context.stroke();
				}
			}else if (this.current["mode"] == "calligraphy") {
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
				//---毛先は細かく複数
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
			}else if (this.current["mode"] == "oilpaint"){
				//毛先1本あたりは1ピクセル近くする
				hairWidth = 0.3; //context.lineWidth / (this.current["size"] * 4.5);
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
				var hairpressure = this.parent.lastpressure  ? this.parent.lastpressure : 1 ;
				if (hairpressure == 0) {
					hairpressure = 0.001;
				}else if (hairpressure == undefined) {
					hairpressure = 1;
				}
				var hairWidthOnPres = this.current["size"] * 0.5 * hairpressure * 2;
				var hairWidthCount = hairWidthOnPres / 2;
				var hairHeightCount = hairWidthOnPres * 1.1; //少しだけ多め
				var keisubase = hairWidthCount / 1.6;
				var svkeisu = keisubase;
				var keisu_orikaesi = false;
				
				hairStX = startX - (hairWidthOnPres * 0.25); //開始Xは少し左
				hairStY = startY - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure) * 0.45;
				hairX = offsetX - (hairWidthOnPres * 0.25);
				hairY = offsetY - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure) * 0.45;
				context.lineWidth = hairWidthOnPres;
				context.globalAlpha = 0.07;
				context.lineCap = "butt";
				var bgHeightCount = Math.round(hairHeightCount / 6);
				var sy = startY;
				var oy = offsetY;
				for (var i = 0; i < bgHeightCount; i++) {
					context.moveTo(startX+(hairWidthCount/2), sy);
					context.lineTo(offsetX+(hairWidthCount/2), oy);
					context.stroke();
					sy += (hairWidthOnPres/1.2);
					oy += (hairWidthOnPres/1.2);
				}
				context.globalCompositeOperation = "source-over";
				context.lineWidth = hairWidth;
				context.lineCap = "round";
				var hairDistY = hairWidthOnPres - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure);
				var hairDistYhalf = [Math.round(hairDistY / 2), Math.ceil(hairDistY / 2)+hairDistY]
					
				hairDist = 1;
				hair_outblur = context.shadowBlur;
				for (var i = 0; i < hairWidthCount; i++) {
					var keisu = Math.cos(keisubase / 10) * hairpressure;
					hairStX = hairStX + 1;
					hairX = hairX + 1;
					
					var ydist = 0;
					if ((i % 3) == 0) {
						ydist = 3.5;
					}else{
						ydist = 3.5;
					}
					hairStY = startY - (hairHeightCount*ydist/1.8); //(hairWidthOnPres);// * keisu * hairpressure)*0.2;
					hairY = offsetY - (hairHeightCount*ydist/1.8); //(hairWidthOnPres);// * keisu * hairpressure)*0.2;
					hairDistY = Math.round(hairWidthOnPres - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure));
					var hairDistComp = hairHeightCount - hairDistY;
					hairDistYhalf = [hairDistComp/2,hairDistY+hairDistComp/2];//[Math.round(hairDistY / 2), Math.ceil(hairDistY / 2)+hairDistY]
					for (var j = 0; j < hairHeightCount; j++) {
						hairStY = hairStY + ydist;
						hairY = hairY + ydist;
						
						if ((j <= hairDistYhalf[0]) || (j >= hairDistYhalf[1])) {
						}else{
							if (j == hairDistYhalf[0]+1) {
								context.globalAlpha = 0.5 * hairpressure * 2;
							}else if (j == hairHeightCount-1) {
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
						if (i > hairWidthCount/2) {
							keisubase -= svkeisu;
							keisu_orikaesi = true;
						}else{
							keisubase += svkeisu;
						}
					}
				}
				context.globalCompositeOperation = "lighter";
			}else if (this.current["mode"] == "oilpaintv"){
				//油彩筆 - 縦向きの筆バージョン
				//毛先1本あたりは1ピクセル近くする
				hairWidth = 0.3; //context.lineWidth / (this.current["size"] * 4.5);
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
				var hairpressure = this.parent.lastpressure  ? this.parent.lastpressure : 1 ;
				if (hairpressure == 0) {
					hairpressure = 0.001;
				}else if (hairpressure == undefined) {
					hairpressure = 1;
				}
				var hairWidthOnPres = this.current["size"] * 0.5 * hairpressure * 2;
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
			}else if (this.current["mode"] == "airbrush"){
				context.lineWidth = this.current["size"];
				var hairpressure = this.parent.lastpressure  ? this.parent.lastpressure : 1 ;
				if (hairpressure == 0) {
					hairpressure = 0.001;
				}else if (hairpressure == undefined) {
					hairpressure = 1;
				}
				document.getElementById("log3").innerHTML = hairpressure;
				var bakalp = context.globalAlpha;
				/*var alp = context.globalAlpha * hairpressure * 2;
				context.globalAlpha = alp;
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(offsetX, offsetY);
				context.stroke();
				context.globalAlpha = bakalp;*/

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
				
				//1点目：中心
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY);
				Xarr.push(offsetX);
				Yarr.push(offsetY);
				alparr.push(0.01 * hairpressure * 2);
				widarr.push(this.current["size"]*0.2);
				shadowarr.push(50);
				caparr.push("round");
				//1点目：中心（再度1）
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY);
				Xarr.push(offsetX);
				Yarr.push(offsetY);
				alparr.push(0.05 * hairpressure * 2);
				widarr.push(this.current["size"]*0.4);
				shadowarr.push(25);
				caparr.push("round");
				//1点目：中心（再度2）
				compoarr.push("destination-over");
				StXarr.push(startX);
				StYarr.push(startY);
				Xarr.push(offsetX);
				Yarr.push(offsetY);
				alparr.push(0.03 * hairpressure * 2);
				widarr.push(this.current["size"]*1);
				shadowarr.push(10);
				caparr.push("round");
				//1点目：中心（再度3）
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY);
				Xarr.push(offsetX);
				Yarr.push(offsetY);
				alparr.push(0.04 * hairpressure * 2);
				widarr.push(this.current["size"]*1.2);
				shadowarr.push(15);
				caparr.push("butt");
				//2点目：上
				/*compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY - (this.current["size"] * 0.55));
				Xarr.push(offsetX);
				Yarr.push(offsetY - (this.current["size"] * 0.55));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("butt");
				//2点目：上,左
				compoarr.push("source-over");
				StXarr.push(startX - (this.current["size"] * 0.45));
				StYarr.push(startY - (this.current["size"] * 0.45));
				Xarr.push(offsetX - (this.current["size"] * 0.45));
				Yarr.push(offsetY - (this.current["size"] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//2点目：上,左2
				/*	compoarr.push("source-over");
					StXarr.push(startX - (this.current["size"] * 0.25));
					StYarr.push(startY - (this.current["size"] * 0.25));
					Xarr.push(offsetX - (this.current["size"] * 0.25));
					Yarr.push(offsetY - (this.current["size"] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current["size"] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//2点目：上,右
				compoarr.push("source-over");
				StXarr.push(startX + (this.current["size"] * 0.45));
				StYarr.push(startY - (this.current["size"] * 0.45));
				Xarr.push(offsetX + (this.current["size"] * 0.45));
				Yarr.push(offsetY - (this.current["size"] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//2点目：上,右2
				/*	compoarr.push("source-over");
					StXarr.push(startX + (this.current["size"] * 0.25));
					StYarr.push(startY - (this.current["size"] * 0.25));
					Xarr.push(offsetX + (this.current["size"] * 0.25));
					Yarr.push(offsetY - (this.current["size"] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current["size"] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//3点目：下
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY + (this.current["size"] * 0.55));
				Xarr.push(offsetX);
				Yarr.push(offsetY + (this.current["size"] * 0.55));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(5);
				caparr.push("butt");*/
				//3点目：下,左
				/*compoarr.push("source-over");
				StXarr.push(startX - (this.current["size"] * 0.45));
				StYarr.push(startY + (this.current["size"] * 0.45));
				Xarr.push(offsetX - (this.current["size"] * 0.45));
				Yarr.push(offsetY + (this.current["size"] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//3点目：下,左2
				/*	compoarr.push("source-over");
					StXarr.push(startX - (this.current["size"] * 0.25));
					StYarr.push(startY + (this.current["size"] * 0.25));
					Xarr.push(offsetX - (this.current["size"] * 0.25));
					Yarr.push(offsetY + (this.current["size"] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current["size"] * 0.5);
					shadowarr.push(2);
					caparr.push("round");*/
				//3点目：下,右
				/*compoarr.push("source-over");
				StXarr.push(startX + (this.current["size"] * 0.45));
				StYarr.push(startY + (this.current["size"] * 0.45));
				Xarr.push(offsetX + (this.current["size"] * 0.45));
				Yarr.push(offsetY + (this.current["size"] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//3点目：下,右2
				/*	compoarr.push("source-over");
					StXarr.push(startX + (this.current["size"] * 0.25));
					StYarr.push(startY + (this.current["size"] * 0.25));
					Xarr.push(offsetX + (this.current["size"] * 0.25));
					Yarr.push(offsetY + (this.current["size"] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current["size"] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//3点目：左
				compoarr.push("source-over");
				StXarr.push(startX - (this.current["size"] * 0.45));
				StYarr.push(startY);
				Xarr.push(offsetX - (this.current["size"] * 0.25));
				Yarr.push(offsetY);
				alparr.push(0.05 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");
				//4点目：右
				compoarr.push("source-over");
				StXarr.push(startX + (this.current["size"] * 0.45));
				StYarr.push(startY);
				Xarr.push(offsetX + (this.current["size"] * 0.25));
				Yarr.push(offsetY);
				alparr.push(0.05 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
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
			}else if (this.current["mode"] == "waterpaint"){
				context.lineWidth = this.current["size"];
				var hairpressure = this.parent.lastpressure  ? this.parent.lastpressure : 1 ;
				if (hairpressure == 0) {
					hairpressure = 0.001;
				}else if (hairpressure == undefined) {
					hairpressure = 1;
				}
				document.getElementById("log3").innerHTML = hairpressure;
				var bakalp = context.globalAlpha;
				/*var alp = context.globalAlpha * hairpressure * 2;
				context.globalAlpha = alp;
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(offsetX, offsetY);
				context.stroke();
				context.globalAlpha = bakalp;*/


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
				
				//1点目：中心
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY);
				Xarr.push(offsetX);
				Yarr.push(offsetY);
				alparr.push(0.1 * hairpressure * 2);
				widarr.push(this.current["size"]);
				shadowarr.push(15);
				caparr.push("round");
				//2点目：上
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY - (this.current["size"] * 0.55));
				Xarr.push(offsetX);
				Yarr.push(offsetY - (this.current["size"] * 0.55));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("butt");
				//2点目：上,左
				/*compoarr.push("source-over");
				StXarr.push(startX - (this.current["size"] * 0.45));
				StYarr.push(startY - (this.current["size"] * 0.45));
				Xarr.push(offsetX - (this.current["size"] * 0.45));
				Yarr.push(offsetY - (this.current["size"] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//2点目：上,左2
					compoarr.push("source-over");
					StXarr.push(startX - (this.current["size"] * 0.25));
					StYarr.push(startY - (this.current["size"] * 0.25));
					Xarr.push(offsetX - (this.current["size"] * 0.25));
					Yarr.push(offsetY - (this.current["size"] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current["size"] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//2点目：上,右
				/*compoarr.push("source-over");
				StXarr.push(startX + (this.current["size"] * 0.45));
				StYarr.push(startY - (this.current["size"] * 0.45));
				Xarr.push(offsetX + (this.current["size"] * 0.45));
				Yarr.push(offsetY - (this.current["size"] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//2点目：上,右2
					compoarr.push("source-over");
					StXarr.push(startX + (this.current["size"] * 0.25));
					StYarr.push(startY - (this.current["size"] * 0.25));
					Xarr.push(offsetX + (this.current["size"] * 0.25));
					Yarr.push(offsetY - (this.current["size"] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current["size"] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//3点目：下
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY + (this.current["size"] * 0.55));
				Xarr.push(offsetX);
				Yarr.push(offsetY + (this.current["size"] * 0.55));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(5);
				caparr.push("butt");
				//3点目：下,左
				/*compoarr.push("source-over");
				StXarr.push(startX - (this.current["size"] * 0.45));
				StYarr.push(startY + (this.current["size"] * 0.45));
				Xarr.push(offsetX - (this.current["size"] * 0.45));
				Yarr.push(offsetY + (this.current["size"] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//3点目：下,左2
					compoarr.push("source-over");
					StXarr.push(startX - (this.current["size"] * 0.25));
					StYarr.push(startY + (this.current["size"] * 0.25));
					Xarr.push(offsetX - (this.current["size"] * 0.25));
					Yarr.push(offsetY + (this.current["size"] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current["size"] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//3点目：下,右
				/*compoarr.push("source-over");
				StXarr.push(startX + (this.current["size"] * 0.45));
				StYarr.push(startY + (this.current["size"] * 0.45));
				Xarr.push(offsetX + (this.current["size"] * 0.45));
				Yarr.push(offsetY + (this.current["size"] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//3点目：下,右2
					compoarr.push("source-over");
					StXarr.push(startX + (this.current["size"] * 0.25));
					StYarr.push(startY + (this.current["size"] * 0.25));
					Xarr.push(offsetX + (this.current["size"] * 0.25));
					Yarr.push(offsetY + (this.current["size"] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current["size"] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//3点目：左
				compoarr.push("source-over");
				StXarr.push(startX - (this.current["size"] * 0.45));
				StYarr.push(startY);
				Xarr.push(offsetX - (this.current["size"] * 0.25));
				Yarr.push(offsetY);
				alparr.push(0.05 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");
				//4点目：右
				compoarr.push("xor");
				StXarr.push(startX + (this.current["size"] * 0.45));
				StYarr.push(startY);
				Xarr.push(offsetX + (this.current["size"] * 0.25));
				Yarr.push(offsetY);
				alparr.push(0.05 * hairpressure * 2);
				widarr.push(this.current["size"] * 0.5);
				shadowarr.push(10);
				caparr.push("round");
				//5点目：中心（再度）
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY);
				Xarr.push(offsetX);
				Yarr.push(offsetY);
				alparr.push(0.2 * hairpressure * 2);
				widarr.push(this.current["size"]);
				shadowarr.push(5);
				caparr.push("round");
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

			}else if (this.current["mode"] == "pencil"){
				context.lineWidth = this.current["size"];
				var hairpressure = this.parent.lastpressure  ? this.parent.lastpressure : 1 ;
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
				
				//5点目：中心（再度）ベースの線
				compoarr.push("source-over");
				StXarr.push(startX + (this.current["size"] * 0.05));
				StYarr.push(startY - (this.current["size"] * 0.09));
				Xarr.push(offsetX + (this.current["size"] * 0.05));
				Yarr.push(offsetY - (this.current["size"] * 0.09));
				if (hairpressure > 0.3) {
					alparr.push(1 * hairpressure * 1);
					widarr.push(this.current["size"]*0.9);
					shadowarr.push(2);
					caparr.push("round");
				}else{
					alparr.push(0.5 * hairpressure * 1);
					widarr.push(this.current["size"] * 0.9);
					shadowarr.push(1);
					caparr.push("round");
				}
				//6点目：中心（再々度）
				compoarr.push("source-over");
				StXarr.push(startX - (this.current["size"] * 0.06));
				StYarr.push(startY + (this.current["size"] * 0.085));
				Xarr.push(offsetX - (this.current["size"] * 0.06));
				Yarr.push(offsetY + (this.current["size"] * 0.085));
				if (hairpressure > 0.3) {
					alparr.push(1 * hairpressure * 1);
					widarr.push(this.current["size"]*0.9);
					shadowarr.push(2);
					caparr.push("round");
				}else{
					alparr.push(0.5 * hairpressure * 1);
					widarr.push(this.current["size"] * 0.9);
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
				widarr.push(this.current["size"] * 0.90);
				shadowarr.push(1);
				caparr.push("butt");
				//var cl = new RGBColor(this.parent.colorpicker.value);
				for (var i = 1; i < StXarr.length; i++) {
				//var grad = context.createLinearGradient(StXarr[i], StYarr[i],Xarr[i], Yarr[i]);
				//grad.addColorStop(0.0, "rgb(" + Math.floor(cl.r*10) + "," + Math.floor(cl.g*10) + "," + Math.floor(cl.b*10) + ")");
				//grad.addColorStop(0.5, "rgb(" + Math.floor(cl.r/2) + "," + Math.floor(cl.g/2) + "," + Math.floor(cl.b/2) + ")");
				//grad.addColorStop(1.0, cl.toRGB());
				//context.strokeStyle = grad;
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
			}else if (this.current[0] == "fillpen" && this.pentype == PenType.fill){
				context.fillRect(0,0,this.parent.canvassize[0],this.parent.canvassize[1]);
			}else{
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(offsetX, offsetY);
				context.stroke();
			}
			context.closePath();
		},
		hiddenMenu : function (evt){
			document.getElementById("menupanel").style.display = "none";
			document.getElementById("btn_menu").style.backgroundColor = "#c4fab3";
			
			var p = document.querySelectorAll("li.item1st");
			console.log(p);
			for (var j = 0; j < p.length; j++) {
				//p[j].style.listStyleType = "none";
				if (String(p[j].innerHTML).substr(0,1).charCodeAt() == "10004")
					p[j].innerText = String(p[j].innerHTML).substr(1,String(p[j].innerHTML).length);
			}
			//evt.target.style.listStyleType = "square";
			evt.target.innerHTML = "&#10004;" + evt.target.innerText;
			console.log(event.target.id);
			document.getElementById("dlg_pen_mode").style.display = "none";
		},
		initialize : function(drawobject) {
			this.parent = drawobject;
			this.simplepen = document.getElementById("simplepen");
			this.pencil = document.getElementById("pencil");
			this.airbrush = document.getElementById("airbrush");
			this.neonpen = document.getElementById("neonpen");
			this.fudepen = document.getElementById("fudepen");
			this.calligraphy = document.getElementById("calligraphy");
			this.oilpaint = document.getElementById("oilpaint");
			this.oilpaintv = document.getElementById("oilpaintv");
			this.eraser = document.getElementById("eraser");
			this.fillpen = document.getElementById("fillpen");
			this.waterpaint = document.getElementById("waterpaint");
			this.colorchangepen = document.getElementById("colorchangepen");
			
			this.sizebar = document.getElementById("pensize");
			this.colorpicker = document.getElementById("colorpicker");
			
			/*var ul = document.querySelector("div#dlg_pen_mode ul li");
			for (var i = 0; i < ul.length; i++) {
				//ul[i].onclick = pens[i].onclick;
				ul[i].addEventListener("click",function(event){
					var p = document.querySelectorAll("div#dlg_pen_mode ul li");
					for (var j = 0; j < p.length; j++) {
						p[j].style.listStyleType = "none";
					}
					event.target.style.listStyleType = "square";
					console.log(event.target.id);
					document.getElementById("dlg_pen_mode").style.display = "none";
				},false);
			}*/
			this.simplepen.addEventListener("click",function(event) {
				PenSet.setSimplePen(Draw.context);
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "simplepen",
					"func" : PenSet.simplepen
				};
			}, false);
			this.pencil.addEventListener("click",function(event) {
				PenSet.setPencil(Draw.context);
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "pencil",
					"func" : PenSet.pencil
				};
			}, false);
			this.airbrush.addEventListener("click",function(event) {
				Draw.pen.setAirbrush(Draw.context); // change edit style to "airbrush".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "airbrush",
					"func" : PenSet.airbrush
				};
			}, false);
			this.neonpen.addEventListener("click",function(event) {
				Draw.pen.setNeonpen(Draw.context); // change edit style to "neonpen".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "neonpen",
					"func" : PenSet.neonpen
				};
			}, false);
			this.fudepen.addEventListener("click",function(event) {
				Draw.pen.setFudePen(Draw.context); // change edit style to "fudepen".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "fudepen",
					"func" : PenSet.fudepen
				};
			}, false);
			this.calligraphy.addEventListener("click",function(event) {
				Draw.pen.setcalligraphy(Draw.context); // change edit style to "calligraphy".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "calligraphy",
					"func" : PenSet.calligraphy
				};
			}, false);
			this.oilpaint.addEventListener("click",function(event) {
				Draw.pen.setOilPaintPen(Draw.context); // change edit style to "oilpaint".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "oilpaint",
					"func" : PenSet.oilpaint
				};
			}, false);
			this.oilpaintv.addEventListener("click",function(event) {
				Draw.pen.setOilPaintPen(Draw.context,{"name":"oilpaintv"}); // change edit style to "oilpaint".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "oilpaintv",
					"func" : PenSet.oilpaintv
				};
			}, false);
			this.waterpaint.addEventListener("click",function(event) {
				Draw.pen.setWaterPaintPen(Draw.context); // change edit style to "waterpaint".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "waterpaint",
					"func" : PenSet.waterpaint
				};
			}, false);
			
			this.eraser.addEventListener("click",function(event) {
				Draw.pen.setEraser(Draw.context); // change edit style to "eraser".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.eraser = {
					"name" : "eraser",
					"func" : PenSet.eraser
				};
			}, false);
			this.fillpen.addEventListener("click",function(event) {
				Draw.pen.setFillpen(Draw.context); // change edit style to "eraser".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "fillpen",
					"func" : PenSet.fillpen
				};
			}, false);
			this.colorchangepen.addEventListener("click",function(event) {
				Draw.pen.setColorChangepen(Draw.context); // change edit style to "colorchange".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "colorchangepen",
					"func" : PenSet.colorchangepen
				};
			}, false);
			
		}
	};
