var appname = "PaintMeister";
var appversion = "1.0.16.24";
var virtual_pressure = {
	//absolute
	'90' : 1,  //z
	'88' : 5,  //x
	'67' : 10,  //c
	'86' : 15,  //v
	'66' : 20,  //b
	'78' : 25,  //n
	'77' : 30,  //m
	'188' : 35,  //,
	'190' : 40,  //.
	'191' : 45,  ///
	'226' : 50,  //\

	'65' : 50,  //a
	'83' : 55,  //s
	'68' : 60,  //d
	'70' : 65,  //f
	'71' : 70,  //g
	'72' : 75,  //h
	'74' : 80,  //j
	'75' : 85,  //k
	'76' : 90,  //l
	'187' : 95,  //;
	'186' : 100,  //:
	
	//relative
	'81' : -3, //q
	'87' : 3, //w
	'37' : 50, //->
	'39' : 50 //<-
};
function calculatePosition(eventtype,event,target,opt) {
	var pos = {"x" : 0, "y" : 0};
	if (event.offsetX === undefined) {
		if (event.layerX === undefined) {
			if (event.type == eventtype) {
				pos.x = event.changedTouches[0].pageX - target.offsetLeft - opt.offset; // for Android
			} else {
				pos.x = event.pageX - target.offsetLeft - opt.offset;
			}
		}else{
			if (event.type == eventtype) {
				pos.x = event.changedTouches[0].pageX - target.offsetLeft - opt.offset + event.layerX - opt.canvasspace.w; // for Android
			}else{
				pos.x = event.layerX - opt.offset;
			}
		}
	} else {
		pos.x = event.offsetX - opt.offset;
	}
	
	if (event.offsetY === undefined) {
		if (event.layerY === undefined) {
			if (event.type == eventtype) {
				pos.y = event.changedTouches[0].pageY - target.offsetTop - opt.offset; // for Android
			} else {
				pos.y = event.pageY - target.offsetTop - offset;
			}
		}else{
			if (event.type == eventtype) {
				pos.y = event.changedTouches[0].pageY - target.offsetTop - opt.offset + event.layerY - opt.canvasspace.h; // for Android
			}else{
				pos.y = event.layerY - opt.offset;
			}
		}
	} else {
		pos.y = event.offsetY - opt.offset;
	}
	return pos;
}
//#################################################################################
//#################################################################################
	var UndoBuffer = function (targetlayer,imagedata) {
		this.layer = targetlayer;
		this.image = imagedata;
	}
//#################################################################################
//#################################################################################
	var Draw = {
		canvas : null, 
		opecan : null,
		layer : [],
		context : null, 
		pen : null,
		sizebar : null,
		colorpicker : null,
		clearbtn : null,
		undobtn : null,
		redobtn : null,
		newbtn : null,
		canwidth : null,
		canheight: null,
		makecanvasbtn : null,
		layer_add : null,
		layer_del : null,
		pres_curline : null,
		//currentpen : ["",-1,"#000000"], //0=mode, 1=size, 2=color
		defaults : {
			"canvas" : {
				"size" : [600,400]   //0=w, 1=h
			},
			"layer" : {
				"max" : 10
			},
			"undo" : {
				"max" : 99,
			}
		},
		last : {
			"pen" : null,
			"eraser" : null
		},
		
		drawing : false,
		canvassize : [600,400],
		startX : 0,
		startY : 0,
		offset : 1,
		undohist : [],
		redohist : [],
		lastpressure : 0.5,
		keyLikePres : null,
		pressedKey : 0,
		canvasspace : 0,
		
		initialize : function() {
			this.pen = PenSet;
			this.pen.initialize(this);
			//this.canvas = document.getElementById("myCanvas");
			//this.context = this.canvas.getContext("2d");
			this.checkstat = document.getElementById("checkstat");
			this.sizebar = document.getElementById("pensize");
			this.colorpicker = document.getElementById("colorpicker");
			this.clearbtn = document.getElementById("btn_clear");
			this.undobtn = document.getElementById("btn_undo");
			this.redobtn = document.getElementById("btn_redo");
			this.canwidth = document.getElementById("canvas_width");
			this.canheight = document.getElementById("canvas_height");
			this.makecanvasbtn = document.getElementById("btn_makecanvas");
			this.layer_add = document.getElementById("lay_add");
			this.layer_del = document.getElementById("lay_del");
			this.pres_curline  = document.getElementById("pres_curline");
			this.newbtn  = document.getElementById("btn_new");
			
			
			//---other control events setup
			this.sizebar.addEventListener("change", function(event) {
				document.getElementById("lab_pensize").innerHTML = event.target.value;
				//Draw.currentpen["size"] = event.target.value;
				Draw.pen.current["size"] = event.target.value;
				//document.getElementById("info_pen_size").innerHTML = event.target.value;
			},false);
			this.colorpicker.addEventListener("change", function(event) {
				//document.getElementById("info_pen_color").innerHTML = event.target.value;
				console.log(Draw.pen.current);
				//Draw.currentpen["color"] = event.target.value;
				Draw.pen.current["color"] = event.target.value;
				console.log(event.target.value);
				//if (Draw.pen.current["color"] != "eraser"){
					Draw.context.strokeStyle = event.target.value;
					Draw.context.fillStyle = event.target.value;
					Draw.context.shadowColor = event.target.value;
				//}
				
			},false);
			this.checkstat.addEventListener("click", function(event) {
				//ダミーのキャンバスから統合した画像を作成
				Draw.prepareSaveImage();
				/*var d1 = Draw.layer[0].canvas.getContext("2d").getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]);
				var strd1 = "";
				for (var i = 0; i < d1.data.length; i++) {
					strd1 += d1.data[i] + ",";
				}
				var imgdata = c.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]);*/
				//console.log(imgdata);
				//console.log(Draw.canvas.toDataURL("image/png"));
				saveImage();
			},false);
			this.undobtn.addEventListener("click", function(event) {
				console.log(Draw.undohist);
				var obj = Draw.undohist.pop(); //一つ前の状態取得
				//Draw.redohist.push(obj);
				//console.log("redohist=");
				//console.log(Draw.redohist);
				console.log("undohist=");
				console.log(obj);
				//未操作の場合、取得した一つ前の状態が現在の状態と同じ場合
				if (!obj) return;
				if (obj.layer.getContext("2d").getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]).data == obj.image.data) {
					obj = Draw.undohist.pop();
				}
				/*if (Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]).data == obj.data) {
					//もう一つ前の状態取得
					obj = Draw.undohist.pop();
					//console.log("redohist=");
					//Draw.redohist.push(obj);
				}*/
				
				//if (obj) Draw.context.putImageData(obj,0,0);
				if (obj) {
					obj.layer.getContext("2d").clearRect(0,0,Draw.canvassize[0],Draw.canvassize[1]);
					obj.layer.getContext("2d").putImageData(obj.image,0,0);
				}
				console.log(Draw.undohist);
			},false);
			this.redobtn.addEventListener("click", function(event) {
				console.log(Draw.redohist);
				var obj = Draw.redohist.pop();
				Draw.undohist.push(obj);
				console.log(Draw.redohist);
				if (Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]).data == obj.data) {
					obj = Draw.redohist.pop();
					Draw.undohist.push(obj);
				}
				if (obj) {
					Draw.context.putImageData(obj,0,0);
				}
				console.log(Draw.redohist);
			},false);
			this.clearbtn.addEventListener("click", function(event) {
				var msg = "キャンバスの内容を全部削除します。よろしいですか？\n" +
					"(レイヤー情報、およびUNDOの履歴もすべて削除されます)";
				confirm(msg,
					Draw.clearBody
				);
				document.getElementById("btn_menu").click();
			},false);
			this.canwidth.addEventListener("change", function(event) {
				document.getElementById("lab_canwidth").innerHTML = event.target.value;
			},false);
			this.canheight.addEventListener("change", function(event) {
				document.getElementById("lab_canheight").innerHTML = event.target.value;
			},false);
			this.makecanvasbtn.addEventListener("click", function(event) {
				var wi = document.getElementById("canvas_width").value;
				var he = document.getElementById("canvas_height").value;
				console.log("wi=" + wi + ", he=" + he);
				function createbody(){
					document.getElementById("initialsetup").style.display = "none";
					document.getElementById("apptitle").style.display = "none";
					document.getElementById("ctrlpanel").style.display = "block";
					//document.getElementById("colorpalette").style.display = "block";
					//document.getElementById("layoutcontrol").style.display = "block";
					document.getElementById("prespanel").style.display = "block";
					//Draw.generateCanvas(wi, he);
					document.getElementById("canvaspanel").style.width = wi + "px";
					document.getElementById("canvaspanel").style.height = (he) + "px";
					document.getElementById("canvaspanel").style.border = "2px solid #808080";
					var lay = new DrawLayer(Draw,{"w":wi,"h":he},true,false);
					lay.canvas.className = "mostbase-canvas";
					Draw.layer.push(lay);
					Draw.layer[0].select(Draw.context);
					Draw.canvassize = [wi, he];
					Draw.defaults.canvas.size = [wi, he];
					document.getElementById("info_canvassize").innerHTML = wi + "x" + he;
					//document.getElementById("btn_panel").style.visibility = "visible";
					Draw.resizeCanvasMargin(window.innerWidth, window.innerHeight);
					if (wi > he) {
						document.getElementById("prev_img").width = "126";
					}else{
						document.getElementById("prev_img").height = "126";
					}
					Draw.pen.pencil.click();
					/*var winwid = window.innerWidth;
					var sa = window.innerWidth - Draw.canvassize[0];
					var say = window.innerHeight - Draw.canvassize[1];
					var space = Math.floor(sa / 2) - 30;
					var spacey = Math.floor(say / 2) - (say * 0.2);
					Draw.canvasspace = {"w" : space, "h" : spacey};
					//document.getElementById("basepanel").style.left = (45 + space) + "px";
					console.log("left="+space + "/" + spacey);
					ElementTransform(document.getElementById("basepanel"),"translate("+space+"px," + spacey + "px)");
					*/
					//---ダミーのキャンバスも作成
					Draw.canvas = document.createElement("canvas");
					Draw.canvas.id = "dumcanvas";
					Draw.canvas.className = "dummy-canvas";
					Draw.canvas.width = wi;
					Draw.canvas.height = he;
					Draw.canvas.style.zIndex = 0;
					document.body.appendChild(Draw.canvas);
					//---操作用のキャンバスも作成
					Draw.opecan = document.createElement("canvas");
					Draw.opecan.id = "opecanvas";
					Draw.opecan.className = "dummy-canvas";
					Draw.opecan.width = wi;
					Draw.opecan.height = he;
					Draw.opecan.style.zIndex = 0;
					document.body.appendChild(Draw.canvas);
					document.getElementById("basepanel").style.display = "block";
				}
				confirm("キャンバスを" + wi + "x" + he + "のサイズで作成します。よろしいですか？",
					createbody
				);
			},false);
			this.layer_add.addEventListener("click", function(event) {
				if (Draw.layer.length == Draw.defaults.layer.max){
					alert("これ以上レイヤーを追加することはできません。");
					return;
				}else{
					var lay = new DrawLayer(Draw,{"w":Draw.canvassize[0],"h":Draw.canvassize[1]},false,true);
					Draw.layer.push(lay);
				}
			},false);
			this.layer_del.addEventListener("click", function(event) {
				var msg = document.getElementById("info_layer").innerText + "を削除します。よろしいですか？";
				confirm(msg,
					Draw.removeLayerController
				);
			},false);
			this.pres_curline.addEventListener("change", function(event) {
				document.getElementById("presval").innerHTML = event.target.value;
			},false);
			document.getElementById("chk_enable_handpres").addEventListener("click", function(event) {
				Draw.pres_curline.disabled = !event.target.checked;
				Draw.pres_curline.value = 50;
			},false);
			this.newbtn.addEventListener("click", function(event) {
				var msg = "キャンバスの設定をリセットし、最初の画面へ戻ります。よろしいですか？";
				confirm(msg,
					Draw.returnTopMenu
				);
				document.getElementById("btn_menu").click();
			},false);
			document.getElementById("layinfo_opacity").addEventListener("change", function(event) {
				var val = event.target.value;
				Draw.getSelectedLayer().opacity(val);
			},false);
			document.getElementById("layinfo_toggle").addEventListener("change", function(event) {
				var val = event.target.checked;
				Draw.getSelectedLayer().toggleShow();
			},false);
			document.getElementById("layinfo_name").addEventListener("change", function(event) {
				var val = event.target.value;
				Draw.getSelectedLayer().name = val;
			},false);
			document.getElementById("layinfo_name").addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);
			document.getElementById("info_pen_mode").addEventListener("click", function(event) {
				if (document.getElementById("dlg_pen_mode").style.display == "none") {
					document.getElementById("dlg_pen_mode").style.display = "block";
					document.getElementById("dlg_layer").style.display = "none";
					document.getElementById("menupanel").style.display = "none";
					document.getElementById("info_layer").style.backgroundColor = "#c4fab3";
					document.getElementById("btn_menu").style.backgroundColor = "#c4fab3";
					event.target.style.backgroundColor = "#91d780";
				}else{
					document.getElementById("dlg_pen_mode").style.display = "none";
					event.target.style.backgroundColor = "#c4fab3";
				}
			},false);
			document.getElementById("info_layer").addEventListener("click", function(event) {
				console.log(event.target.style.top + "," + event.target.style.left);
				if (document.getElementById("dlg_layer").style.display == "none") {
					document.getElementById("dlg_layer").style.display = "block";
					document.getElementById("dlg_pen_mode").style.display = "none";
					document.getElementById("menupanel").style.display = "none";
					document.getElementById("info_pen_mode").style.backgroundColor = "#c4fab3";
					document.getElementById("btn_menu").style.backgroundColor = "#c4fab3";
					event.target.style.backgroundColor = "#91d780";
					//プレビューを更新
					document.getElementById("prev_img").src = Draw.getSelectedLayer().canvas.toDataURL();
				}else{
					document.getElementById("dlg_layer").style.display = "none";
					event.target.style.backgroundColor = "#c4fab3";
				}
			},false);
			document.getElementById("appNameAndVer").textContent = appname + " Ver:" + appversion;
			
			//---その他、初期化が必要な処理
			document.getElementById("dlg_pen_mode").style.display = "none";
			document.getElementById("dlg_layer").style.display = "none";
			document.getElementById("menupanel").style.display = "none";
			/*var pens = document.querySelectorAll("div#menu_right button");
			console.log(pens);
			var ul = document.querySelector("div#dlg_pen_mode ul li");
			for (var i = 0; i < ul.length; i++) {
				ul[i].onclick = pens[i].onclick;
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
		},
		clearBody : function (){
			//参照コンテキストをメインのキャンバスに戻す
			console.log(this.layer);
			Draw.layer[0].select(null);
			Draw.context = Draw.layer[0].canvas.getContext("2d");
			Draw.removeLayerAll();
			//---メインのキャンバスだけは直接クリアのみ
			Draw.context.clearRect(0,0,Draw.canvassize[0],Draw.canvassize[1]);
			for (var i = 0; i < Draw.undohist.length; i++) {
				delete Draw.undohist[i];
			}
			Draw.undohist.splice(0,Draw.undohist.length);
			Draw.redohist.splice(0,Draw.redohist.length);
			Draw.undohist = [];
			Draw.redohist = [];
			//document.getElementById("previewer").src = null;
		},
		returnTopMenu : function (){
			Draw.clearBody();
			//---メインも完全削除
			document.getElementById("canvaspanel").removeChild(document.getElementById(Draw.layer[0].canvas.id));
			//own.control.remove();
			document.getElementById("lay_btns").removeChild(document.getElementById(Draw.layer[0].control.id));
			Draw.layer.splice(0,1);
			
			ElementTransform(document.getElementById("basepanel"),"translate(0,0)");
			document.getElementById("basepanel").style.display = "none";
			document.getElementById("initialsetup").style.display = "block";
			document.getElementById("apptitle").style.display = "block";
			document.getElementById("ctrlpanel").style.display = "none";
			//document.getElementById("colorpalette").style.display = "none";
			//document.getElementById("layoutcontrol").style.display = "none";
			document.getElementById("prespanel").style.display = "none";
		},
		getSelectedLayerIndex : function (){
			var ls = this.layer;
			for (var i = 0; i < ls.length; i++) {
				if (ls[i].selected) {
					return i;
				}
			}
			return -1;
		},
		getSelectedLayer : function (){
			var inx = this.getSelectedLayerIndex();
			if (inx > -1) {
				return this.layer[inx];
			}else{
				return null;
			}
		},
		moveLayer : function (target,direction){
			
		},
		removeLayer : function (i,isremoveArray){
			if (this.layer[i].destroy()) {
				if (isremoveArray) {
					this.layer.splice(i,1);
				}
			}else{
				alert("メインのキャンバスもしくはロックがかかったレイヤーは削除できません。");
				return false;
			}
		},
		removeLayerAll : function (){
			for (var i = 1 ; i < this.layer.length; i++) {
				this.removeLayer(i,false);
			}
			this.layer.splice(1,this.layer.length);
		},
		removeLayerController : function (){
			var layindex = Draw.getSelectedLayerIndex();
			Draw.removeLayer(layindex,true);
			//---後始末：選択レイヤーの変更
			Draw.layer[layindex-1].control.click();
			//---後始末：レイヤーの優先度の再生成
			console.log("Draw.layer=");
			console.log(Draw.layer);
			for (var i = 0; i < Draw.layer.length; i++) {
				var lay = Draw.layer[i];
				lay.parent = Draw;
				lay.canvas.style.zIndex = i+1;
				lay.control.title = lay.canvas.style.zIndex;
				lay.control.innerHTML = lay.canvas.style.zIndex;
			}
			
		},
		resizeCanvasMargin : function (winwidth, winheight){
			var sa = winwidth - this.canvassize[0];
			var say = winheight - this.canvassize[1];
			var space = Math.floor(sa / 2) - (sa * 0.090); //30;
			var spacey = Math.floor(say / 2) - 100; //(say * 0.2);
			this.canvasspace = {"w" : space, "h" : spacey};
			//document.getElementById("basepanel").style.left = (45 + space) + "px";
			console.log("left="+space + "/" + spacey);
			ElementTransform(document.getElementById("basepanel"),"translate("+space+"px," + spacey + "px)");
		},
		prepareSaveImage : function(){
			//ダミーのキャンバスから統合した画像を作成
			var c = Draw.canvas.getContext("2d");
			c.clearRect(0,0,Draw.canvassize[0],Draw.canvassize[1]);
			c.fillStyle = "#FFFFFF";
			c.fillRect(0, 0, Draw.canvassize[0], Draw.canvassize[1]);
			for (var obj in Draw.layer) {
				if (Draw.layer[obj].isvisible) {
					c.globalAlpha = Draw.layer[obj].Alpha / 100; //canvas.getContext("2d").globalAlpha;
					c.globalCompositeOperation = Draw.layer[obj].CompositeOperation; //canvas.getContext("2d").globalCompositeOperation;
					c.drawImage(Draw.layer[obj].canvas,0,0);
				}
			}
		},
		prepareSaveProject : function (){
			var rawdatas = [];
			var fnldata = "";
			for (var obj in this.layer) {
				var r = "";
				r = this.layer[obj] = canvas.data.join(",");
				rawdatas.push("#" + r.length + "#" + r);
			}
			fnldata = rawdatas.join("\t");
			fnldata += "EOF:" + rawdatas.length;
			return fnldata;
		},
		loadProject : function(data){
			var pos_eof = data.indexOf("EOF:");
			var alllen = parseInt(data.substr(pos_eof+4,data.length));
			if (isNaN(alllen)) return false;
			
		},
		touchStart : function(event) {
			this.drawing = true;
			
			var pos  = calculatePosition("touchstart",event,this.context.canvas,{
				"offset" : this.offset,
				"canvasspace":this.canvasspace
			});
			this.startX = pos.x;
			this.startY = pos.y;
			document.getElementById("info_currentpos").textContent = this.startX + "x" + this.startY;
			//document.getElementById("log2").innerHTML = event.button;
			//---右クリック、スタイラスペンの反対側は消しゴムに設定
			if ((event.button == 2) || (event.button == 5)) {
				console.log("this.last.pen.name=" + this.last.pen.name);
				var svv;
				if ((this.last.eraser) && (this.pen.current.mode == this.last.eraser.name)) {
					//現在のペンモードがまだ消しゴムの場合、太さだけを変化
					svv = this.sizebar.value;
				}else{
					//それ以外の場合、消しゴムのデフォルト太さを採用
					svv = 20;
				}
				this.pen.eraser.click();
				this.pen.setEraser(this.context,{"size":svv});
			}else{
				//再びペンの先などでタッチされたら、前のペンを再採用する
				if (this.last.pen.name != this.pen.current.mode) {
					this.last.pen["func"].click();
				}
			}
			//---Undoに保管
			//this.undohist.push(Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]));
			this.undohist.push(new UndoBuffer(Draw.context.canvas,Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1])));
			if (this.undohist.length > this.defaults.undo.max) {
				var o = this.undohist.shift();
				delete o;
			}
			//console.log(this.undohist);
			//document.getElementById("log3").innerHTML = event.keyCode;
			//console.log("start, event.button=");
			//console.log(event);
			this.keyLikePres = event.keyCode;
			//色選択をここでも確定
			this.pen.current["color"] = this.colorpicker.value;
			//console.log(this.colorpicker.value);
			if (this.pen.current["color"] != "eraser"){
				this.context.strokeStyle = this.colorpicker.value;
				this.context.fillStyle = this.colorpicker.value;
				this.context.shadowColor = this.colorpicker.value;
				/*document.getElementById("log").innerHTML = "log=" + event.clientX + "x" + event.clientY + "/" + this.startX + "x" + this.startY + "<br/>";
				document.getElementById("log2").innerHTML = "log2=page=" + event.pageX +"x" + event.pageY + "/canvas.offset" + this.context.canvas.offsetLeft +"x"+ this.context.canvas.offsetTop + "<br/>" +
				this.offset + "<br/>" +
				"/layer=" + event.layerX + "x" + event.layerY + "/offset=" + event.offsetX + "x"  + event.offsetY + "<br/>" 
				+ this.canvasspace + "=" + (event.changedTouches ? event.changedTouches[0].pageX : 0) + "x" + (event.changedTouches ? event.changedTouches[0].pageY : 0);
				*/
				//console.log(event.changedTouches);
			}
			if (this.pen.pentype == "fill") {
				this.pen.drawMain(this.context,this.startX,this.startY,1,1);
				this.drawing = false;
			}
		},
		
		touchMove : function(event) {
			var offsetX = 0;
			var offsetY = 0;
			var pos  = calculatePosition("touchmove",event,this.context.canvas,{
				"offset" : this.offset,
				"canvasspace":this.canvasspace
			});
			offsetX = pos.x;
			offsetY = pos.y;
			document.getElementById("info_currentpos").textContent = Math.round(offsetX) + "x" + Math.round(offsetY);
			if (this.drawing) {
			//console.log("move, event.button=");
			//console.log(event);
				//pen pressure calc
				this.pen.prepare(event,this.context,this.keyLikePres);
				//document.getElementById("info_pen_size").innerHTML = this.context.lineWidth;
				//document.getElementById("log3").innerHTML = event.tiltX;
				//---筆ごとの描画開始
				document.getElementById("log").textContent = this.startX + "x" + this.startY + " -> " + offsetX + "x" + offsetY;
				//---補完判定・処理開始
				var saX = offsetX - this.startX;
				var saY = offsetY - this.startY;
				var ju_saX = Math.abs(saX);
				var ju_saY = Math.abs(saY);
				var pmX = (saX < 0 ? -1 : 1); //+-基準値
				var pmY = (saY < 0 ? -1 : 1); //+-基準値
				/*console.log("=====");
				console.log("start=" + this.startX + "x" + this.startY);
				console.log("offset=" + offsetX + "x" + offsetY);
				console.log("sa=" + saX + "x" + saY);
				console.log("pm=" + pmX + "x" + pmY);*/
				//---距離が一定を超えた＆補完有効フラグがtrueのブラシのみ自動補正
				if ((ju_saX > this.pen.current["size"]*1) || (ju_saY > this.pen.current["size"]*1)){
					if (this.pen.current["complete"]) {
						//---補完算出開始
						var completeCount = 0;
						if (ju_saX > ju_saY) {
							completeCount = Math.ceil(ju_saX / (this.pen.current["size"]*0.5));
						}else{
							completeCount = Math.ceil(ju_saY / (this.pen.current["size"]*0.5));
						}
						//completeCount = 5;
						//console.log("ju_sa=" + ju_saX + "/" + ju_saY + ",completeCount=" + completeCount);
						var cplarr = [];
						var prevpos = {"x":this.startX,"y":this.startY};
						for (var c = 0; c < completeCount; c++) {
							var bigsa;
							var littlesa;
							var bigpoint;
							var littlepoint;
							var isbigX = false;
							var pos = {"x":0,"y":0};
							var keisu = 0;
							var movepoint = 0;
							
							pos.x = prevpos.x + (ju_saX / completeCount * pmX);
							pos.y = prevpos.y + (ju_saY / completeCount * pmY);
							/*if (ju_saX > ju_saY) {
								bigsa = ju_saX;
								littlesa = ju_saY;
								bigpoint = prevpos.x;
								littlepoint = prevpos.y;
								isbigX = true;
								
								pos.x = prevpos.x + (this.pen.current["size"]/4 * pmX);
								keisu = pos.x / prevpos.x;
								movepoint = ju_saY / completeCount; //littlesa - (littlesa * keisu);
								pos.y = prevpos.y + (movepoint * pmY);
							}else{
								bigsa = ju_saY;
								littlesa = ju_saX;
								bigpoint = prevpos.x;
								littlepoint = prevpos.y;
								isbigX = false;
								
								pos.y = prevpos.y + (this.pen.current["size"]/4 * pmY);
								keisu = pos.y / prevpos.y;
								movepoint = ju_saX / completeCount; //littlesa - (littlesa * keisu);
								pos.x = prevpos.x + (movepoint * pmX);
							}*/
							/*console.log("prevpos=" + prevpos.x + "x" + prevpos.y);
							console.log("<>pos=" + pos.x + "x" + pos.y);
							console.log("keisu=" + keisu);*/
							//if (c == completeCount-1) {
								if ((saX > 0) && (pos.x > offsetX)) pos.x = offsetX;
								if ((saX < 0) && (pos.x < offsetX)) pos.x = offsetX;
								if ((saY > 0) && (pos.y > offsetY)) pos.y = offsetY;
								if ((saY < 0) && (pos.y < offsetY)) pos.y = offsetY;
							//}
							//cplarr.push(pos);
							
							this.pen.drawMain(this.context,
								prevpos.x,prevpos.y,
								pos.x,pos.y
							);
							/*console.log("no." + c + ":" + 
								Math.round(prevpos.x) + "x" + Math.round(prevpos.y) + 
								" -> " + Math.round(pos.x) + "x" + Math.round(pos.y));
								*/
							prevpos = pos;
						}
						//if ((prevpos.x != offsetX || prevpos.y != offsetY)) {
							this.pen.drawMain(this.context,
								prevpos.x,prevpos.y,
								offsetX,offsetY
							);
						//}
					}else{
						this.pen.drawMain(this.context,this.startX,this.startY,offsetX,offsetY);
					}
				}else{
					this.pen.drawMain(this.context,this.startX,this.startY,offsetX,offsetY);
				}
				
				this.startX = offsetX;
				this.startY = offsetY;
			}
			event.preventDefault();
		},
		touchEnd : function(event) {
			this.drawing = false;
			//	document.getElementById("log").innerHTML = this.startX + "x" + this.startY + " -> " + offsetX + "x" + offsetY;
			//document.getElementById("log3").innerHTML = event.tiltX;
			//console.log("end, event.button=");
			//console.log(event);
		},
		touchLeave : function(event){
			//console.log("leave, event.button=");
			//console.log(event);
			if (this.drawing)  {
				var pos  = calculatePosition("touchmove",event,this.context.canvas,{
					"offset" : this.offset,
					"canvasspace":this.canvasspace
				});
				offsetX = pos.x;
				offsetY = pos.y;
				this.pen.drawMain(this.context,this.startX,this.startY,offsetX,offsetY);
			}
			//this.drawing = false;
		},
		touchEnter : function(event){
			//console.log("enter, event.button=");
			//console.log(event);
			if (this.drawing) {
				var pos  = calculatePosition("touchmove",event,this.context.canvas,{
					"offset" : this.offset,
					"canvasspace":this.canvasspace
				});
				this.startX = pos.x;
				this.startY = pos.y;
				
				
			}
		}
	};
