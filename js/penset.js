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
		eraser : null, 
			
		fillpen : null,
		
		sizebar : null,
		colorpicker : null,
		defaults : {
			"simplepen" : [4,"#000000"],
			"pencil" : [4,"#000000"],
			"airbrush" : [10,"#000000"],
			"neonpen" : [8,"#000000"],
			"fudepen" : [12,"#000000"],
			"calligraphy" : [8,"#000000"],
			"oilpaint" : [20,"#000000"],
			"eraser" : [20,"#000000"],
			"fillpen" : [0, "#000000"],
		},
		current : ["",-1,"#000000"], //0=mode, 1=size, 2=color, 3=complete?
		pentype : 0,

		updateInfo : function(panname,pensize){
			document.getElementById("info_pen_mode").textContent = panname;
			//document.getElementById("info_pen_size").innerHTML = Math.ceil(pensize);
			document.getElementById("lab_pensize").textContent = pensize;
			this.sizebar.value = this.current[1];
		},
		setSimplePen : function(context) {
			this.current = ["simplepen",4,this.parent.colorpicker.value,false];
			context.globalCompositeOperation = "source-over";
			context.globalAlpha = 1.0;
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current[1];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 1.2;
			context.lineCap = "round";
			
			this.updateInfo("ペン",context.lineWidth);
			this.pentype = PenType.normal;
		},
		setPencil : function(context) {
			this.current = ["pencil",4,this.parent.colorpicker.value,false];
			context.globalCompositeOperation = "source-over";
			context.globalAlpha = 0.9;
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current[1];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 2;
			context.lineCap = "round";
			
			this.updateInfo("鉛筆",context.lineWidth);
			this.pentype = PenType.normal;
		},
		setAirbrush : function(context) {
			this.current = ["airbrush",20,this.parent.colorpicker.value,true];
			context.globalCompositeOperation = "source-over";
			context.globalAlpha = 0.5;
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current[1];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 10;
			context.lineCap = "round";
			//context.lineJoin = "miter";
			
			this.updateInfo("エアブラシ",context.lineWidth);
			this.sizebar.value = this.current[1];
			this.pentype = PenType.normal;
		},
		setNeonpen : function(context) {
			this.current = ["neonpen",8,this.parent.colorpicker.value,false];
			context.globalCompositeOperation = "source-over";
			context.globalAlpha = 0.85;
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current[1] * 0.7;
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 10;
			context.lineCap = "round";
			
			this.updateInfo("ネオンペン",context.lineWidth);
			this.sizebar.value = this.current[1];
			this.pentype = PenType.normal;
		},
		setFudePen : function(context) {
			this.current = ["fudepen",12,this.parent.colorpicker.value,false];
			context.globalCompositeOperation = "source-over";
			
			context.globalAlpha = 1;
			
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current[1];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 2;
			context.lineCap = "round";
			
			this.updateInfo("筆ペン",context.lineWidth);
			this.sizebar.value = this.current[1];
			this.pentype = PenType.normal;
		},
		setcalligraphy : function(context) {
			this.current = ["calligraphy",8,this.parent.colorpicker.value,false];
			context.globalCompositeOperation = "source-over";
			
			context.globalAlpha = 1;
			
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current[1];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 2;
			context.lineCap = "round";
			
			this.updateInfo("カリグラフィ",context.lineWidth);
			this.sizebar.value = this.current[1];
			this.pentype = PenType.normal;
		},
		setOilPaintPen : function(context) {
			this.current = ["oilpaint",20,this.parent.colorpicker.value,false];
			context.globalCompositeOperation = "source-over";
			
			context.globalAlpha = 1;
			
			context.strokeStyle = this.parent.colorpicker.value; //"#ff0000";
			context.lineWidth = this.current[1];
			context.shadowColor = this.parent.colorpicker.value; //"#ff0000";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0.5;
			context.lineCap = "round";
			
			this.updateInfo("油彩",context.lineWidth);
			this.sizebar.value = this.current[1];
			this.pentype = PenType.normal;
		},
		
		setEraser : function(context) {
			this.current = ["eraser",20,"#000000",false];
			context.globalCompositeOperation = "destination-out";
			context.strokeStyle = "#000000";
			context.lineWidth = this.current[1];
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0;
			context.lineCap = "round";
			
			this.updateInfo("消しゴム",context.lineWidth);
			this.sizebar.value = this.current[1];
			this.pentype = PenType.normal;
		},
		setFillpen : function(context) {
			this.current = ["fillpen",1,"#000000",false];
			context.globalCompositeOperation = "destination-over";
			context.strokeStyle = this.parent.colorpicker.value;
			context.fillStyle = this.parent.colorpicker.value;
			context.lineWidth = this.current[1];
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0;
			context.lineCap = "round";
			
			this.updateInfo("塗りつぶし",context.lineWidth);
			this.sizebar.value = this.current[1];
			this.pentype = PenType.fill;
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
				if (document.getElementById("chk_enable_handpres").checked) {
					pres = parseInt(document.getElementById("pres_curline").value) / 100;
					if (pres <= 0) pres = 0.001;
				}
				if ((this.current[0] == "airbrush") || (this.current[0] == "fudepen") || (this.current[0] == "calligraphy") || (this.current[0] == "oilpaint")) {
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
				if (document.getElementById("chk_enable_handpres").checked) {
					pres = parseInt(document.getElementById("pres_curline").value) / 100;
					if (pres <= 0) pres = 0.001;
				}
				if ((this.current[0] == "airbrush") || (this.current[0] == "fudepen") || (this.current[0] == "calligraphy") || (this.current[0] == "oilpaint")) {
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
			if (this.current[0] == "fudepen") {
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
			}else if (this.current[0] == "calligraphy") {
				var hairWidth = context.lineWidth / 12; //pen.current[1];
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
				//hairWidth = pen.current[1];
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
			}else if (this.current[0] == "oilpaint"){
				//毛先1本あたりは1ピクセル近くする
				hairWidth = 0.1; //context.lineWidth / (this.current[1] * 4.5);
				context.lineWidth = hairWidth;
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
				var hairWidthOnPres = this.current[1] * 0.5 * hairpressure * 2;
				var hairWidthCount = hairWidthOnPres / 2;
				var hairHeightCount = hairWidthOnPres * 1.1; //少しだけ多め
				var keisubase = hairWidthCount / 2;
				
				hairStX = startX - (hairWidthOnPres * 0.25); //開始Xは少し左
				hairStY = startY - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure) * 0.45;
				hairX = offsetX - (hairWidthOnPres * 0.25);
				hairY = offsetY - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure) * 0.45;
				
				var hairDistY = hairWidthOnPres - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure);
				var hairDistYhalf = [Math.round(hairDistY / 2), Math.ceil(hairDistY / 2)+hairDistY]
					
				hairDist = 1;
				hair_outblur = context.shadowBlur;
				for (var i = 0; i < hairWidthCount; i++) {
					var keisu = Math.cos(keisubase / 10) * hairpressure;
					hairStX = hairStX + 1;
					hairX = hairX + 1;
					
					hairStY = startY - (hairWidthOnPres);// * keisu * hairpressure)*0.2;
					hairY = offsetY - (hairWidthOnPres);// * keisu * hairpressure)*0.2;
					hairDistY = hairWidthOnPres - (hairWidthOnPres * Math.cos(keisubase/10) * hairpressure);
					hairDistYhalf = [Math.round(hairDistY / 2), Math.ceil(hairDistY / 2)+hairDistY]
					var ydist = 0;
					if ((i % 3) == 0) {
						ydist = 2;
					}else{
						ydist = 1;
					}
					for (var j = 0; j < hairHeightCount; j++) {
						hairStY = hairStY + ydist;
						hairY = hairY + ydist;
						
						if ((j <= hairDistYhalf[0]) || (j >= hairDistYhalf[1])) {
						}else{
							context.lineWidth = hairWidth;
							context.moveTo(hairStX,hairStY);
							context.lineTo(hairX, hairY);
							context.stroke();
						}
					}
					if (keisubase == hairWidthCount/2) {
						keisubase--;
					}else{
						keisubase++;
					}
				}
				
			}else if (this.current[0] == "airbrush"){
				context.lineWidth = this.current[1];
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
				alparr.push(0.3 * hairpressure * 2);
				widarr.push(this.current[1]);
				shadowarr.push(15);
				caparr.push("round");
				//2点目：上
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY - (this.current[1] * 0.55));
				Xarr.push(offsetX);
				Yarr.push(offsetY - (this.current[1] * 0.55));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current[1] * 0.5);
				shadowarr.push(10);
				caparr.push("butt");
				//2点目：上,左
				/*compoarr.push("source-over");
				StXarr.push(startX - (this.current[1] * 0.45));
				StYarr.push(startY - (this.current[1] * 0.45));
				Xarr.push(offsetX - (this.current[1] * 0.45));
				Yarr.push(offsetY - (this.current[1] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current[1] * 0.5);
				shadowarr.push(10);*/
				caparr.push("round");
					//2点目：上,左2
					compoarr.push("source-over");
					StXarr.push(startX - (this.current[1] * 0.25));
					StYarr.push(startY - (this.current[1] * 0.25));
					Xarr.push(offsetX - (this.current[1] * 0.25));
					Yarr.push(offsetY - (this.current[1] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current[1] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//2点目：上,右
				/*compoarr.push("source-over");
				StXarr.push(startX + (this.current[1] * 0.45));
				StYarr.push(startY - (this.current[1] * 0.45));
				Xarr.push(offsetX + (this.current[1] * 0.45));
				Yarr.push(offsetY - (this.current[1] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current[1] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//2点目：上,右2
					compoarr.push("source-over");
					StXarr.push(startX + (this.current[1] * 0.25));
					StYarr.push(startY - (this.current[1] * 0.25));
					Xarr.push(offsetX + (this.current[1] * 0.25));
					Yarr.push(offsetY - (this.current[1] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current[1] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//3点目：下
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY + (this.current[1] * 0.55));
				Xarr.push(offsetX);
				Yarr.push(offsetY + (this.current[1] * 0.55));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current[1] * 0.5);
				shadowarr.push(5);
				caparr.push("butt");
				//3点目：下,左
				/*compoarr.push("source-over");
				StXarr.push(startX - (this.current[1] * 0.45));
				StYarr.push(startY + (this.current[1] * 0.45));
				Xarr.push(offsetX - (this.current[1] * 0.45));
				Yarr.push(offsetY + (this.current[1] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current[1] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//3点目：下,左2
					compoarr.push("source-over");
					StXarr.push(startX - (this.current[1] * 0.25));
					StYarr.push(startY + (this.current[1] * 0.25));
					Xarr.push(offsetX - (this.current[1] * 0.25));
					Yarr.push(offsetY + (this.current[1] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current[1] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//3点目：下,右
				/*compoarr.push("source-over");
				StXarr.push(startX + (this.current[1] * 0.45));
				StYarr.push(startY + (this.current[1] * 0.45));
				Xarr.push(offsetX + (this.current[1] * 0.45));
				Yarr.push(offsetY + (this.current[1] * 0.45));
				alparr.push(0.02 * hairpressure * 2);
				widarr.push(this.current[1] * 0.5);
				shadowarr.push(10);
				caparr.push("round");*/
					//3点目：下,右2
					compoarr.push("source-over");
					StXarr.push(startX + (this.current[1] * 0.25));
					StYarr.push(startY + (this.current[1] * 0.25));
					Xarr.push(offsetX + (this.current[1] * 0.25));
					Yarr.push(offsetY + (this.current[1] * 0.25));
					alparr.push(0.01 * hairpressure * 2);
					widarr.push(this.current[1] * 0.5);
					shadowarr.push(2);
					caparr.push("round");
				//3点目：左
				compoarr.push("source-over");
				StXarr.push(startX - (this.current[1] * 0.45));
				StYarr.push(startY);
				Xarr.push(offsetX - (this.current[1] * 0.25));
				Yarr.push(offsetY);
				alparr.push(0.05 * hairpressure * 2);
				widarr.push(this.current[1] * 0.5);
				shadowarr.push(10);
				caparr.push("round");
				//4点目：右
				compoarr.push("source-over");
				StXarr.push(startX + (this.current[1] * 0.45));
				StYarr.push(startY);
				Xarr.push(offsetX + (this.current[1] * 0.25));
				Yarr.push(offsetY);
				alparr.push(0.05 * hairpressure * 2);
				widarr.push(this.current[1] * 0.5);
				shadowarr.push(10);
				caparr.push("round");
				//5点目：中心（再度）
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY);
				Xarr.push(offsetX);
				Yarr.push(offsetY);
				alparr.push(0.09 * hairpressure * 2);
				widarr.push(this.current[1]);
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

			}else if (this.current[0] == "pencil"){
				context.lineWidth = this.current[1];
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
				
				//1点目：中心
				compoarr.push("source-over");
				StXarr.push(startX);
				StYarr.push(startY);
				Xarr.push(offsetX);
				Yarr.push(offsetY);
				alparr.push(0.5 * hairpressure * 2);
				widarr.push(this.current[1] * 0.90);
				shadowarr.push(1);
				caparr.push("butt");
				//5点目：中心（再度）ベースの線
				compoarr.push("source-over");
				StXarr.push(startX + (this.current[1] * 0.05));
				StYarr.push(startY - (this.current[1] * 0.09));
				Xarr.push(offsetX + (this.current[1] * 0.05));
				Yarr.push(offsetY - (this.current[1] * 0.09));
				alparr.push(1 * hairpressure * 2);
				widarr.push(this.current[1]*0.6);
				shadowarr.push(2);
				caparr.push("round");
				//6点目：中心（再々度）
				compoarr.push("source-over");
				StXarr.push(startX - (this.current[1] * 0.06));
				StYarr.push(startY + (this.current[1] * 0.085));
				Xarr.push(offsetX - (this.current[1] * 0.06));
				Yarr.push(offsetY + (this.current[1] * 0.085));
				alparr.push(1 * hairpressure * 2);
				widarr.push(this.current[1]*0.6);
				shadowarr.push(2);
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
		
		initialize : function(drawobject) {
			this.parent = drawobject;
			this.simplepen = document.getElementById("simplepen");
			this.pencil = document.getElementById("pencil");
			this.airbrush = document.getElementById("airbrush");
			this.neonpen = document.getElementById("neonpen");
			this.fudepen = document.getElementById("fudepen");
			this.calligraphy = document.getElementById("calligraphy");
			this.oilpaint = document.getElementById("oilpaint");
			this.eraser = document.getElementById("eraser");
			this.fillpen = document.getElementById("fillpen");
			
			this.sizebar = document.getElementById("pensize");
			this.colorpicker = document.getElementById("colorpicker");
			
			this.simplepen.addEventListener("click", function(event) {
				Draw.pen.setSimplePen(Draw.context);
				document.getElementById("btn_menu").click();
			}, false);
			this.pencil.addEventListener("click", function(event) {
				Draw.pen.setPencil(Draw.context);
				document.getElementById("btn_menu").click();
			}, false);
			this.airbrush.addEventListener("click", function(event) {
				Draw.pen.setAirbrush(Draw.context); // change edit style to "airbrush".
				document.getElementById("btn_menu").click();
			}, false);
			this.neonpen.addEventListener("click", function(event) {
				Draw.pen.setNeonpen(Draw.context); // change edit style to "neonpen".
				document.getElementById("btn_menu").click();
			}, false);
			this.fudepen.addEventListener("click", function(event) {
				Draw.pen.setFudePen(Draw.context); // change edit style to "fudepen".
				document.getElementById("btn_menu").click();
			}, false);
			this.calligraphy.addEventListener("click", function(event) {
				Draw.pen.setcalligraphy(Draw.context); // change edit style to "calligraphy".
				document.getElementById("btn_menu").click();
			}, false);
			this.oilpaint.addEventListener("click", function(event) {
				Draw.pen.setOilPaintPen(Draw.context); // change edit style to "oilpaint".
				document.getElementById("btn_menu").click();
			}, false);
			this.eraser.addEventListener("click", function(event) {
				Draw.pen.setEraser(Draw.context); // change edit style to "eraser".
				document.getElementById("btn_menu").click();
			}, false);
			this.fillpen.addEventListener("click", function(event) {
				Draw.pen.setFillpen(Draw.context); // change edit style to "eraser".
				document.getElementById("btn_menu").click();
			}, false);
			
		}
	};
