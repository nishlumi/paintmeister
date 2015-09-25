var appname = "PaintMeister";
var appversion = "1.0.62.44";
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
	'69' : 50, //e
	'37' : 50, //->
	'39' : 50 //<-
};
var plugin_hostpath = [
	"https://1681f097ba2c27b904a58c88939d90e3b76de92e.googledrive.com/host/0BybsGSqkFuyuM1k5WXJIR2RxdW8/"
];
function calculatePosition(eventtype,event,target,opt) {
	var pos = {"x" : 0, "y" : 0};
	var bcrect = event.target.getBoundingClientRect();
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
		//if (navigator.userAgent.indexOf("Firefox") > -1) {
		if (checkBrowser() == "firefox") {
			
			//pos.x = event.offsetX - opt.offset - event.target.offsetParent.offsetLeft - event.target.offsetParent.offsetParent.offsetLeft - event.target.offsetParent.clientLeft;
			pos.x = event.clientX - bcrect.x;
		}else{
			pos.x = event.offsetX - opt.offset;
		}
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
		//if (navigator.userAgent.indexOf("Firefox") > -1) {
		if (checkBrowser() == "firefox") {
			//pos.y = event.offsetY - opt.offset - event.target.offsetParent.clientTop - event.target.offsetParent.offsetTop - event.target.offsetParent.offsetParent.offsetTop;
			pos.y = event.clientY - bcrect.y;
		}else{
			pos.y = event.offsetY - opt.offset;
		}
	}
	return pos;
}
function download(url,filename) {
	var elem = document.getElementById("dl_a");
	elem.download = filename;
	elem.href = url;
	elem.click();
}
//#################################################################################
//#################################################################################
var UndoType = {
	"paint" : "0",
	"layadd" : "1",
	"laydel" : "2",
	"" : ""
};
var UndoBuffer = function (undotype,targetlayer,imagedata) {
	var own = this;
	this.type = undotype;
	this.layer = targetlayer;
	/*
		対応関係
		[n-1].image == [n].prev_image
	*/
	this.image = imagedata;
	this.prev_image = null;
	this.destroy = function(){
		own.layer = null;
		own.image = null;
		own.prev_image = null;
	}
}
var selectionType = {
	"box" : 0,
	"free" : 1,
	"move" : 2,
	"rotate" : 3,
	"scale" : 4,
	"tempdraw" : 5
};
var selectActionType = {
	"clip" : 0,
	"copy" : 1,
	"cut" : 2,
	"paste" : 3,
	"copy_concat" : 4
};
var selectionStatus = {
	"during" : 0,
	"end" : 1,
	"paste_begin": 2,
	"pasting" : 3,
	"paste_end" : 4
}
var Selector = function(id){
	var own = this;
	this.id = "";
	this.x = 0;
	this.y = 0;
	this.destx = 0;
	this.desty = 0;
	this.origdestx = 0;
	this.origdesty = 0;
	this.w = 0;
	this.h = 0;
	this.destw = 0;
	this.desth = 0;
	this.directionx = 1;
	this.directiony = 1;
	this.points = [];
	this.oldx = 0;
	this.oldy = 0;
	this.rotateangle = 0;
	this.scalingMagni = 100;
	this.curfrom = null;
	this.status = selectionStatus.during;
	this.action = selectActionType.clip;
	this.selectType = selectionType.box;
	this.selectFormat = selectionType.box;
	this.selectDrawtype = "";
	this.addPoint = function(x,y) {
		var o = {"x" : x, "y" : y};
		own.points.push(o);
	};
	this.calculateAngle = function() {
		var lt = {}, rb = {};
		if (own.x > own.origdestx) {
			lt["x"] = own.origdestx;
			rb["x"] = own.x - own.origdestx;
		}else{
			lt["x"] = own.x;
			rb["x"] = own.origdestx - own.x;
		}
		if (own.y > own.origdesty) {
			lt["y"] = own.origdesty;
			rb["y"] = own.y - own.origdesty;
		}else{
			lt["y"] = own.y;
			rb["y"] = own.origdesty - own.y;
		}
		return {"lt":lt, "rb":rb};
	};
	this.copyFrom = function(orig) {
		own.x = orig.x;
		own.y = orig.y;
		own.destx = orig.destx;
		own.desty = orig.desty;
		own.origdestx = orig.origdestx;
		own.origdesty = orig.origdesty;
		own.w = orig.w;
		own.h = orig.h;
		own.directionx = orig.directionx;
		own.directiony = orig.directiony;
		own.oldx = orig.oldx;
		own.oldy = orig.oldy;
		own.rotateangle = orig.rotateangle;
		own.points.splice(0,own.points.length);
		own.points = own.points.concat(orig.points);
		own.status = selectionStatus.during;
		own.action = selectActionType.clip;
		own.selectType = selectionType.box;
		own.selectDrawtype = orig.selectDrawtype;
	}
	this.setToContext = function(){
		if (own.points.length > 0) {
			Draw.context.beginPath();
			Draw.context.moveTo(own.points[0].x,own.points[0].y);
			//console.log(own.points[0].x + "x" + own.points[0].y);
			for (var i = 1; i < own.points.length; i++) {
				Draw.context.lineTo(own.points[i].x,own.points[i].y);
				console.log(own.points[i].x + "x" + own.points[i].y);
			}
			Draw.context.closePath();
		}
	}
}
var Selectors = function(){
	var own = this;
	this.items = [];
	this.add = function(selector) {
		own.items.push(selector);
	}
	this.remove = function(id) {
		for (var i = 0; i < own.items.length; i++) {
			if (id == own.items[i].id) {
				var o = own.items.splice(i,1);
				o = null;
				break;
			}
		}
	}
	this.clear = function (){
		for (var i = 0; i < own.items.length; i++) {
			var o = own.items[i];
			o = null;
		}
		own.items.splice(0,own.items.length);
	}
	this.find = function(x,y) {
		for (var i = 0; i < own.items.length; i++) {
			var it = own.items[i];
			if ((it.directionx == 1) && (it.directiony == 1)) {
				if (((it.x <= x) && (x <= it.destx)) && ((it.y <= y) && (y <= it.desty))) {
					return it;
				}
			}
			if ((it.directionx == -1) && (it.directiony == 1)) {
				if (((it.x >= x) && (x >= it.destx)) && ((it.y <= y) && (y <= it.desty))) {
					return it;
				}
			}
			if ((it.directionx == 1) && (it.directiony == -1)) {
				if (((it.x <= x) && (x <= it.destx)) && ((it.y >= y) && (y >= it.desty))) {
					return it;
				}
			}
			if ((it.directionx == -1) && (it.directiony == -1)) {
				if (((it.x >= x) && (x >= it.destx)) && ((it.y >= y) && (y >= it.desty))) {
					return it;
				}
			}
		}
	}
}
//#################################################################################
//#################################################################################
	var Draw = {
		canvas : null,	//ダミーキャンバス 
		canvas2: null,	//クリップ領域など裏操作用
		gridcan : null, //グリッド用のキャンバス
		opecan : null,	//操作用キャンバス1
		opeselcan : null, //操作・選択用キャンバス
		screencan : null,	//実際の画面操作受付用のキャンバス
		layer : [],
		layermax : 0,
		context : null,
		screencontext : null,
		gridcontext : null,
		opecontext : null,
		opeselcontext : null,
		currentLayer : null,
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
		progresspanel : null,
		usercursor : null,
		screendiv : null,
		enablegrid : null,
		//currentpen : ["",-1,"#000000"], //0=mode, 1=size, 2=color
		defaults : {
			"canvas" : {
				"size" : [600,400]   //0=w, 1=h
			},
			"layer" : {
				"max" : 40
			},
			"undo" : {
				"divide" : 5,
				"max" : 99,
			},
			"scalemin" : 0.25,
			"scalemax" : 8.0,
			"cliphistory" : 10,
			"smooth_correction" : 3,
			"sv_paletteloc_num" : 5,
			"transform_style" : [
				"translateX(%d)",
				"translateY(%d)",
				"scale(%d)",
				"rorate(%ddeg)",
			]
		},
		last : {
			"pen" : null,
			"eraser" : null
		},
		variables : {
			"copybtn" : {
				touching : false,
				x : 0,
				y : 0,
				mode : ""
			},
			"htmlbox_align" : "",
			"cursormode" : "",
			"cursorpos" : {x : 0, y : 0},
			"gridwidth" : 0,
			"gridheight" : 0
		},
		drawing : false,
		focusing : false,
		canvassize : [600,400],
	    imagelength: 0,
		startX : 0,
		startY : 0,
		startPressure : 0,
		offset : 1,
		undoindex : -1,
		canundo : false,
		undohist : [],
		canredo : false,
		redohist : [],
		//lastpressure : 0.5,
		keyLikePres : null,
		pressedKey : 0,
		canvasspace : 0,
		transform_value : [
			"0%",			//translateX
			"25%",			//translateY
			1.0,		//scale
			0			//rotate
		],
		transform_style : [
			"translateX(%d)",
			"translateY(%d)",
			"scale(%d)",
			"rotate(%ddeg)",
		],
		is_scaling : false,
		scale_pos : {
			"begin" : null,
			"end" : null
		},
		init_scale : 1.0,
		during_scale : 1.0,
		is_rotating : false,
		init_rotate : 0,
		during_rotate : 0,
		during_distance : 0,
		during_translate : { 
			x : 0,
			y : 0
		},
		touchpoints : {
		},
		drawpoints : [],
		is_scrolling : false,
		vCtrl_for_scroll : false,
		vCtrl_for_aroundgrid : false,
		is_spoiting : false,
		is_drawing_line : false,
		drawing_type : "line",
		is_selecting : false,
		select_type : "box",
		select_operation : "clip",
		select_clipboard : null,
		elementParameter : {},
		draw_linehist : [],
		urlparams : {}, //for webapp
		filename : "",
		filelist : [],
		discomplete_count : {
			"cnt" : 0,
			"dir" : "x",
			"startx" : 0,
			"starty" : 0,
			"offsetx": 0,
			"offsety": 0,
			"ju_sax" : 0,
			"ju_say" : 0
		},
		is_discomplete : false,
		delay : {
			flag : false,
			count : 0,
			smooth : 0,
			poshist : []
		},
		selectors : null,
		cliphist : [],
		palmrest : {
			"left" : null,
			"right": null
		},
		
		initialize : function() {
			this.pen = PenSet;
			this.pen.initialize(this);
			//this.canvas = document.getElementById("myCanvas");
			//this.context = this.canvas.getContext("2d");
			this.checkstat = document.getElementById("btn_save");
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
			this.progresspanel = document.getElementById("progresspanel");
			this.selectors = new Selectors();
			this.select_clipboard = new Selector();
			this.usercursor = document.getElementById("dumcursor");
			this.enablegrid = document.getElementById("chk_enable_grid");
			//---other control events setup
			//---初期画面コントロール-----------------------------------------
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
				function call_createbody(){
					Draw.createbody(wi,he,true);
				}
				var msg = _T("makecanvasbtn_click_msg",[wi,he]);
				//"キャンバスを" + wi + "x" + he + "のサイズで作成します。よろしいですか？"
				confirm(msg,
					call_createbody
				);
			},false);
			//========================================================================================
			//---メイン画面
			//========================================================================================
			document.getElementById("info_brush_size").addEventListener("click", function(event) {
				delete Draw.pen.saved.size[Draw.pen.current.mode];
				if (Draw.pen.current.mode == "eraser") {
					Draw.pen.setEraser(Draw.context);
				}else{
					//選択中のペンを呼び戻してデフォルト値をセット。
					//Draw.pen.current["size"] = Draw.pen.items[Draw.pen.current.mode].defaults[0];
					Draw.last.pen["func"].click();
				}
				Draw.start_drawCursor(event,Draw.pen.current.size,{x:Draw.startX, y:Draw.startY});
			},false);
			this.sizebar.addEventListener("change", function(event) {
				document.getElementById("lab_pensize").innerHTML = event.target.value;
				//Draw.currentpen["size"] = event.target.value;
				Draw.pen.current["size"] = event.target.value;
				Draw.pen.saved.size[Draw.pen.current.mode] = event.target.value;
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
			this.colorpicker.addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);
			this.checkstat.addEventListener("click", function(event) {
				//ダミーのキャンバスから統合した画像を作成
				Draw.prepareSaveImage(Draw.canvassize[0],Draw.canvassize[1],false);
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
			document.getElementById("btn_saveproj").addEventListener("click", function(event) {
				document.getElementById("progressicon").className = "get-animestart";
				Draw.progresspanel.style.display = "block";
				
				//Draw.prepareSaveProject()
				var wkr = new Worker("js/wkr_drawmain.js");
				wkr.addEventListener("message",function(evt){
					saveProject(evt.data);
				},false);
				wkr.addEventListener("error",function(evt){
					//alert("プロジェクトファイルの保存中にエラーが発生しました<br/>"+
					alert(_T("btn_saveproj_click_msg1")+
						evt.message + "<br/>" +
						evt.filename + " , line number=" + evt.lineno + "<br/>"
					);
				},false);
				//=======
				var pstdata = {};
				pstdata["appversion"] = appversion;
				pstdata["canvassize"] = Draw.canvassize;
				pstdata["imagedata"] = {"length":Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]).data.length};
				Draw.prepareSaveImage(100,100,true);
				pstdata["thumb"] = Draw.canvas.toDataURL("image/png");
				pstdata["layer"] = [];
				for (var obj in Draw.layer) {
					var lay = {"title": "", "isvisible":true, "Alpha":0, "data":""};
					var con = Draw.layer[obj].canvas.getContext("2d");
					var imgd = con.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]);
					lay.title = Draw.layer[obj].title;
					lay.isvisible = Draw.layer[obj].isvisible;
					lay.Alpha = Draw.layer[obj].Alpha;
					lay.data = imgd.data;
					pstdata["layer"].push(lay);
				}
				document.getElementById("prg_btn_cancel").onclick = function(event) {
					wkr.terminate();
					Draw.progresspanel.style.display = "none";
					document.getElementById("progressicon").className = "";
				}
				//=======
				wkr.postMessage(pstdata);
				//saveProject(Draw.prepareSaveProject);
				
				return;
				//var bb = new Blob([data],{type:"text/txt"});
				//download(window.URL.createObjectURL(bb),"sample.txt");
			},false);
			document.getElementById("btn_openfile").addEventListener("click", function(event) {
				console.log(document.getElementById("fl_projpath").value);
				var files = document.getElementById("fl_projpath").files;
				//if (navigator.userAgent.indexOf("Chrome") > -1) {
				if (checkBrowser().indexOf("chrome") != -1) {
					if (files.length == 0) {
						//---ファイルが0件の場合はフォルダで選択
						files = document.getElementById("fl_projdir").files;
						//document.getElementById("dlg_filelist_header")
						var path = files[0].webkitRelativePath.split("/")[0];
						document.getElementById("dlg_filelist_header").textContent = path;
					}
					//if (chrome.fileSystem) {
					if (checkBrowser() == "chromeapps") {
						//---chromeappsで0件の場合はフォルダから選択
						if (files.length == 0) {
							chrome.fileSystem.chooseEntry({
								"type" : "openDirectory"
							},function(entry){
								console.log(entry);
								document.getElementById("dlg_filelist_header").textContent = entry.name;
								var reader = entry.createReader();
								reader.readEntries(function(result){
									if (result.length > 0) {
										$("#dlg_filelist").css({"display":"block"});
									}
									for (var i = 0; i < result.length; i++) {
										result[i].file(function(f){
											preloadProjectFile(f);
										});
									}
									
								});
							});
							return;
						}
					}
					//---ここまで来ても0件の場合は終了
					if (files.length == 0) {
						document.getElementById("dlg_filelist_header").textContent = "";
						alert(_T("loadProjectFile_msg1"));
						return;
					}
				}
				if (files.length == 0) {
					event.target.value = "";
				}
				if (files.length > 1) {
					//選択ファイルが2件以上の場合はディレクトリの処理開始
					$("#dlg_filelist").css({"display":"block"});
					for (var obj in files) {
						var f = files[obj];
						preloadProjectFile(f);
					}
					return;
				}
				//---共通処理、直接開く
				//   ストアアプリ：この後ファイル選択
				console.log(files[0]);
				loadProjectFile(files);

			},false);
			document.getElementById("btn_openfolder").addEventListener("click", function(event) {
				loadProjectFolder();
			},false);
			document.getElementById("initialsetup").addEventListener("dragover", function(event) {
				event.stopPropagation();
				event.preventDefault();
				event.dataTransfer.dropEffect = "copy";
				document.getElementById("initialsetup").className = "dragover_indicate";
			},false);
			document.getElementById("initialsetup").addEventListener("dragenter", function(event) {
				console.log("drag enter=>");
				console.log(event);
			},false);
			document.getElementById("initialsetup").addEventListener("dragleave", function(event) {
				document.getElementById("initialsetup").className = "";
				event.stopPropagation();
				event.preventDefault();
			},false);
			document.getElementById("initialsetup").addEventListener("drop", function(event) {
				event.stopPropagation();
				event.preventDefault();
				document.getElementById("initialsetup").className = "";
				document.getElementById("dlg_filelist_header").textContent = "";
				var files = event.dataTransfer.files;
				if (files.length > 1) {
					//n 個のPaintMeisterプロジェクトファイル
					document.getElementById("dlg_filelist_header").textContent = 
						_T("initialsetup_drop_msg1",[files.length]);
					$("#dlg_filelist").css({"display":"block"});
					for (var obj = 0; obj < files.length; obj++) {
						var f = files[obj];
						preloadProjectFile(f);
					}
				}else{
					//if (navigator.userAgent.indexOf("Chrome") > -1) {
					if (checkBrowser().indexOf("chrome") != -1) {
						var items = event.dataTransfer.items;
						if (items.length > 0) {
							$("#dlg_filelist").css({"display":"block"});
							//フォルダやフォルダとファイルがドラッグアンドドロップされた場合
							for (var obj = 0; obj < items.length; obj++) {
								var ent = items[obj].webkitGetAsEntry();
								if (ent.isFile) {
									preloadProjectFile(items[obj].getAsFile());
								}else if (ent.isDirectory) {
									document.getElementById("dlg_filelist_header").textContent = 
										ent.name;
									ent.createReader().readEntries(function(results){
										for (var i = 0; i < results.length; i++) {
											results[i].file(function(f){
												preloadProjectFile(f);
											});
										}
									});
								}
							}
						}
					}else{
						loadProjectFile(files);
					}
				}
			},false);
			document.getElementById("dlg_filelist_close").addEventListener("click", function(event) {
				$("#dlg_filelist").css({"display":"none"});
				$("#dlg_filelist ul > li").remove();
				//---ドラッグアンドドロップで保持したデータはここですべて破棄
				Draw.clearFilelist();
				delete Draw.variables["timeoutid"];
				delete Draw.variables["oid"];
			},false);
			this.undobtn.addEventListener("click", function(event) {
				if (!Draw.canundo) return;
				//console.log(Draw.undohist);
				//var obj = Draw.undohist.pop(); //一つ前の状態取得
				var obj = Draw.undohist[Draw.undoindex];
				//console.log("undohist=");
				//console.log(obj);
				//未操作の場合、取得した一つ前の状態が現在の状態と同じ場合
				if (!obj) return;
				if ((obj.prev_image["data"]) && (obj.layer.getContext("2d").getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]).data == obj.prev_image.data)) {
					//obj = Draw.undohist.pop();
					Draw.undoindex--;
					if (Draw.undoindex < 0) Draw.undoindex = 0;
					obj = Draw.undohist[Draw.undoindex];
				}
				
				if (obj && obj.prev_image) {
					Draw.canredo = true;
					Draw.toggleRedo(true);
					//---undoの場合はprev_imageから復元
					obj.layer.getContext("2d").clearRect(0,0,Draw.canvassize[0],Draw.canvassize[1]);
					obj.layer.getContext("2d").putImageData(obj.prev_image,0,0);
					obj = null;
					Draw.undoindex--;
					if (Draw.undoindex < 0) Draw.undoindex = 0;
				}
				//console.log(Draw.undohist);
				if ((Draw.undohist.length == 0) || (Draw.undoindex == 0)) {
					Draw.canundo = false;
					Draw.toggleUndo(false);
				}
				//console.log("undoindex="+Draw.undoindex);
			},false);
			this.redobtn.addEventListener("click", function(event) {
				if (!Draw.canredo) return;
				Draw.undoindex++;
				if (Draw.undoindex >= Draw.undohist.length) Draw.undoindex = Draw.undohist.length - 1;
				var obj = Draw.undohist[Draw.undoindex];
				
				//console.log(Draw.redohist);
				if (Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]).data == obj.image.data) {
					Draw.undoindex++;
					if (Draw.undoindex >= Draw.undohist.length) Draw.undoindex = Draw.undohist.length - 1;
					obj = Draw.undohist[Draw.undoindex];
				}
				if (obj && obj.image) {
					Draw.canundo = true;
					Draw.toggleUndo(true);
					//---redoの場合はimageから復元
					obj.layer.getContext("2d").clearRect(0,0,Draw.canvassize[0],Draw.canvassize[1]);
					obj.layer.getContext("2d").putImageData(obj.image,0,0);
				}
				//console.log(Draw.undohist);
				//console.log("undoindex="+Draw.undoindex);
				if (Draw.undoindex >= Draw.undohist.length-1) {
					Draw.canredo = false;
					Draw.toggleRedo(false);
				}
			},false);
			this.clearbtn.addEventListener("click", function(event) {
				//var msg = "キャンバスの内容を全部削除します。よろしいですか？\n" +
				//	"(レイヤー情報、およびUNDOの履歴もすべて削除されます)";
				var msg = _T("clearbtn_click_msg1") + "\n" + _T("clearbtn_click_msg2");
				confirm(msg,
					Draw.clearBody
				);
				document.getElementById("btn_menu").click();
			},false);
			this.newbtn.addEventListener("click", function(event) {
				//var msg = "キャンバスの設定をリセットし、最初の画面へ戻ります。よろしいですか？";
				var msg = _T("newbtn_click_msg1");
				confirm(msg,
					Draw.returnTopMenu
				);
				document.getElementById("btn_menu").click();
			},false);
			//========================================================================================
			//---レイヤーパネル関係
			//========================================================================================
			this.layer_add.addEventListener("click", function(event) {
				if (Draw.layer.length == Draw.defaults.layer.max){
					//alert("これ以上レイヤーを追加することはできません。");
					alert(_T("layer_add_click_msg1"));
					return;
				}else{
					var lay = new DrawLayer(Draw,{"w":Draw.canvassize[0],"h":Draw.canvassize[1]},false,true);
					Draw.layer.push(lay);
				}
			},false);
			this.layer_del.addEventListener("click", function(event) {
				//var msg = document.getElementById("info_layer").innerText + "を削除します。よろしいですか？";
				var msg = _T("layer_del_click_msg1",[document.getElementById("info_layer").innerText]);
				confirm(msg,
					Draw.removeLayerController,
					function () {
				    	//alert("メインのキャンバスもしくはロックがかかったレイヤーは削除できません。");
				    	alert(_T("layer_del_click_msg2"));
					}
				);
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
				Draw.getSelectedLayer().title = val;
				document.getElementById("info_layer").textContent = val;
			},false);
			document.getElementById("layinfo_name").addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);
			document.getElementById("layinfo_lock").addEventListener("change", function(event) {
				Draw.currentLayer.SetLock(event.target.checked);
			},false);
			document.getElementById("layinfo_clip").addEventListener("change", function(event) {
				if (event.target.checked) {
					Draw.context.save();
					Draw.currentLayer.SetClip(true,null);
				}else{
					Draw.currentLayer.ClearClip(false);
				}
			},false);
			document.getElementById("layinfo_clearclip").addEventListener("click", function(event) {
				Draw.currentLayer.ClearClip(true);
				document.getElementById("layinfo_clip").checked = false;
				document.getElementById("layinfo_clip").disabled = "disabled";
				document.getElementById("layinfo_clearclip").disabled = "disabled";
			},false);
			document.getElementById("layinfo_call_cliphist").addEventListener("click", function(event) {
				var val = parseInt($("#layinfo_cliphistory").val());
				console.log(val);
				if (isNaN(val)) return;
				var o = Draw.getCliphist(parseInt($("#layinfo_cliphistory").val()));
				console.log(o);
				Draw.currentLayer.ClearClip(true);
				Draw.context.save();
				Draw.currentLayer.SetClip(true,o);
				document.getElementById("layinfo_clip").checked = true;
				document.getElementById("layinfo_clip").disabled = "";
				document.getElementById("layinfo_clearclip").disabled = "";
			},false);
			document.getElementById("layinfo_cliphistory").addEventListener("change", function(event) {
				var val = parseInt($("#layinfo_cliphistory").val());
				if (isNaN(val)) {
					document.getElementById("img_clipthumb").src = "";
				}else{
					var o = Draw.getCliphist(val);
					document.getElementById("img_clipthumb").src = o.curfrom;
				}
			},false);
			//========================================================================================
			//---サイドバー関係
			//========================================================================================
			//---スポイトツールボタン
			document.getElementById("btn_dropper").addEventListener("click", function(event) {
				if (event.target.className == "sidebar_button switchbutton_off") {
					event.target.className = "sidebar_button switchbutton_on";
					//event.target.title = "スポイト/色引き伸ばしを無効にする";
					event.target.title = _T("btn_dropper_click_msg1");
					Draw.is_spoiting = true;
				}else{
					event.target.className = "sidebar_button switchbutton_off";
					//event.target.title = "スポイト/色引き伸ばしを有効にする";
					event.target.title = _T("btn_dropper_title");
					Draw.is_spoiting = false;
				}
			},false);
			//---スクロールボタン
			document.getElementById("btn_freescroll").addEventListener("click", function(event) {
				if (event.target.className == "sidebar_button switchbutton_off") {
					event.target.className = "sidebar_button switchbutton_on";
					//event.target.title = "スクロール無効にする";
					event.target.title = _T("btn_freescroll_click_title");
					Draw.vCtrl_for_scroll = true;
				}else{
					event.target.className = "sidebar_button switchbutton_off";
					//event.target.title = "スクロール有効にする";
					event.target.title = _T("btn_freescroll_title");
					Draw.vCtrl_for_scroll = false;
					//共通のスクロールフラグもオフにする
					Draw.is_scrolling = false;
				}
			},false);
			document.getElementById("btn_aroundgrid").addEventListener("click", function(event) {
				if (event.target.className == "sidebar_button switchbutton_off") {
					event.target.className = "sidebar_button switchbutton_on";
					//event.target.title = "グリッド線に吸着無効にする";
					event.target.title = _T("btn_freescroll_click_title");
					Draw.vCtrl_for_aroundgrid = true;
				}else{
					event.target.className = "sidebar_button switchbutton_off";
					//event.target.title = "グリッド線に吸着有効にする";
					event.target.title = _T("btn_freescroll_title");
					Draw.vCtrl_for_aroundgrid = false;
				}
			},false);
			//---図形描画ボタン
			document.getElementById("btn_shapes").addEventListener("click", function(event) {
				if (event.target.className == "sidebar_button switchbutton_off") {
					if (Draw.is_selecting) {
						document.getElementById("btn_select").click();
					}
					event.target.className = "sidebar_button switchbutton_on";
					//event.target.title = "図形描画を無効にする";
					event.target.title = _T("btn_shapes_click_msg1");
					$("#box_shapes").css({"display":"block"});
					$("#prespanel").css({"width":"100px"});
					$("#pres_sub").css({"display":"block"});
					Draw.is_drawing_line = true;
				}else{
					event.target.className = "sidebar_button switchbutton_off";
					//event.target.title = "図形描画を有効にする";
					event.target.title = _T("btn_shapes_title");
					$("#box_shapes").css({"display":"none"});
					$("#prespanel").css({"width":"45px"});
					$("#pres_sub").css({"display":"none"});
					Draw.is_drawing_line = false;
					Draw.drawpoints.splice(0,Draw.drawpoints.length);
				}
				
			},false);
			var sidebar_radio_clicking = function(element, parent) {
				if (element.className == "sidebar_radiobutton sidebar_radio_off") { //オンにする
					var elm = document.querySelectorAll(".sidebar_radiobutton");
					for (var obj in elm) {
						if ((elm[obj]["id"]) && (elm[obj].id.indexOf(parent) > -1)) {
							elm[obj].className = "sidebar_radiobutton sidebar_radio_off";
						}
					}
					element.className = "sidebar_radiobutton sidebar_radio_on";
				}else{ //オフにする
					var elm = document.querySelectorAll(".sidebar_radiobutton");
					for (var obj in elm) {
						if (elm[obj].className.indexOf("sidebar_radio_on")) {
							if (elm[obj].id == element.id) {
								return;
							}
						}
					}
					if ((elm[obj]["id"]) && (elm[obj].id.indexOf(parent) > -1)) {
						element.className = "sidebar_radiobutton sidebar_radio_off";
					}
				}
			};
			var chk_shapes_clicking = function(event) {
				sidebar_radio_clicking(event.target,"chk_shapes_");
				if (event.target.className == "sidebar_radiobutton sidebar_radio_on") {
					Draw.drawing_type = String(event.target.id).replace("chk_shapes_","");
				}
			};
			document.getElementById("chk_shapes_line").addEventListener("click", chk_shapes_clicking,false);
			document.getElementById("chk_shapes_box").addEventListener("click", chk_shapes_clicking,false);
			document.getElementById("chk_shapes_circle").addEventListener("click", chk_shapes_clicking,false);
			document.getElementById("chk_shapes_triangle").addEventListener("click", chk_shapes_clicking,false);
			document.getElementById("chk_shapes_html").addEventListener("click", chk_shapes_clicking,false);
			//---テキスト挿入ボタン
			document.getElementById("dlg_htmlbox_close").addEventListener("click", function(event){
				$("#dlg_htmlbox").css({"display":"none"});
			},false);
			document.getElementById("btn_insert_htmlbox").addEventListener("click", function(event){
				$("#dlg_htmlbox").css({"display":"none"});
				Draw.prepare_drawhtml(document.getElementById("inp_htmlbox_src").value);
			},false);
			document.getElementById("inp_htmlbox_css").addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);
			document.getElementById("inp_htmlbox_src").addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);
			var htmlbox_radio_clicking = function(element, parent) {
				if (element.className == "box_radiobutton radio_none") { //オンにする
					/*var elm = document.querySelectorAll(".box_radiobutton.radio_current");
					for (var obj in elm) {
						console.log(elm[obj].id);
						if (elm[obj]["id"]) {
							console.log("  " + parent);
							if ((elm[obj].id.indexOf(parent) > -1)) {
								elm[obj].className = "box_radiobutton radio_none";
							}
							console.log(elm[obj].className);
						}
					}*/
					document.getElementById("htmlbox_align_left").className = "box_radiobutton radio_none";
					document.getElementById("htmlbox_align_center").className = "box_radiobutton radio_none";
					document.getElementById("htmlbox_align_right").className = "box_radiobutton radio_none";
					element.className = "box_radiobutton radio_current";
				}else{ //オフにする
					var elm = document.querySelectorAll(".box_radiobutton");
					for (var obj in elm) {
						if (elm[obj]["className"] && elm[obj].className.indexOf("box_radiobutton")) {
							if (elm[obj].id == element.id) {
								return;
							}
						}
					}
					if ((elm[obj]["id"]) && (elm[obj].id.indexOf(parent) > -1)) {
						element.className = "box_radiobutton radio_none";
					}
				}
			};
			var htmlbox_align_clicking = function(event) {
				htmlbox_radio_clicking(event.target," htmlbox_align_");
				if (event.target.className == "box_radiobutton radio_current") {
					Draw.variables.htmlbox_align = String(event.target.id).replace("htmlbox_align_","");
				}
			};
			document.getElementById("htmlbox_align_left").addEventListener("click", htmlbox_align_clicking,false);
			document.getElementById("htmlbox_align_center").addEventListener("click", htmlbox_align_clicking,false);
			document.getElementById("htmlbox_align_right").addEventListener("click", htmlbox_align_clicking,false);
			//---選択操作ボタン
			document.getElementById("btn_select").addEventListener("click", function(event) {
				if (event.target.className == "sidebar_button switchbutton_off") {
					if (Draw.is_drawing_line) {
						document.getElementById("btn_shapes").click();
					}
					event.target.className = "sidebar_button switchbutton_on";
					//event.target.title = "選択操作を無効にする";
					//event.target.title = _T("btn_select_click_msg1");
					$("#box_select").css({"display":"block"});
					$("#prespanel").css({"width":"100px"});
					$("#pres_sub").css({"display":"block"});
					Draw.is_selecting = true;
				}else{
					Draw.opecontext.clearRect(0,0, Draw.canvassize[0],Draw.canvassize[1]);
					Draw.selectors.clear();
					event.target.className = "sidebar_button switchbutton_off";
					//event.target.title = "選択操作を有効にする";
					//event.target.title = _T("btn_select_title");
					$("#box_select").css({"display":"none"});
					$("#prespanel").css({"width":"45px"});
					$("#pres_sub").css({"display":"none"});
					document.getElementById("sel_operationtype_paste").className = "button uibutton-mid flatbutton-disabled operation_paste";
					document.getElementById("sel_operationtype_paste").title = _T("sel_operationtype_paste_title"); //"貼り付け";
					//document.getElementById("sel_operationtype_paste").innerHTML = "&#9744";
					Draw.is_selecting = false;
					Draw.select_clipboard = new Selector();
					Draw.opeselcontext.clearRect(0,0, Draw.opeselcontext.canvas.width,Draw.opeselcontext.canvas.height);
					Draw.opecontext.clearRect(0,0, Draw.opecontext.canvas.width,Draw.opecontext.canvas.height);
					if ((Draw.select_type != "box") && (Draw.select_type != "free")) {
						document.getElementById("sel_seltype_box").click();
					}
				}
				
			},false);
			var sel_seltype_clicking = function(event) {
				/*if (Draw.select_operation == "clip") {
				}else{
					if (event.target.id == "sel_seltype_free") {
						//操作の種類がコピー・切り取り時は自由選択はできません
						alert("操作の種類がコピー・切り取り時は自由選択はできません");
						return false;
					}
				}*/
				sidebar_radio_clicking(event.target,"sel_seltype_");
				if (event.target.className == "sidebar_radiobutton sidebar_radio_on") {
					Draw.select_type = String(event.target.id).replace("sel_seltype_","");
					console.log(Draw.select_type);
				}
			};
			document.getElementById("sel_seltype_box").addEventListener("click", sel_seltype_clicking,false);
			document.getElementById("sel_seltype_free").addEventListener("click", sel_seltype_clicking,false);
			document.getElementById("sel_seltype_move").addEventListener("click", sel_seltype_clicking,false);
			document.getElementById("sel_seltype_rotate").addEventListener("click", sel_seltype_clicking,false);
			document.getElementById("sel_seltype_scale").addEventListener("click", sel_seltype_clicking,false);
			document.getElementById("sel_seltype_tempdraw").addEventListener("click", sel_seltype_clicking,false);
			var sel_operationtype_clicking = function(event) {
				if (Draw.select_type == "free") {
					if ((event.target.id == "sel_operationtype_copy") || (event.target.id == "sel_operationtype_cut")) {
						//alert("操作の種類がコピー・切り取り時は自由選択はできません");
					//	alert(_T("sel_operationtype_clicking_msg1"));
					//	return false;
					}
				}
				if (Draw.select_type == "move") {
					if ((event.target.id == "sel_operationtype_clip") || (event.target.id == "sel_operationtype_copy") || (event.target.id == "sel_operationtype_cut")) {
						//alert("移動モードの時はクリップ領域作成・コピー・切り取りはできません");
						alert(_T("sel_operationtype_clicking_msg2"));
						return false;
					}
				}
				if (event.target.className.indexOf("flatbutton-disabled") > -1) {
					//---コピー・切り取りするまで貼り付けは無効化
					return;
				}
				Draw.select_operation = String(event.target.id).replace("sel_operationtype_","");
				if (Draw.select_operation == "copy_concat") {	//結合コピー時は名目上はただのCopy
					Draw.select_operation = "copy";
					Draw.variables.copybtn.mode = "concat";
				}else{
					Draw.variables.copybtn.mode = "";
				}
				Draw.select_function_execute(event);
			};
			var dcopy = document.getElementById("sel_operationtype_copy");
			dcopy.addEventListener("click", sel_operationtype_clicking,false);
			dcopy.addEventListener("pointerdown", function(event){
				Draw.variables.copybtn.touching = true;
				var pos  = calculatePosition("touchstart",event,event.target,{
					"offset" : 0,
					"canvasspace":0
				});
				Draw.variables.copybtn.x = pos.x;
				Draw.variables.copybtn.y = pos.y;
			},false);
			dcopy.addEventListener("pointermove", function(event){
				if (Draw.variables.copybtn.touching) {
					var pos  = calculatePosition("touchstart",event,event.target,{
						"offset" : 0,
						"canvasspace":0
					});
					var saY = Draw.variables.copybtn.y - pos.y;
					var saX = Draw.variables.copybtn.x - pos.x;
					var rect = event.target.getBoundingClientRect();
					var ch = rect.height*0.5;
					var cw = rect.width * 0.5;
					var whichMode = Math.abs(saX) - Math.abs(saY) > 0 ? "rl" : "tb";
					if (whichMode == "tb") {
						if (saY > ch) { //↑
							Draw.variables.copybtn.mode = "";
						}else if ((saY < ch*-1) && ((saY * -1) > ch)) { //↓
							Draw.variables.copybtn.mode = "";
						}else{
							Draw.variables.copybtn.mode = "";
						}
					}else if (whichMode == "rl") {
						if (saX > cw) { //←
							Draw.variables.copybtn.mode = ""; 
						}else if (saX < cw*-1){ //→
							Draw.variables.copybtn.mode = "concat"; //結合コピー
						}else{
							Draw.variables.copybtn.mode = "";
						}
					}
				}
			},false);
			dcopy.addEventListener("pointerleave", function(event){
				if (Draw.variables.copybtn.touching) {
					if (Draw.variables.copybtn.mode == "concat") {
						//---結合コピー
						/*
							現在選択中のレイヤーから下のレイヤーの同一座標の
							内容を全て結合した内容をクリップボードにコピーする
						*/
						console.log("結合コピー！");
						sel_operationtype_clicking(event);
					}
					Draw.variables.copybtn.touching = false;
					Draw.variables.copybtn.mode = "";
				}
			},false);
			document.getElementById("sel_operationtype_copy_concat").addEventListener("click", sel_operationtype_clicking,false);
			document.getElementById("sel_operationtype_cut").addEventListener("click", sel_operationtype_clicking,false);
			document.getElementById("sel_operationtype_clip").addEventListener("click", sel_operationtype_clicking,false);
			document.getElementById("sel_operationtype_paste").addEventListener("click", sel_operationtype_clicking,false);
			//---手動筆圧切り替えボタン
			this.pres_curline.addEventListener("change", function(event) {
				document.getElementById("presval").innerHTML = event.target.value;
			},false);
			document.getElementById("chk_enable_handpres").addEventListener("click", function(event) {
				
				if (event.target.className == "switchbutton_off") {
					event.target.className = "switchbutton_on";
					document.getElementById("box_handpres").style.display = "block";
					Draw.pres_curline.disabled = false;
					Draw.pres_curline.value = 50;
					document.getElementById("presval").textContent = document.getElementById("pres_curline").value;
				}else{
					event.target.className = "switchbutton_off";
					document.getElementById("box_handpres").style.display = "none";
					Draw.pres_curline.disabled = true;
					document.getElementById("presval").textContent = document.getElementById("pres_curline").value;
				}
			},false);
			//========================================================================================
			//---キャンバスパネル関係
			//========================================================================================
			document.getElementById("btn_resetAllTransform").addEventListener("click", function(event) {
				Draw.transformCanvas({
					"translateX" : "0%",
					"translateY" : "0%",
					"scale" : 1.0,
					"rotate" : 0,
				});
				
				Draw.during_scale = 1.0;
				Draw.during_rotate = 0;
				Draw.during_translate = {
					x : 0,
					y : 0
				};
				//スクロールモードも強制解除（スクロールボタンONじゃない場合）
				if (!Draw.vCtrl_for_scroll) {
					if (Draw.is_scrolling) Draw.is_scrolling = false;
				}
				//拡大縮小モードも強制解除
				if (Draw.is_scaling) Draw.is_scaling = false;
				if (Draw.is_rotating) Draw.is_rotating = false;
				$("#txt_rotation").val(0).trigger("change");
				document.getElementById("info_magni").innerText = "1.0";
			}, false);
			//---拡大率ボタン
			var magarr = ["25","50","100","150","200","400","800"];
			for (var m in magarr) {
				var nm = "magni_" + magarr[m];
				//console.log(nm);
				document.getElementById(nm).addEventListener("click", function(event) {
					var name = String(event.target.id).replace("magni_","");
					Draw.scale(Number(name));
					//document.getElementById("basepanel").scrollIntoView();
				}, false);
			}
			/*document.getElementById("txt_rotation").addEventListener("change", function(event) {
				document.getElementById("lab_txt_rotation").innerHTML = event.target.value;
				Draw.transformCanvas({"rotate":event.target.value});
				//Draw.rotate(event.target.value);
			},false);*/
			document.getElementById("txt_rotation").addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);


			//========================================================================================
			//---情報パネル関係
			//========================================================================================
			document.getElementById("btn_menu").addEventListener("click", function(event) {
				if (document.getElementById("menupanel").style.display == "none") { //開く
					Draw.turnMenuPanel("menupanel","btn_menu",true);
				}else{ //閉じる
					Draw.turnMenuPanel("menupanel","btn_menu",false);
					document.body.focus();
				}
			}, false);
			document.getElementById("info_btn_canvassize").addEventListener("click", function(event) {
				if (document.getElementById("dlg_canvasinfo").style.display == "none") {
					Draw.turnMenuPanel("dlg_canvasinfo","info_btn_canvassize",true);
				}else{
					Draw.turnMenuPanel("dlg_canvasinfo","info_btn_canvassize",false);
				}
				event.preventDefault();
			},false);
			document.getElementById("info_pen_mode").addEventListener("click", function(event) {
				if (document.getElementById("dlg_pen_mode").style.display == "none") {
					Draw.turnMenuPanel("dlg_pen_mode","info_pen_mode",true);
				}else{
					Draw.turnMenuPanel("dlg_pen_mode","info_pen_mode",false);
				}
			},false);
			var blayer = document.getElementById("info_layer");
			blayer.addEventListener("click", function(event) {
				console.log(event.target.style.top + "," + event.target.style.left);
				if (document.getElementById("dlg_layer").style.display == "none") {
					Draw.turnMenuPanel("dlg_layer","info_layer",true);
					//プレビューを更新
					document.getElementById("prev_img").src = Draw.getSelectedLayer().canvas.toDataURL();
				}else{
					Draw.turnMenuPanel("dlg_layer","info_layer",false);
				}
			},false);
			blayer.addEventListener("click", sel_operationtype_clicking,false);
			blayer.addEventListener("pointerdown", function(event){
				Draw.variables.copybtn.touching = true;
				var pos  = calculatePosition("touchstart",event,event.target,{
					"offset" : 0,
					"canvasspace":0
				});
				Draw.variables.copybtn.x = pos.x;
				Draw.variables.copybtn.y = pos.y;
			},false);
			blayer.addEventListener("pointermove", function(event){
				if (Draw.variables.copybtn.touching) {
					var pos  = calculatePosition("touchstart",event,event.target,{
						"offset" : 0,
						"canvasspace":0
					});
					var saY = Draw.variables.copybtn.y - pos.y;
					var saX = Draw.variables.copybtn.x - pos.x;
					var whichMode = Math.abs(saX) - Math.abs(saY) > 0 ? "rl" : "tb";
					var rect = event.target.getBoundingClientRect();
					var ch = rect.height*0.5;
					var cw = rect.width * 0.5;
					if (whichMode == "tb") {
						if (saY > ch) { //↑
							Draw.variables.copybtn.mode = "";
						}else if ((saY < ch*-1) && ((saY * -1) > ch)) { //↓
							Draw.variables.copybtn.mode = "";
						}else{
							Draw.variables.copybtn.mode = "";
						}
					}else if (whichMode == "rl") {
						if (saX > cw) { //←
							Draw.variables.copybtn.mode = "prev"; //下のレイヤーへ
						}else if (saX < cw*-1){ //→
							Draw.variables.copybtn.mode = "next"; //上のレイヤーへ
						}else{
							Draw.variables.copybtn.mode = "";
						}
					}
				}
			},false);
			blayer.addEventListener("pointerup", function(event){
				if (Draw.variables.copybtn.touching) {
					Draw.turnLayer(Draw.variables.copybtn.mode);
					/*var index = Draw.getSelectedLayerIndex();
					if (Draw.variables.copybtn.mode == "prev") {
						//console.log("prev");
						if (index > 0) {
							Draw.layer[index-1].select(Draw.context);
						}
					}else if (Draw.variables.copybtn.mode == "next") {
						//console.log("next");
						if (index < Draw.layer.length-1) {
							Draw.layer[index+1].select(Draw.context);
						}
					}*/
					Draw.variables.copybtn.touching = false;
					Draw.variables.copybtn.mode = "";
				}
			},false);
			//========================================================================================
			//---メインパネルオプション関係
			//========================================================================================
			document.getElementById("sv_palettevalue").addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);
			document.getElementById("sv_palettevalue").addEventListener("change", function(event) {
				var val = event.target.value;
				var lines = val.split(/\r\n|\r|\n/);
				for (var l = 0; l < lines.length; l++) {
					if (l < 5) {
						console.log("lines["+l+"]="+lines[l]);
						var arr = lines[l].split(",");
						ColorPalette.load(l,lines[l]);
						AppStorage.set("sv_colorpalette"+l,lines[l]);
					}
				}
				/*var inx = $("input:radio[name=sv_paletteloc]:checked").val();
				for (var i = 1; i < 16; i++) {
					if (i <= arr.length) {
						document.getElementById("lab_pltloc" + inx + "_" + (i-1)).style.color = arr[i-1];
					}
				}*/
				//AppStorage.set("sv_colorpalette"+inx,val);
			},false);
			document.getElementById("chk_sv_colorpalette").addEventListener("click", function(event) {
				var dis = "";
				if (event.target.checked) {
					dis = "";
				}else{
					dis = "disabled";
				}
				for (var i = 0; i < Draw.defaults.sv_paletteloc_num; i++) {
					//document.getElementById("rad_paletteloc"+i).disabled = dis;
					document.getElementById("sv_palettevalue").disabled = dis;
				}
			},false);
			document.getElementById("txt_correction_level").addEventListener("change", function(event) {
				document.getElementById("val_correction_level").innerHTML = event.target.value;
				Draw.pen.correction_level = event.target.value;
			},false);
			document.getElementById("chk_enable_palmrest").addEventListener("click", function(event) {
				var val = event.target.checked;
				Draw.palmrest.left.enable(val);
				Draw.palmrest.right.enable(val);
				
				var disa = "";
				if (val) {
				}else{
					disa = "disabled";
				}
				document.getElementById("sel_color_palmrest").disabled = disa;
			}, false);
			document.getElementById("sel_color_palmrest").addEventListener("change", function(event) {
				var val = $("#"+event.target.id).val();
				console.log(val);
				Draw.palmrest.left.setColor(val);
				Draw.palmrest.right.setColor(val);
				/*
				var glstyle = document.getElementById("dlg_lguard").className;
				var grstyle = document.getElementById("dlg_rguard").className;

				if (val) {
					glstyle = glstyle.replace("guard_nocolor","guard_coloring");
					grstyle = grstyle.replace("guard_nocolor","guard_coloring");
				}else{
					glstyle = glstyle.replace("guard_coloring","guard_nocolor");
					grstyle = grstyle.replace("guard_coloring","guard_nocolor");
				}
				document.getElementById("dlg_lguard").className = glstyle;
				document.getElementById("dlg_rguard").className = grstyle;*/
			}, false);
			document.getElementById("chk_enable_grid").addEventListener("click", function(event) {
				var val = event.target.checked;
				
				var disa = "";
				if (val) {
				}else{
					disa = "disabled";
				}
				document.getElementById("txt_grid_width").disabled = disa;
				document.getElementById("txt_grid_height").disabled = disa;
				document.getElementById("txt_grid_color").disabled = disa;
				Draw.changeGrid(val,
					parseInt(document.getElementById("txt_grid_width").value),
					parseInt(document.getElementById("txt_grid_height").value),
					document.getElementById("txt_grid_color").value
				);
			}, false);
			document.getElementById("txt_grid_color").addEventListener("click", function(event) {
				var rect = event.target.getBoundingClientRect();
				$("#pickerpanel2").css({
					"top" : "calc(" + rect.top + "px + 1rem)",
					"left" : rect.left + "px"
				});
				$("#pickerpanel2").show();
				Draw.changeGrid(document.getElementById("chk_enable_grid").checked,
					parseInt(document.getElementById("txt_grid_width").value),
					parseInt(document.getElementById("txt_grid_height").value),
					document.getElementById("txt_grid_color").value);
			},false);
			document.getElementById("txt_grid_color").addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);
			document.getElementById("txt_grid_width").addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);
			document.getElementById("txt_grid_height").addEventListener("keydown", function(event) {
				event.stopPropagation();
			},false);

			$("#txt_grid_width,#txt_grid_height,#txt_grid_color").on("change", function(event) {
				Draw.variables.gridwidth = parseInt(document.getElementById("txt_grid_width").value);
				Draw.variables.gridheight = parseInt(document.getElementById("txt_grid_height").value);
				Draw.changeGrid(document.getElementById("chk_enable_grid").checked,
					parseInt(document.getElementById("txt_grid_width").value),
					parseInt(document.getElementById("txt_grid_height").value),
					document.getElementById("txt_grid_color").value);
			});
			/*document.getElementById("txt_grid_color").addEventListener("pointerdown", function(event) {
				var rect = event.target.getBoundingClientRect();
				$("#pickerpanel2").css({
					"top" : "calc(" + rect.y + "px + 1rem)",
					"left" : rect.x + "px"
				});
				$("#pickerpanel2").show();
			},false);*/

			document.getElementById("btn_man_plugin").addEventListener("click", function(event) {
				if (document.getElementById("dlg_plugin").style.display == "none") {
					Draw.turnMenuPanel("dlg_plugin",null,true);
				}else{
					Draw.turnMenuPanel("dlg_plugin",null,false);
				}
			},false);
			document.getElementById("btn_close_plugin").addEventListener("click", function(event) {
				Draw.turnMenuPanel("dlg_plugin",null,false);
			},false);
			document.getElementById("rad_ld_server").addEventListener("click", function(event) {
				document.getElementById("btn_reload_plugin").disabled = "";
				document.getElementById("sel_srv_plugin").disabled = "";
				document.getElementById("txt_ld_otherpath").disabled = "disabled";
			},false);
			document.getElementById("rad_ld_other").addEventListener("click", function(event) {
				document.getElementById("btn_reload_plugin").disabled = "disabled";
				document.getElementById("sel_srv_plugin").disabled = "disabled";
				document.getElementById("txt_ld_otherpath").disabled = "";
			},false);
			document.getElementById("btn_reload_plugin").addEventListener("click", function(event) {
				document.getElementById("btn_reload_plugin").disabled = "disabled";
				//---サーバプラグイン読込
				$.ajax(plugin_hostpath[0]+"/00lst",
				{
					type : "get",
					datatype : "text",
					data : {
						
					},
					success : function(data, status, jqXHR){
						console.log("success is");
						console.log(data);
						$("#sel_srv_plugin > option").remove();
						var ln = String(data).split("\r\n");
						for (var obj in ln) {
							var opt = document.createElement("option");
							opt.value = ln[obj];
							opt.innerHTML = ln[obj];
							document.getElementById("sel_srv_plugin").appendChild(opt);
						}
						document.getElementById("btn_reload_plugin").disabled = "";
					},
					error : function ( jqXHR, textStatus, errorThrown ) {
						console.log("error is ");
						console.log(textStatus);
						console.log(errorThrown);
						alert("サーバからの読み込みでエラーが発生しました。しばらく経ってから再度試してください。");
						$("#sel_srv_plugin > option").remove();
						document.getElementById("btn_reload_plugin").disabled = "";
					}
				});
			},false);
			document.getElementById("btn_download_plugin").addEventListener("click", function(event) {
			},false);
			
			//=============================================================================================
			//---アプリバージョンの設定
			document.getElementById("appNameAndVer").textContent = appname + " Ver:" + appversion;
			this.loadSetting();
			//---その他、初期化が必要な処理
			document.getElementById("dlg_canvasinfo").style.display = "none";
			document.getElementById("dlg_pen_mode").style.display = "none";
			document.getElementById("dlg_layer").style.display = "none";
			document.getElementById("menupanel").style.display = "none";
			$("#lay_btns").sortable({
				items : "span",
				cancel : "input,textarea,button,select,option,a,strong",
				distance : 5,
				update : function(evt, ui) {
					var hitid = -1;
					var btnhitid = -1;
					var oid = ui.item[0].id.replace("lay_btn","");
					//---layerから位置取得
					for (var i = 0; i < Draw.layer.length; i++) {
						if (Draw.layer[i].originID == oid) {
							hitid = i;
							break;
						}
					}
					//---要素から位置取得
					var elms = $("#lay_btns > *");
					for (var i = 0; i < elms.length; i++) {
						if (elms[i].id == ui.item[0].id) {
							btnhitid = i;
							break;
						}
					}
					console.log("hitid="+hitid);
					console.log("btnhitid="+btnhitid);
					if ((hitid == -1) || (btnhitid == -1)) return;
					/*
						要素位置を取得したあと、layer位置をそれに合わせて変更。
						cssのz-indexもその通りに変更。
					*/
					Draw.moveLayer(oid,hitid,btnhitid);
					
				}
			});
			$("#lay_btns").disableSelection();
			this.drawpoints = [];
			
			this.palmrest.left = new PalmRest(document.getElementById("dlg_lguard"),"left");
			this.palmrest.right = new PalmRest(document.getElementById("dlg_rguard"),"right");
			this.pen.correction_level = parseInt(document.getElementById("txt_correction_level").value);
			document.getElementById("val_correction_level").textContent = this.pen.correction_level;
			
			document.getElementById("inp_htmlbox_css").value = "20pt 'sans-serif'";
			$("#pickerpanel2").farbtastic("#txt_grid_color",function(color){
				$("#pickerpanel2").hide();
				Draw.changeGrid(document.getElementById("chk_enable_grid").checked,
					parseInt(document.getElementById("txt_grid_width").value),
					parseInt(document.getElementById("txt_grid_height").value),
					document.getElementById("txt_grid_color").value);
			});
			
			$("#txt_rotation").knob({
				"min" : 0,
				"max" : 360,
				"step": 1,
				"width" : "150",
				"cursor" : true,
				"thickness" : 0.3,
				"inputColor" : "#91d780",
				"fgColor" : "#91d780",
				"change" : function(v){
					//document.getElementById("lab_txt_rotation").innerHTML = event.target.value;
					Draw.transformCanvas({"rotate":v});
				}
				
			});
		},
		//===============================================================================================
		//--------------ここまでinitialize--------------------------------------------------------------
		parseURL : function (){
			var paramarr = document.location.search.replace("?","").split("&");
			//---URL引数から lng=* を取得
			for (var i = 0; i < paramarr.length; i++) {
				var pelem = paramarr[i].split("=");
				this.urlparams[pelem[0]] = pelem[1];
			}
		},
		setupLocale : function(){
			var did = function(name){
				return document.getElementById(name);
			}
			//initial panel
			did("lab_initialsetup").textContent = _T("lab_initialsetup");
			did("lab_initial_canvassize").textContent = _T("lab_initial_canvassize");
			did("lab_canvas_width").textContent = _T("lab_canvas_width");
			did("lab_canvas_height").textContent = _T("lab_canvas_height");
			//did("txt_limit_canvas").textContent = _T("txt_limit_canvas");
			//did("lab_limit_canvas").title = _T("lab_limit_canvas_title");
			did("btn_makecanvas").textContent = _T("btn_makecanvas");
			
			did("lab_loadproject").textContent = _T("lab_loadproject");
			did("lab_fileloc").textContent = _T("lab_fileloc");
			did("btn_openfile").textContent = _T("btn_openfile");
			did("lab_dirloc").textContent = _T("lab_dirloc");
			did("btn_openfolder").textContent = _T("btn_openfolder");
			//main panel - menu bar
			//did("btn_menu").textContent = _T("btn_menu");
			did("btn_menu").title = _T("btn_menu_title");
			did("btn_undo").title = _T("btn_undo_title");
			did("btn_redo").title = _T("btn_redo_title");
			did("info_btn_canvassize").title = _T("info_btn_canvassize_title");
			did("info_canvassize").title = _T("info_canvassize_title");
			did("info_layer").textContent = _T("info_layer");
			did("info_layer").title = _T("info_layer_title");
			did("info_pen_mode").textContent = _T("info_pen_mode");
			did("info_pen_mode").title = _T("info_pen_mode_title");
			did("sv_opacity4image_msg").textContent = _T("sv_opacity4image_msg");
			did("lab_sv_opacity4image").title = _T("lab_sv_opacity4image_title");
			//brush bar
			did("info_currentpos").title = _T("info_currentpos_title");
			did("info_brush_size").title = _T("info_brush_size_title");
			//color bar
			did("colorpicker").title = _T("colorpicker_title");
			did("explain_palette").title = _T("explain_palette_title");
			//side bar
			did("btn_dropper").title = _T("btn_dropper_title");
			did("btn_freescroll").title = _T("btn_freescroll_title");
			did("btn_aroundgrid").title = _T("btn_aroundgrid_title");
			did("chk_enable_handpres").title = _T("chk_enable_handpres_title");
			did("pres_curline").title = _T("pres_curline_title");
			did("btn_shapes").title = _T("btn_shapes_title");
			did("chk_shapes_line").title = _T("chk_shapes_line_title");
			did("chk_shapes_box").title = _T("chk_shapes_box_title");
			did("chk_shapes_circle").title = _T("chk_shapes_circle_title");
			did("chk_shapes_triangle").title = _T("chk_shapes_triangle_title");
			did("chk_shapes_html").title = _T("chk_shapes_html_title");
			did("btn_select").title = _T("btn_select_title");
			did("lab_seltype").title = _T("lab_seltype_title");
			did("sel_seltype_box").title = _T("sel_seltype_box_title") + "(R)";
			did("sel_seltype_free").title = _T("sel_seltype_free_title") + "(T)";
			did("sel_seltype_move").title = _T("sel_seltype_move_title") + "(Y)";
			did("sel_seltype_rotate").title = _T("sel_seltype_rotate_title") + "(U)";
			did("sel_seltype_tempdraw").title = _T("sel_seltype_tempdraw_title") + "(I)";
			did("lab_operationtype").title = _T("lab_operationtype_title");
			did("sel_operationtype_clip").title = _T("sel_operationtype_clip_title");
			did("sel_operationtype_copy").title = _T("sel_operationtype_copy_title") + "(Ctrl+C)";
			did("sel_operationtype_cut").title = _T("sel_operationtype_cut_title") + "(Ctrl+X)";
			did("sel_operationtype_paste").title = _T("sel_operationtype_paste_title") + "(Ctrl+V)";
			
			//menu panel
			did("btn_clear").textContent = _T("btn_clear");
			did("btn_clear").title = _T("btn_clear_title");
			did("btn_new").textContent = _T("btn_new");
			did("btn_new").title = _T("btn_new_title");
			did("btn_save").textContent = _T("btn_save");
			did("btn_save").title = _T("btn_save_title");
			did("btn_saveproj").textContent = _T("btn_saveproj");
			did("btn_saveproj").title = _T("btn_saveproj_title");
			did("lnk_help").title = _T("lnk_help_title");
			did("lnk_help_msg").textContent = _T("lnk_help_msg");
			did("lab_sv_colorpalette").title = _T("lab_sv_colorpalette_title");
			did("sv_colorpalette_msg").textContent = _T("sv_colorpalette_msg");
			did("lab_sv_palettevalue").title = _T("lab_sv_palettevalue_title");
			did("lab_sv_palettevalue").textContent = _T("lab_sv_palettevalue");
			did("sv_palettevalue").title = _T("sv_palettevalue_title");
			did("lab_correction_level").title = _T("lab_correction_level_title");
			did("correction_level_msg").textContent = _T("correction_level_msg");
			did("val_correction_level").title = _T("val_correction_level_title");
			did("lab_enable_palmrest").title = _T("lab_enable_palmrest_title");
			did("enable_palmrest_msg").textContent = _T("enable_palmrest_msg");
			did("lab_color_palmrest").title = _T("lab_color_palmrest_title");
			did("color_palmrest_msg").textContent = _T("color_palmrest_msg");
			did("sel_color_palmrest_0").textContent = _T("sel_color_palmrest_0");
			did("sel_color_palmrest_1").textContent = _T("sel_color_palmrest_1");
			did("sel_color_palmrest_2").textContent = _T("sel_color_palmrest_2");
			did("sel_color_palmrest_3").textContent = _T("sel_color_palmrest_3");
			did("sel_color_palmrest_4").textContent = _T("sel_color_palmrest_4");
			did("lab_enable_grid").textContent = _T("lab_enable_grid");
			did("lab_grid_width").textContent = _T("lab_grid_width");
			did("lab_grid_width").title = _T("lab_grid_width_title");
			did("lab_grid_color").textContent = _T("lab_grid_color");
			did("lab_grid_color").title = _T("lab_grid_color_title");

			//canvas info panel
			did("lab_magni").textContent = _T("lab_magni_title");
			did("lab_rotation").textContent = _T("lab_rotation_title");
			//layer panel
			did("lab_explain_layer").title = _T("lab_explain_layer_title");
			did("lab_explain_layer").textContent = _T("lab_explain_layer");
			did("lay_add").title = _T("lay_add_title");
			did("lay_del").title = _T("lay_del_title");
			did("prev_img").title = _T("prev_img_title");
			did("lab_layinfo_name").textContent = _T("lab_layinfo_name");
			did("lab_layinfo_toggle").textContent = _T("lab_layinfo_toggle");
			did("layinfo_opacity").title = _T("layinfo_opacity_title");
			did("lab_layinfo_opacity").textContent = _T("lab_layinfo_opacity");
			did("lab_layinfo_lock").title = _T("lab_layinfo_lock");
			did("lab_layinfo_lock").textContent = _T("lab_layinfo_lock");
			did("lab_layinfo_clip").textContent = _T("lab_layinfo_clip");
			did("layinfo_clearclip").textContent = _T("layinfo_clearclip");
			did("layinfo_clearclip").title = _T("layinfo_clearclip_title");
			did("lab_layinfo_cliphistory").textContent = _T("lab_layinfo_cliphistory");
			did("layinfo_call_cliphist").textContent = _T("layinfo_call_cliphist");
			did("layinfo_call_cliphist").title = _T("layinfo_call_cliphist_title");
			
			//brush panel
			did("eraser").title = _T("brush_eraser");
			did("img_eraser").title = _T("brush_eraser");
			did("sp_eraser").title = _T("brush_eraser");
			did("sp_eraser").textContent = _T("brush_eraser");
			did("fillpen").title = _T("brush_fillpen");
			did("img_fillpen").title = _T("brush_fillpen");
			did("sp_fillpen").title = _T("brush_fillpen");
			did("sp_fillpen").textContent = _T("brush_fillpen");
			
			//progress panel
			did("lab_progress").textContent = _T("lab_progress");
			did("prg_btn_cancel").textContent = _T("prg_btn_cancel");
			
			//html text box
			did("dlg_htmlbox_header").textContent = _T("dlg_htmlbox_header");
			did("lab_htmlbox_css").textContent = _T("lab_htmlbox_css");
			did("lab_htmlbox_align").textContent = _T("lab_htmlbox_align");
			//did("lab_htmlbox_baseline").textContent = _T("lab_htmlbox_baseline");
			did("btn_insert_htmlbox").textContent = _T("btn_insert_htmlbox");
			//did("lab_text_vertical").textContent = _T("lab_text_vertical");
			did("lab_text_vertical").title = _T("lab_text_vertical");
			did("lab_text_overflow").title = _T("lab_text_overflow");
			did("lab_text_overflow").textContent = _T("lab_text_overflow");
			
		},
		createbody : function(wi,he,isshow){
			var touch = {
				start : "pointerdown", move : "pointermove", end : "pointerup",
				leave : "pointerleave", enter : "pointerenter"
			};
			document.getElementById("initialsetup").style.display = "none";
			document.getElementById("apptitle").style.display = "none";
			document.getElementById("ctrlpanel").style.display = "block";
			//document.getElementById("colorpalette").style.display = "block";
			//document.getElementById("layoutcontrol").style.display = "block";
			document.getElementById("prespanel").style.display = "block";
			//Draw.generateCanvas(wi, he);
			document.getElementById("basepanel")
			document.getElementById("canvaspanel").style.width = wi + "px";
			document.getElementById("canvaspanel").style.height = (he) + "px";
			document.getElementById("canvaspanel").style.border = "2px solid #808080";
			document.getElementById("canvaspanel").style.marginLeft = "auto";
			document.getElementById("canvaspanel").style.marginRight = "auto";
			document.getElementById("canvaspanel").style.marginTop = "auto";
			document.getElementById("canvaspanel").style.marginBottom = "auto";
			document.getElementById("canvaspanel").className = "canvaspanel";
			//document.getElementById("canvaspanel").style.transformOrigin = "left top";
			document.getElementById("canvaspanel").style.transformOrigin = "center center";
			document.getElementById("canvaspanel").style.transform = "scale(1.0)";
			//---画面操作受付用のキャンバス作成
			console.log("createbody basepanel");
			/*console.log(document.getElementById("basepanel").getBoundingClientRect());
			Draw.screendiv = document.createElement("div");
			Draw.screendiv.id = "screendiv";
			Draw.screendiv.className = "screen-divelem";
			document.getElementById("basepanel").appendChild(Draw.screendiv);
			configEvent(Draw.screendiv,touch);*/
			
			Draw.screencan = document.createElement("canvas");
			Draw.screencan.id = "screencanvas";
			Draw.screencan.className = "mostbase-canvas";
			Draw.screencan.width = wi;
			Draw.screencan.height = he;
			Draw.screencan.style.zIndex = 950;
			Draw.screencontext = Draw.screencan.getContext("2d");
			document.getElementById("canvaspanel").appendChild(Draw.screencan);
			configEvent(Draw.screencan,touch);
			
			//---メインのキャンバスを生成(レイヤー1)
			var lay = new DrawLayer(Draw,{"w":wi,"h":he},true,true);
			lay.canvas.className = "mostbase-canvas";
			Draw.layer.push(lay);
			Draw.layer[0].select(Draw.context);
			Draw.canvassize = [wi, he];
	        Draw.imagelength=Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]).data.length;
			Draw.defaults.canvas.size = [wi, he];
			document.getElementById("info_canvassize").innerHTML = wi + "x" + he;
			document.getElementById("info_magni").innerText = "1.0";
			//document.getElementById("btn_panel").style.visibility = "visible";
			Draw.resizeCanvasMargin(window.innerWidth, window.innerHeight);
			if (wi > he) {
				document.getElementById("prev_img").width = "126";
			}else{
				document.getElementById("prev_img").height = "126";
			}
			/*if ("pencil" in Draw.pen.items) */Draw.pen.items["pencil"].element.click();
			//---ダミーのキャンバスも作成
			Draw.canvas = document.createElement("canvas");
			Draw.canvas.id = "dumcanvas";
			Draw.canvas.className = "dummy-canvas";
			Draw.canvas.width = wi;
			Draw.canvas.height = he;
			Draw.canvas.style.zIndex = 0;
			Draw.canvas2 = document.createElement("canvas");
			Draw.canvas2.id = "dumcanvas";
			Draw.canvas2.className = "dummy-canvas";
			//Draw.canvas2.width = wi;
			//Draw.canvas2.height = he;
			Draw.canvas2.style.zIndex = 0;
			document.body.appendChild(Draw.canvas);
			
			var touch = {
				start : "pointerstart", move : "pointermove", end : "pointerend",
				leave : "pointerleave", enter : "pointerenter"
			};

			//---グリッド用のキャンバスも作成
			Draw.gridcan = document.createElement("canvas");
			Draw.gridcan.id = "gridcanvas";
			Draw.gridcan.className = "operate-canvas";
			Draw.gridcan.width = wi;
			Draw.gridcan.height = he;
			Draw.gridcan.style.zIndex = 9;	//5;
			document.getElementById("canvaspanel").appendChild(Draw.gridcan);
			//configEvent(Draw.opecan,touch);
			Draw.gridcontext = Draw.gridcan.getContext("2d");
			//---操作用のキャンバスも作成
			Draw.opecan = document.createElement("canvas");
			Draw.opecan.id = "opecanvas";
			Draw.opecan.className = "operate-canvas";
			Draw.opecan.width = wi;
			Draw.opecan.height = he;
			Draw.opecan.style.zIndex = 948;	//5;
			document.getElementById("canvaspanel").appendChild(Draw.opecan);
			//configEvent(Draw.opecan,touch);
			Draw.opecontext = Draw.opecan.getContext("2d");
			//---操作・選択のキャンバスも作成
			Draw.opeselcan = document.createElement("canvas");
			Draw.opeselcan.id = "opeselcanvas";
			Draw.opeselcan.className = "operate-canvas";
			Draw.opeselcan.width = wi;
			Draw.opeselcan.height = he;
			Draw.opeselcan.style.zIndex = 949;	//6;
			document.getElementById("canvaspanel").appendChild(Draw.opeselcan);
			//configEvent(Draw.opeselcan,touch);
			Draw.opeselcontext = Draw.opeselcan.getContext("2d");
			
			if (isshow) {
				document.getElementById("basepanel").style.display = "block";
			}
			document.getElementById("openedProjName").innerText = "";
			//this.undohist.push(new UndoBuffer(this.context.canvas,this.context.getImageData(0,0,this.canvassize[0],this.canvassize[1])));
			Draw.toggleUndo(false);
			Draw.toggleRedo(false);
			document.getElementById("prg_btn_cancel").style.display = "block";
			
			//var rect = document.getElementById("info_btn_canvassize").getBoundingClientRect();
			//console.log(rect);
			//document.getElementById("dlg_canvasinfo").style.left = rect.left + "px";

			return true;
		},
		direct_createbody : function(){
			//---URL引数にw と hがある場合、直接キャンバスを作成する
			var tw = false, th = false;
			if ("w" in Draw.urlparams) {
				tw = parseInt(Draw.urlparams["w"]);
			}
			if ("h" in Draw.urlparams) {
				th = parseInt(Draw.urlparams["h"]);
			}
			console.log("w=" + tw);
			console.log("h=" + th);
			if ((tw) && (th) && (!isNaN(tw)) && (!isNaN(th))) {
				//---wとhがある場合のみ、いきなりキャンバス作成
				if (tw > Number(document.getElementById("canvas_width").max)) tw = Number(document.getElementById("canvas_width").max);
				if (tw < 100) tw = 100;
				if (th > Number(document.getElementById("canvas_height").max)) th = Number(document.getElementById("canvas_height").max);
				if (th < 100) th = 100;
				Draw.createbody(tw,th,true);
			}
		},
		clearBody : function (){
			while (Draw.undohist.length > 0) {
				var o = Draw.undohist.shift();
				o = null;
			}
			//参照コンテキストをメインのキャンバスに戻す
			console.log(this.layer);
			Draw.layer[0].opacity(100);
			Draw.layer[0].SetLock(false);
			Draw.layer[0].ClearClip(true);
			Draw.layer[0].select(null);
			Draw.context = Draw.layer[0].canvas.getContext("2d");
			Draw.removeLayerAll();
			//---メインのキャンバスだけは直接クリアのみ
			Draw.context.clearRect(0,0,Draw.canvassize[0],Draw.canvassize[1]);
			Draw.layer[0].setup_other();
			Draw.opecontext.clearRect(0,0, Draw.canvassize[0],Draw.canvassize[1]);
			Draw.opeselcontext.clearRect(0,0, Draw.canvassize[0],Draw.canvassize[1]);
			/*for (var i = 0; i < Draw.undohist.length; i++) {
				delete Draw.undohist[i];
			}*/
			//Draw.undohist = [];
			//Draw.redohist = [];
			Draw.canundo = false;
			Draw.canredo = false;
			Draw.toggleUndo(false);
			Draw.toggleRedo(false);
			Draw.undoindex = -1;
			//document.getElementById("previewer").src = null;
			Draw.transform_value[0] = 1.0;
			Draw.transform_value[1] = 0;
			Draw.transform_style = Draw.transform_style.concat(Draw.defaults.transform_style);
			Draw.init_scale = 1.0;
			Draw.during_scale = 1.0;
			Draw.during_distance = 0;
			Draw.init_rotate = 0;
			Draw.during_rotate = 0;
			Draw.touchpoints = {};
			Draw.drawpoints = [];
			Draw.is_scaling = false;
			Draw.is_scrolling = false;
			Draw.is_selecting = false;
			Draw.select_type = "box";
			Draw_select_operation = "copy";
			Draw.selectors.clear();
			Draw.select_clipboard = new Selector();
			document.getElementById("layinfo_toggle").checked = true;
			document.getElementById("layinfo_opacity").value = "100";
			Draw.layer[0].opacity("100");
			document.getElementById("btn_resetAllTransform").click();
			return true;
		},
		returnTopMenu : function (){
			//---パネル系解除
			if (Draw.is_spoiting) {
				document.getElementById("btn_dropper").click();
			}
			if (Draw.vCtrl_for_scroll) {
				document.getElementById("btn_freescroll").click();
			}
			if (Draw.is_drawing_line) {
				document.getElementById("btn_shapes").click();
			}
			if (Draw.is_selecting) {
				document.getElementById("btn_select").click();
			}
			if (document.getElementById("chk_enable_handpres").className == "switchbutton_on") {
				document.getElementById("chk_enable_handpres").click();
			}
			if (Draw.palmrest.left.isEnable || Draw.palmrest.right.isEnable) {
				document.getElementById("chk_enable_palmrest").click();
			}
			Draw.enablegrid.checked = false;
			Draw.clearBody();
			Draw.is_spoiting = false;
			Draw.vCtrl_for_scroll = false;
			Draw.is_scrolling = false;
			Draw.is_drawing_line = false;
			Draw.drawing_type = "line";
			Draw.is_selecting = false;
			Draw.select_type = "box";
			Draw_select_operation = "copy";
			Draw.selectors.clear();
			Draw.select_clipboard = new Selector();
			Draw.filename = "";
			Draw.clearCliphist();
			document.getElementById("layinfo_cliphistory").disabled = "disabled";
			document.getElementById("layinfo_call_cliphist").disabled = "disabled";
			//---メインも完全削除
			document.getElementById("canvaspanel").removeChild(document.getElementById(Draw.layer[0].canvas.id));
			//own.control.remove();
			document.getElementById("lay_btns").removeChild(document.getElementById(Draw.layer[0].control.id));
			Draw.layer.splice(0,1);
			
			document.getElementById("sel_seltype_box").click();
			document.getElementById("chk_shapes_line").click();
			
			ElementTransform(document.getElementById("basepanel"),"translate(0,0)");
			document.getElementById("basepanel").style.display = "none";
			document.getElementById("initialsetup").style.display = "block";
			document.getElementById("apptitle").style.display = "block";
			document.getElementById("ctrlpanel").style.display = "none";
			//document.getElementById("colorpalette").style.display = "none";
			//document.getElementById("layoutcontrol").style.display = "none";
			document.getElementById("prespanel").style.display = "none";
			document.getElementById("openedProjName").innerText = "";
			//グリッド解除
			document.getElementById("chk_enable_grid").checked = false;
			Draw.changeGrid(false,
				parseInt(document.getElementById("txt_grid_width").value),
				parseInt(document.getElementById("txt_grid_height").value),
				document.getElementById("txt_grid_color").value
			);
			Draw.saveSetting();
			return true;
		},
		turnMenuPanel : function(target,firebutton,flag) {
			var valdisplay = (flag ? "block" : "none");
			var valbgcolor = (flag ? "#91d780" : "#c4fab3");
			document.getElementById("menupanel").style.display = "none";
			document.getElementById("dlg_canvasinfo").style.display = "none";
			document.getElementById("dlg_layer").style.display = "none";
			document.getElementById("dlg_pen_mode").style.display = "none";
			document.getElementById("dlg_plugin").style.display = "none";
			if (target) document.getElementById(target).style.display = valdisplay;
			
			document.getElementById("btn_menu").style.backgroundColor = "#c4fab3";
			document.getElementById("info_layer").style.backgroundColor = "#c4fab3";
			document.getElementById("info_pen_mode").style.backgroundColor = "#c4fab3";
			document.getElementById("info_btn_canvassize").style.backgroundColor = "#c4fab3";
			if (firebutton) document.getElementById(firebutton).style.backgroundColor = valbgcolor;
			
			this.saveSetting();
		},
		addToFilelistPanel : function (file, data) {
			//ファイル一覧にサムネイルセットして画面に追加
			var li = document.createElement("li");
			li.id = "li_"+file.name;
			li.className = "fl_item";
			//var fig = document.createElement("figure");
			//var figcap = document.createElement("figcaption");
			var strong = document.createElement("div");
			strong.innerHTML = file.name;
			li.appendChild(strong);
			if (data.thumbnail.indexOf("base64") > -1) {
				var img = document.createElement("img");
				img.id = "img_" + file.name;
				img.src = data.thumbnail;
				img.alt = file.name;
				img.title = file.name + " - " + Math.round(file.size/1024) + " KB";
				//fig.appendChild(img);
				li.appendChild(img);
			}else{
				var img = document.createElement("img");
				img.id = "img_" + file.name;
				img.src = "";
				img.width = "100";
				img.height = "100";
				img.alt = "no thumbnail";
				img.title = file.name + " - " + Math.round(file.size/1024) + " KB";
				//fig.appendChild(img);
				li.appendChild(img);
			}
			var sizelabel = document.createElement("span");
			sizelabel.innerHTML = data.width + " x " + data.height;
			var timelabel = document.createElement("time");
			if (file.lastModifiedDate) {
				var d = new Date(file.lastModifiedDate);
				timelabel.datetime = d.toISOString();
				timelabel.title = file.lastModifiedDate;
				timelabel.innerHTML = d.toLocaleString();
			}else if (file.dateCreated) {
				var d = new Date(file.dateCreated);
				timelabel.datetime = d.toISOString();
				timelabel.title = file.dateCreated;
				timelabel.innerHTML = d.toLocaleString();
			}
			li.appendChild(document.createElement("br"));
			li.appendChild(sizelabel);
			li.appendChild(document.createElement("br"));
			li.appendChild(timelabel);
			document.querySelector("#dlg_filelist ul").appendChild(li);
			
			function fl_item_clicked(event) {
				if (Draw.variables["timeoutid"] && (Draw.variables["timeoutid"] != "")) return;
				var oid = String(event.target.id).replace(/^li_/,"");
				oid = oid.replace(/^img_/,"");
				if (oid in Draw.filelist) {
					document.getElementById("progressicon").className = "get-animestart";
					Draw.progresspanel.style.display = "block";
					$("#dlg_filelist ul > li").addClass("fl_item_disabled");
					$("#dlg_filelist ul").addClass("dlg_filelist_disabled");
					Draw.variables["oid"] = oid;
					Draw.variables["timeoutid"] = setTimeout(function(){
						if (Draw.loadProject(Draw.filelist[Draw.variables.oid])) {
							$("#dlg_filelist").css({"display":"none"});
							$("#dlg_filelist ul > li").remove();
							Draw.displayFromProject(Draw.variables.oid);
							//---ドラッグアンドドロップで保持したデータはここですべて破棄
							Draw.clearFilelist();
						}else{
							//alert("有効なPaintMeisterプロジェクトファイルではありません！");
							alert(_T("loadProjectFile_msg2"));
						}
						clearTimeout(Draw.variables["timeoutid"]);
						Draw.variables["timeoutid"] = "";
					},500);
				}
			}
			document.getElementById("li_"+file.name).addEventListener("click", fl_item_clicked,true);
			document.getElementById("img_"+file.name).addEventListener("click", fl_item_clicked,true);
		},
		clearFilelist : function (){
			for (var i in Draw.filelist) {
				Draw.filelist[i].splice(0,Draw.filelist[i].length);
			}
			Draw.filelist.splice(0,Draw.filelist.length);
			Draw.filelist = [];
		},
		resizeCanvasMargin : function (winwidth, winheight){
			var sa = winwidth - this.canvassize[0];
			var say = winheight - this.canvassize[1];
			var space = Math.floor(sa / 2) - (sa * 0.090); //30;
			var spacey = Math.floor(say / 2) - 100; //(say * 0.2);
			this.canvasspace = {"w" : space, "h" : spacey};
			//document.getElementById("basepanel").style.left = (45 + space) + "px";
			console.log("left="+space + "/" + spacey);
			//ElementTransform(document.getElementById("canvaspanel"),"scale(" + this.during_scale + ") "+ "translateX("+space+"px," + spacey + "px)");
			//ElementTransform(document.getElementById("canvaspanel"),"scale(1.5) translateY(" + spacey + "px)");
		},
		transformCanvas : function(obj){
			var bkuptransvalue = [];
			bkuptransvalue = bkuptransvalue.concat(this.transform_value);
			bkuptransvalue[3] = 0;
			var isnot_rotate = false;
			if ("translateX" in obj) {
				this.transform_value[0] = obj["translateX"];
				isnot_rotate = true;
			}
			if ("translateY" in obj) {
				this.transform_value[1] = obj["translateY"];
				isnot_rotate = true;
			}
			if ("scale" in obj) {
				this.transform_value[2] = obj["scale"];
				isnot_rotate = true;
			}
			if ("rotate" in obj) {
				this.transform_value[3] = obj["rotate"];
			}
			var tarr = [], bkuparr = [];
			var bkuptransform = document.getElementById("canvaspanel").style.transform;
			
			if (isnot_rotate) {
			//	this.transform_value[3] = 0;
			}
			//for (var i = 0; i < this.transform_value.length; i++) {
			for (var i = this.transform_value.length-1; i >= 0; i--) {
				tarr.push(this.transform_style[i].replace("%d",this.transform_value[i]));
				bkuparr.push(this.transform_style[i].replace("%d",bkuptransvalue[i]));
			}
			//console.log("tarr=" + tarr.join(" "));
			document.getElementById("canvaspanel").style.webkitTransformOrigin = "center center 0px";
			document.getElementById("canvaspanel").style.transformOrigin = "center center 0px";
			//---rotate 0deg で一旦角度を戻して適用
			//bkuparr[0] = tarr[0];
			//bkuparr[1] = tarr[1];
			//document.getElementById("canvaspanel").style.transform = bkuparr.join(" ");
			//console.log("reset transform="+document.getElementById("canvaspanel").style.transform);
			//---移動・拡縮・回転は常に rotate 0degで始めてみる
			document.getElementById("canvaspanel").style.transform = tarr.join(" "); 
			//console.log("finished transform="+document.getElementById("canvaspanel").style.transform);
		},
		configOperationCanvas : function (targetcanvas){
			if (this.is_selecting || this.is_drawing_line) {
				this.opecan.style.zIndex = targetcanvas.style.zIndex + 1;
				this.opeselcan.style.zIndex = targetcanvas.style.zIndex + 2;
			}else{
				if (this.opecan) this.opecan.style.zIndex = 5;
				if (this.opeselcan) this.opeselcan.style.zIndex = 6;
			}
		},
		start_drawCursor : function(event,size,pos){
			Draw.variables.cursorpos.x = pos.x;
			Draw.variables.cursorpos.y = pos.y;
			Draw.variables["cursorsize"] = ((size/2)*(this.during_scale*0.7));
			
			Draw.screencontext.lineWidth = 1; 
			Draw.screencontext.strokeStyle = "#242424";
			Draw.screencontext.lineCap = "round";
			Draw.screencontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			Draw.screencontext.beginPath();
				Draw.screencontext.arc(
					Draw.variables.cursorpos.x,Draw.variables.cursorpos.y,
					1,
					0/180*Math.PI,360/180*Math.PI
				);
			Draw.screencontext.stroke();
			Draw.screencontext.beginPath();
				Draw.screencontext.arc(
					Draw.variables.cursorpos.x,Draw.variables.cursorpos.y,
					Draw.variables["cursorsize"],
					0/180*Math.PI,360/180*Math.PI
				);
			Draw.screencontext.stroke();
		},
		move_drawCursor : function(event,pos){
			Draw.screencontext.strokeStyle = "#242424";
			Draw.screencontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			Draw.screencontext.beginPath();
			//Draw.screencontext.moveTo(pos.x,pos.y);
			//Draw.screencontext.lineTo(pos.x,pos.y);
				Draw.screencontext.arc(
					pos.x,pos.y,
					1,
					0/180*Math.PI,360/180*Math.PI
				);
			Draw.screencontext.stroke();
			Draw.screencontext.beginPath();
				Draw.screencontext.arc(
					pos.x,pos.y,
					Draw.variables["cursorsize"],
					0/180*Math.PI,360/180*Math.PI
				);
			Draw.screencontext.stroke();
			
			Draw.screencontext.strokeStyle = "#FFFFFF";
			Draw.screencontext.beginPath();
				Draw.screencontext.arc(
					pos.x,pos.y,
					Draw.variables["cursorsize"] * 0.75,
					0/180*Math.PI,360/180*Math.PI
				);
			Draw.screencontext.stroke();
		},
		end_drawCursor : function(){
			Draw.screencontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
		},
		scale : function (val) {
			var fnlbi = val / 100;
			if (fnlbi > this.defaults.scalemax) {
				fnlbi = this.defaults.scalemax;
			}
			if (fnlbi < this.defaults.scalemin) {
				fnlbi = this.defaults.scalemin;
			}
			this.during_scale = fnlbi;
			document.getElementById("info_magni").innerText = String(fnlbi).substr(0,3);
			if (!this.is_selecting) {
				Draw.variables["cursorsize"] = ((this.pen.current.size/2)*(this.during_scale*0.7))
				
			}
			this.transformCanvas({"scale":fnlbi});
			return;
			
			var tarr = [];
			this.transform_value[0] = fnlbi;
			this.transform_value[1] = this.during_rotate;
			tarr.push(this.transform_style[0].replace("%d",this.transform_value[0]));
			tarr.push(this.transform_style[1].replace("%d",this.transform_value[1]));
			console.log("transform=" + tarr.join(" "));
			document.getElementById("canvaspanel").style.webkitTransformOrigin = "center center 0px";// "left top 0px";
			document.getElementById("canvaspanel").style.transformOrigin = "center center 0px";// "left top 0px";
			document.getElementById("canvaspanel").style.transform = tarr.join(" "); //"scale(" + fnlbi +  ")";
		},
		scaleUp : function (){
			var fnlbi = 1.0;
			fnlbi = this.during_scale + 0.05;
			if (fnlbi > this.defaults.scalemax) {
				fnlbi = this.defaults.scalemax;
			}
			this.during_scale = fnlbi;
			document.getElementById("info_magni").innerText = String(fnlbi).substr(0,3);
			if (!this.is_selecting) {
				Draw.variables["cursorsize"] = ((this.pen.current.size/2)*(this.during_scale*0.7))
				
			}
			this.transformCanvas({"scale":fnlbi});
			return;
			
			var tarr = [];
			this.transform_value[0] = fnlbi;
			this.transform_value[1] = this.during_rotate;
			tarr.push(this.transform_style[0].replace("%d",this.transform_value[0]));
			tarr.push(this.transform_style[1].replace("%d",this.transform_value[1]));
			console.log("transform=" + tarr.join(" "));
			document.getElementById("canvaspanel").style.webkitTransformOrigin = "center center 0px";// "left top 0px";
			document.getElementById("canvaspanel").style.transformOrigin = "center center 0px";// "left top 0px";
			document.getElementById("canvaspanel").style.transform = tarr.join(" "); //"scale(" + fnlbi +  ")";
		},
		scaleDown : function() {
			var fnlbi = 1.0;
			fnlbi = this.during_scale - 0.05;
			if (fnlbi < this.defaults.scalemin) {
				fnlbi = this.defaults.scalemin;
			}
			this.during_scale = fnlbi;
			document.getElementById("info_magni").innerText = String(fnlbi).substr(0,3);
			if (!this.is_selecting) {
				Draw.variables["cursorsize"] = ((this.pen.current.size/2)*(this.during_scale*0.7))
			}
			this.transformCanvas({"scale":fnlbi});
			return;
			
			var tarr = [];
			this.transform_value[0] = fnlbi;
			this.transform_value[1] = this.during_rotate;
			tarr.push(this.transform_style[0].replace("%d",this.transform_value[0]));
			tarr.push(this.transform_style[1].replace("%d",this.transform_value[1]));
			console.log("transform=" + tarr.join(" "));
			document.getElementById("canvaspanel").style.webkitTransformOrigin = "center center 0px";// "left top 0px";
			document.getElementById("canvaspanel").style.transformOrigin = "center center 0px";// "left top 0px";
			document.getElementById("canvaspanel").style.transform = tarr.join(" "); //"scale(" + fnlbi +  ")";
		},
		rotate : function(angle) {
			var fnlang = angle;
			if (fnlang > 360) fnlang = 0;
			if (fnlang < 0) fnlang = 360;
			
			this.during_rotate = fnlang;
			$("#txt_rotation").val(fnlang).trigger("change");
			this.transformCanvas({"rotate":fnlang});
			return;
			
			var tarr = [];
			this.transform_value[0] = this.during_scale;
			this.transform_value[1] = fnlang;
			tarr.push(this.transform_style[0].replace("%d",this.transform_value[0]));
			tarr.push(this.transform_style[1].replace("%d",this.transform_value[1]));
			console.log("transform=" + tarr.join(" "));
			document.getElementById("canvaspanel").style.webkitTransformOrigin = "center center 0px";
			document.getElementById("canvaspanel").style.transformOrigin = "center center 0px";
			document.getElementById("canvaspanel").style.transform = tarr.join(" "); //"scale(" + fnlbi +  ")";
			
		},
		rotateLeft : function() {
			var fnlang = 0;
			fnlang = this.during_rotate - 10;
			if (fnlang < 0) fnlang = 360;
			
			this.during_rotate = fnlang;
			$("#txt_rotation").val(fnlang).trigger("change");
			this.transformCanvas({"rotate":fnlang});
			return;
			
			var tarr = [];
			this.transform_value[0] = this.during_scale;
			this.transform_value[1] = fnlang;
			tarr.push(this.transform_style[0].replace("%d",this.transform_value[0]));
			tarr.push(this.transform_style[1].replace("%d",this.transform_value[1]));
			console.log("transform=" + tarr.join(" "));
			document.getElementById("canvaspanel").style.webkitTransformOrigin = "center center 0px";
			document.getElementById("canvaspanel").style.transformOrigin = "center center 0px";
			document.getElementById("canvaspanel").style.transform = tarr.join(" "); //"scale(" + fnlbi +  ")";
			
		},
		rotateRight : function() {
			var fnlang = 0;
			fnlang = this.during_rotate + 10;
			if (fnlang > 360) fnlang = 0;
			
			this.during_rotate = fnlang;
			$("#txt_rotation").val(fnlang).trigger("change");
			this.transformCanvas({"rotate":fnlang});
			return;
			
			var tarr = [];
			this.transform_value[0] = this.during_scale;
			this.transform_value[1] = fnlang;
			tarr.push(this.transform_style[0].replace("%d",this.transform_value[0]));
			tarr.push(this.transform_style[1].replace("%d",this.transform_value[1]));
			console.log("transform=" + tarr.join(" "));
			document.getElementById("canvaspanel").style.webkitTransformOrigin = "center center 0px";
			document.getElementById("canvaspanel").style.transformOrigin = "center center 0px";
			document.getElementById("canvaspanel").style.transform = tarr.join(" "); //"scale(" + fnlbi +  ")";
			
		},
		turnLayer : function(mode) {
			var index = this.getSelectedLayerIndex();
			if (mode == "prev") {
				if (index > 0) {
					this.layer[index-1].select(Draw.context);
				}
			}else if (mode == "next") {
				if (index < Draw.layer.length-1) {
					this.layer[index+1].select(Draw.context);
				}
			}
		},
		turnLayerDown : function (){
			this.turnLayer("prev");
		},
		turnLayerUp : function(){
			this.turnLayer("next");
		},
		changePensize : function(size) {
			if (size < this.sizebar.min) size = this.sizebar.min;
			if (size > this.sizebar.max) size = this.sizebar.max;
			
			this.sizebar.value = size;
			document.getElementById("lab_pensize").innerHTML = size;
			this.pen.current["size"] = size;
			this.pen.saved.size[this.pen.current.mode] = size;
			
		},
		changePensizeUp : function(){
			this.changePensize(parseFloat(this.sizebar.value)+0.5);
		},
		changePensizeDown : function(){
			this.changePensize(parseFloat(this.sizebar.value)-0.5);
		},
		loadSetting : function (){
			if (AppStorage.isEnable()) {
				//---color palette
				var chk = AppStorage.get("chk_sv_colorpalette","0");
				chk = (chk == "1" ? true : false);
				document.getElementById("chk_sv_colorpalette").checked = chk;
				//---correction level
				var ival = AppStorage.get("txt_correction_level","3");
				document.getElementById("val_correction_level").innerHTML = ival;
				document.getElementById("txt_correction_level").value = ival;
				
				this.pen.correction_level = ival;
				//---grid line
				ival = parseInt(AppStorage.get("txt_grid_width",50));
				document.getElementById("txt_grid_width").value = ival;
				this.variables.gridwidth = ival;
				ival = parseInt(AppStorage.get("txt_grid_height",50));
				document.getElementById("txt_grid_height").value = ival;
				this.variables.gridheight = ival;
				document.getElementById("txt_grid_color").value = AppStorage.get("txt_grid_color","#333333");
			}
		},
		saveSetting : function (){
			if (AppStorage.isEnable()) {
				//---color palette
				var chk = document.getElementById("chk_sv_colorpalette").checked;
				chk = (chk == true ? "1" : "0");
				AppStorage.set("chk_sv_colorpalette",chk);
				if (chk == "0") AppStorage.remove("sv_colorpalette0");
				//---correction level
				var ival = parseInt(document.getElementById("txt_correction_level").value);
				AppStorage.set("txt_correction_level",ival);
				//---grid line
				AppStorage.set("txt_grid_width",document.getElementById("txt_grid_width").value);
				AppStorage.set("txt_grid_height",document.getElementById("txt_grid_height").value);
				AppStorage.set("txt_grid_color",document.getElementById("txt_grid_color").value);
			}
		},
		undo_function_begin : function(isundo) {
			this.currentLayer.prev_image = this.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]);
			//さかのぼっていたら現在位置以降を削除
			if (isundo) {
				if (this.undoindex > -1) {
					for (var i = this.undoindex+1; i < this.undohist.length; i++) {
						this.undohist[i].layer = null;
						this.undohist[i].image = null;
					}
					this.undohist.splice(this.undoindex+1,this.undohist.length);
				}
				this.undoindex = this.undohist.length-1;
				this.canredo = false;
				this.toggleRedo(false);
			}
		},
		undo_function_end : function() {
			//---save undo
			this.canundo = true;
			try {
			this.undohist.push(new UndoBuffer(UndoType.paint,Draw.context.canvas,Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1])));
			this.undohist[this.undohist.length-1].prev_image = Draw.context.createImageData(Draw.canvassize[0],Draw.canvassize[1]);
			this.undohist[this.undohist.length-1].prev_image = this.currentLayer.prev_image;
			//this.undohist.push(new UndoBuffer(UndoType.paint,Draw.context.canvas,Draw.currentLayer.prev_image));
			this.undoindex = this.undohist.length-1;
			if (this.undohist.length > this.defaults.undo.max) {
				var o = this.undohist.shift();
				//o.destroy();
				o = null;
				this.undoindex = this.undohist.length-1;
			}
			this.toggleUndo(true);
		}catch(e){
		}
		},
		saveUndo : function(pensize,lowpos,highpos,context){
			var block = {w:0, h:0};
			block.w = this.canvassize[0] / this.defaults.undo.divide;
			block.h = this.canvassize[1] / this.defaults.undo.divide;
			var blockhit = [
				[false,false,false,false,false],
				[false,false,false,false,false],
				[false,false,false,false,false],
				[false,false,false,false,false],
				[false,false,false,false,false]
			];
			/*
				キャンバスを指定のブロック数に分けて、lowpos,highposからUndo保管用の
				対象ブロックを割り出す
			*/
			var SaveBlock = function(){
				this.pos = {x:0, y:0};
				this.image = null;
			}
			var savelist = [];
			for (var y = 0; y < this.defaults.undo.divide; y++) {
				var sty = block.h * y;
				var edy = sty = block.h;
				if (((sty <= lowpos.y) && (lowpos.y <= edy)) || 	//lowpos.yが短形のY範囲内か
					((sty <= highpos.y) && (highpos.y <= edy)) ||	//highpos.yが短形のY範囲内か
					((lowpos.y <= edy) && (edy <= highpos.y))		//短形の終点Yがlowpos.yとhightpos.yの範囲内か
				) {
					for (var x = 0; x < this.defaults.undo.divide; x++) {
						//---短形の左上
						var stx = block.w * x;
						//---短形の右下
						var edx = stx + block.w;
						if (((stx <= lowpos.x) && (lowpos.x <= edx)) ||		//lowpos.xが短形のX範囲内か
							((stx <= highpos.x) && (highpos.x <= edx)) ||	//highpos.yが短形のX範囲内か
							((lowpos.x <= edx) && (edx <= highpos.x))		//短形の終点Xがlowpos.xとhightpos.xの範囲内か
						) {
							blockhit[x][y] = true;
							var sv = new SaveBlock();
							sv.pos.x = stx;
							sv.pos.y = sty;
							sv.image = this.currentLayer.prev_image; //canvas.getContext("2d").getImageData(stx,sty,edx,edy);
							savelist.push(sv);
						}
					}
				}
			}
			this.undohist.push(new UndoBuffer(Draw.context.canvas,savelist));
			if (this.undohist.length > this.defaults.undo.max) {
				var o = this.undohist.shift();
				o.layer = null;
				o.image = [];
				o = null;
			}
		},
		loadUndo : function(){
			var block = {w:0, h:0};
			block.w = this.canvassize[0] / this.defaults.undo.divide;
			block.h = this.canvassize[1] / this.defaults.undo.divide;
			var obj = Draw.undohist.pop(); //一つ前の状態取得
			var ishit = false;
			var samestat = 0;
			if (!obj) return;
			//---1回めは現在と一つ前の状態が同じかどうかのチェックのみ
			for (var i = 0; i < obj.image.length; i++) {
				var svi = obj.image[i];
				if (obj.layer.getContext("2d").getImageData(svi.pos.x,svi.pos.y,block.w,block.h).data == svi.image.data) {
					samestat++;
					
				}
			}
			//---完全に同じだったら次を読み込み
			if (samestat == obj.image.length) {
				obj = Draw.undohist.pop();
			}
			//---2回めが本当のUndoデータからの復元
			if (obj) {
				for (var i = 0; i < obj.image.length; i++) {
					var svi = obj.image[i];
					if (svi) {
						//指定のキャンバスの短形をUndoから復元
						obj.layer.getContext("2d").clearRect(svi.pos.x, svi.pos.y, block.w, block.h);
						obj.layer.getContext("2d").putImageData(svi.image, svi.pos.x, svi.pos.y, 
							svi.pos.x, svi.pos.y,	//prev_image内の開始位置
							block.w, block.h		//短形の幅と高さ
						);
						svi = null;
						ishit = true;
					}
				}
			}
			if (ishit) {
				obj = null;
			}
		},
		loadRedo : function(){
		},
		toggleUndo : function (flag) {
			if (flag){
				Draw.undobtn.disabled = "";
			}else{
				Draw.undobtn.disabled = "disabled";
			}
		},
		toggleRedo : function (flag) {
			if (flag){
				Draw.redobtn.disabled = "";
			}else{
				Draw.redobtn.disabled = "disabled";
			}
		},
		touchStart : function(event) {
			//Wacom WebPlugin確認
			if (!is_checkedAPI) {
				//if (navigator.userAgent.indexOf("Trident") > -1) {
				if ((checkBrowser() == "ie") || (checkBrowser() == "edge")) {
					if (wacom()) {
						if (wacom().penAPI && (wacom().penAPI.version > 0)){
							penAPI = wacom().penAPI;
							is_checkedAPI = true;
						}else{
							penAPI = null;
						}
					}else{
						penAPI = null;
					}
				}
			}
			//メイン処理
			this.drawing = true;
			this.focusing = true;
			//console.log(event);
			var pos  = calculatePosition("touchstart",event,this.context.canvas,{
				"offset" : this.offset,
				"canvasspace":this.canvasspace
			});
			if (this.enablegrid.checked && this.vCtrl_for_aroundgrid) {
				console.log("before pos=");
				console.log(pos);
				//描画位置をグリッドに吸着させる
				pos = this.decide_nearGrid(pos);
				console.log("after pos=");
				console.log(pos);
			}
			this.startX = pos.x;
			this.startY = pos.y;
			this.startPressure = event.pressure;
			//console.log("this.startPressure1="+this.startPressure);
			//if (event.mozPressure) this.startPressure = event.mozPressure;
			
			if (penAPI) this.startPressure = penAPI.pressure;
			//if (this.startPressure == 0) this.startPressure = 0.5;
			//console.log("this.startPressure2="+this.startPressure);
			
			this.draw_linehist.splice(0,this.draw_linehist.length);
			this.draw_linehist.push({"x":pos.x, "y":pos.y, "pressure":event.pressure});
			//---PenSetに安全に受け渡す用の値セット
			this.elementParameter["canvas"] = {
				"width":this.canvassize[0],
				"height":this.canvassize[1]
			};
			this.delay.poshist.splice(0,this.delay.poshist.length);
			this.delay.poshist = [];
			this.delay.flag = false;
			this.delay.count = 0;
			
			//console.log("startPressure=" + this.startPressure);
			document.getElementById("info_currentpos").textContent = Math.round(this.startX) + "x" + Math.round(this.startY);
			//document.getElementById("log2").innerHTML = event.button;
			//---右クリック、スタイラスペンの反対側は消しゴムに設定
			if ((event.button == 2) || (event.button == 5) || (penAPI && (penAPI.isEraser))) {
				console.log("this.last.pen.name=" + this.last.pen.name);
				var svv;
				if ((this.last.eraser) && (this.pen.current.mode == this.last.eraser.name)) {
					//現在のペンモードがまだ消しゴムの場合、太さだけを変化
					svv = this.sizebar.value;
				}else{
					//それ以外の場合、消しゴムのデフォルト太さを採用
					svv = 20;
				}
				if (this.pen.saved.size[this.last.eraser.name] != undefined) {
					svv = this.pen.saved.size[this.last.eraser.name];
				}
				//this.pen.eraser.click();
				this.pen.setEraser(this.context,{"size":svv});
				/*if (this.is_selecting) {
					this.operateCursor("select",svv);
				}else{
					this.operateCursor("draw",svv);
				}*/
				this.start_drawCursor(event,svv,pos);
			}else{
				//再びペンの先などでタッチされたら、前のペンを再採用する
				if (this.last.pen.name != this.pen.current.mode) {
					this.last.pen["func"].click();
					/*if (this.is_selecting) {
						this.operateCursor("select",this.pen.current.size);
					}else{
						this.operateCursor("draw",this.pen.current.size);
					}*/
					this.start_drawCursor(event,this.pen.current.size,pos);
				}
			}
			
			//document.getElementById("log3").innerHTML = event.keyCode;
			//console.log("start, event.button=");
			//console.log(event);
			console.log(this.pressedKey);
			this.keyLikePres = event.keyCode;
			var isundo = true;
			//---タッチ用拡大縮小
			if (event.isPrimary && event.pointerType == "touch") {
				/*if (this.is_drawing_line) {
					this.drawpoints.push(pos);
				}*/
				if (this.is_selecting) {
					this.select_function_start(event,pos);
				}
				this.touchpoints["1"] = {
					"id" : event.pointerId,
					"pos" : pos
				};
				console.log("primary touch=" + event.pointerId + "=" + pos.x + "x" + pos.y);
			}else if (event.pointerType == "touch"){
				/*if (this.is_drawing_line) {
					this.drawpoints.push(pos);
				}*/
				if ((this.touchpoints["1"]) && (event.pointerId != this.touchpoints["1"]["id"])) {
					this.touchpoints["2"] = {
						"id" : event.pointerId,
						"pos" : pos
					};
				}
				//--今後のために3本目のタッチ保持
				/*if ((this.touchpoints["1"] != undefined) && (this.touchpoints["2"] != undefined)) {
					console.log("pointerId="+event.pointerId);
					console.log("touch 1="+this.touchpoints["1"].id);
					console.log("touch 2="+this.touchpoints["2"].id);
					if ((event.pointerId != this.touchpoints["1"].id) && (event.pointerId != this.touchpoints["2"].id)) {
						this.touchpoints["3"] = {
							"id" : event.pointerId,
							"pos" : pos
						};
					}
				}*/
				console.log("secondary touch=" + event.pointerId + "=" + pos.x + "x" + pos.y);
				//---タッチによる操作決定処理
				if (this.touchpoints["1"] && this.touchpoints["2"] && this.touchpoints["1"].id != this.touchpoints["2"].id) {
					//this.is_scaling = true;
					this.drawing = false;
					if (this.is_drawing_line) { //直線描画モードがONのときはタッチによる拡大縮小は無効
						this.is_scaling = false;
						this.drawing = true;
					}else if (this.is_selecting) { //選択モードがONのときは拡大縮小・描画も禁止
						this.is_scaling = false;
						this.drawing = false;
						isundo = false;
						var o = this.selectors.items[0];
						if (o.selectType == selectionType.box) {
							o.destx = pos.x;
							o.desty = pos.y;
							//delete this.touchpoints["2"];
						}else if (o.selectType == selectionType.free) {
							//delete this.touchpoints["2"];
						}
					}else{
						isundo = false;
					}
					console.log("touch 3=");
					console.log(this.touchpoints["3"]);
					if (this.touchpoints["3"]){ //---3点目のタッチがあった場合
						this.is_scaling = false;
						this.is_rotating = true;
					}
					console.log(this.touchpoints);
					this.scale_pos["begin"] = this.touchpoints["1"].pos;
					//this.init_scale = String(document.getElementById("canvaspanel").style.transform).replace("scale(","");
					this.init_scale = this.transform_value[0];
					this.init_scale = parseInt(this.init_scale);
				}
			}else{
				if (this.is_drawing_line) {
					//直線描画モードの時、タッチ以外の場合の処理
					this.drawpoints.push(pos);
					this.drawpoints.push(pos);
				}
				if (this.is_selecting) {
					this.select_function_start(event,pos);
					isundo = false;
					this.drawing = false;
				}
			}
			//---非タッチ用拡大縮小
			if (event.altKey) {
				this.is_scaling = true;
				this.scale_pos["begin"] = pos;
				this.scale_pos["end"] = pos;
				//this.init_scale = String(document.getElementById("canvaspanel").style.transform).replace("scale(","");
				console.log(this.transform_value);
				this.init_scale = this.transform_value[0];
				this.init_scale = parseInt(this.init_scale);
				isundo = false;
				this.drawing = false;
			}
			//スクロール
			if ((event.ctrlKey) || (this.vCtrl_for_scroll)) {
				var cp = document.getElementById("basepanel");
				this.scale_pos["begin"] = pos;
				this.is_scrolling = true;
				isundo = false;
				this.drawing = false;
			}
			//スポイトツール
			if (this.is_spoiting) {
				var img = this.context.getImageData(pos.x,pos.y,1,1);
				var rgb = "#" + img.data[0].toString(16) + img.data[1].toString(16) + img.data[2].toString(16);
				var c = new RGBColor(rgb);
				document.getElementById("colorpicker").value = c.toHex();
				document.getElementById("colorpicker").style.backgroundColor = rgb;
				$.farbtastic("#pickerpanel").setColor(c.toHex());
				isundo = false;
			}
			//console.log(this.currentLayer.Locking());
			if (this.currentLayer.Locking()) {
				//alert("このレイヤーはロックがかかっているため編集できません。");
				alert(_T("touchstart_msg1"));
				this.drawing = false;
				return;
			}
			//---Undoに保管
			this.undo_function_begin(isundo);
			//色選択をここでも確定
			this.pen.current["color"] = this.colorpicker.value;
			//console.log(this.colorpicker.value);
			if (this.pen.current["color"] != "eraser"){
				this.context.strokeStyle = this.colorpicker.value;
				this.context.fillStyle = this.colorpicker.value;
				this.context.shadowColor = this.colorpicker.value;
			}
			this.elementParameter["current"] = this.pen.current;
			this.elementParameter["keyCode"] = this.pressedKey;
			this.elementParameter["pointHistory"] = [];
			//if (this.pen.current["pentype"] == PenType.fill) {
				//this.pen.prepare(event,this.context,null);
				//this.pen.drawMain(this.context,this.startX,this.startY,1,1,event,this.elementParameter);
				//this.drawing = false;
			//}else{
				if ((this.is_drawing_line) && (this.drawpoints.length > 1)) {
					/*this.pen.prepare(event,this.context,null);
					for (var x = 1; x < this.drawpoints.length; x++) {
						this.pen.drawMain(this.context,
							this.drawpoints[x-1].x,this.drawpoints[x-1].y,
							this.drawpoints[x].x,this.drawpoints[x].y,
							event,this.elementParameter);
					}*/
				}else{
					/*cconsole.log("________________________");
					console.log("start=" + this.startX + "	" + this.startY + "	" + event.pressure);
					onsole.log("this.draw_linehist=");
					console.log(this.draw_linehist);
					console.log("this.elementParameter[pointHistory]=");
					console.log(this.elementParameter["pointHistory"]);
					console.log("this.delay.poshist=");
					console.log(this.delay.poshist);*/
					var a = this.is_selecting;
					var b = this.is_scrolling;
					var c = (this.is_selecting && (this.select_type == "tempdraw"));
					var d = this.is_scaling;
					
					this.pen.prepare(event,this.context,null);
					//---選択中でない or スクロール中ではない or 拡大縮小中ではない or 選択中でも一時ペン使用の場合
					if (!a && !b && !d) {
						this.pen.drawMain(this.context,this.startX,this.startY,this.startX,this.startY,event,this.elementParameter);
						console.log("touch start drawMain!!");
						console.log(this.is_scrolling);
					}else{
						if (c) {
							this.pen.drawMain(this.context,this.startX,this.startY,this.startX,this.startY,event,this.elementParameter);
							console.log("touch start drawMain!!");
							console.log(this.is_scrolling);
						}
					}
					/*if (!this.is_selecting || !this.is_scrolling || (this.is_selecting && this.select_type == "tempdraw")) {
						this.pen.drawMain(this.context,this.startX,this.startY,this.startX,this.startY,event,this.elementParameter);
						
					}*/
					//this.delay.poshist.push({"x":this.startX,"y":this.startY,"pressure":event.pressure});
				}
			//}
		},
		
		realDrawMain : function (context,temppres,startX,startY,offsetX,offsetY,evt,param) {
			Draw.pen.prepare(evt,context,temppres);
			Draw.pen.drawMain(context,startX,startY,offsetX,offsetY,evt,param);
			return {x:offsetX,y:offsetY};
		},
		touchMove : function(event) {
			var offsetX = 0;
			var offsetY = 0;
			var offsetPressure = 0;
			//console.log(event);
			var pos  = calculatePosition("touchmove",event,this.context.canvas,{
				"offset" : this.offset,
				"canvasspace":this.canvasspace
			});
			if (this.enablegrid.checked && this.vCtrl_for_aroundgrid) {
				//描画位置をグリッドに吸着させる
				pos = this.decide_nearGrid(pos);
			}
			if (event.isPrimary && event.pointerType == "touch") {
				if (this.touchpoints["1"] && (this.touchpoints["1"].id == event.pointerId)) {
					this.touchpoints["11"] = {
						"id" : event.pointerId,
						"pos" : pos
					};
				}
			}else if (event.pointerType == "touch"){
				if (this.touchpoints["2"] && this.touchpoints["2"].id == event.pointerId) {
					this.touchpoints["12"] = {
						"id" : event.pointerId,
						"pos" : pos
					};
				}
				if (this.touchpoints["3"] && this.touchpoints["3"].id == event.pointerId) {
					this.touchpoints["13"] = {
						"id" : event.pointerId,
						"pos" : pos
					};
				}
			}
			
			offsetX = pos.x;
			offsetY = pos.y;
			offsetPressure = event.pressure;
			//if (event.mozPressure) offsetPressure = event.mozPressure;
			if (penAPI) offsetPressure = penAPI.pressure;
			//if (offsetPressure == 0) offsetPressure = 0.5;
			this.move_drawCursor(event,pos);
			document.getElementById("info_currentpos").textContent = Math.round(offsetX) + "x" + Math.round(offsetY);
			if (this.is_scaling) { //拡大縮小モード
				var distance = 0;
				if (this.touchpoints["1"] && this.touchpoints["2"] && this.touchpoints["11"] && this.touchpoints["12"]) {
					var touchdir = [0,0];
					touchdir[0] = this.touchpoints["11"].pos.y - this.touchpoints["1"].pos.y;
					touchdir[1] = this.touchpoints["12"].pos.y - this.touchpoints["2"].pos.y;
					for (var t = 0; t < touchdir.length; t++) {
						if (touchdir[t] > 0) {
							touchdir[t] = "u";
						}else if (touchdir[t] < 0) {
							touchdir[t] = "d";
						}else{
							touchdir[t] = "-";
						}
					}
					console.log("0 - 1 = "+touchdir[0] + " - " + touchdir[1]);
					if (touchdir[0] == touchdir[1]) { //指が両方同じ方向へ
						console.log("rotating");
					}else{ //指がそれぞれ違う方向へ
						console.log("scaling");
					}
					
					var scalebegin =  this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y;
					var scaleend = this.touchpoints["12"].pos.y - this.touchpoints["11"].pos.y;
					if (scalebegin < 0) scalebegin = scalebegin * -1;
					if (scaleend < 0) scaleend = scaleend * -1;
					if (scaleend > scalebegin) {
						this.scaleUp();
					}else if (scaleend < scalebegin) {
						this.scaleDown();
					}
					this.during_distance = scaleend;
				}else{
					this.scale_pos["end"] = (this.touchpoints["2"] ? this.touchpoints["2"].pos : pos);
					var db = this.scale_pos["begin"].y; //(this.scale_pos["begin"].x + this.scale_pos["begin"].y) / 2;
					var de = this.scale_pos["end"].y; //(this.scale_pos["end"].x + this.scale_pos["end"].y) / 2;
					distance = de - db;
					
					//console.log("-----");
					//console.log("scale_pos.begin=");
					//console.log(this.scale_pos["begin"]);
					//console.log("pos=");
					//console.log(pos);
					if (Math.abs(distance - this.during_distance) >= 50) {
						//直前の距離との差が50以上だったらおかしい操作として無視する。
						distance = 0;
					}
					if ((!event.altKey) && (this.scale_pos["end"].y == pos.y)) {
						distance = 0;
					}
					//var distance = Math.sqrt(powsum);
					var bi = (distance) / 100;
					var fnlbi = 1.0;
					//console.log("db -> de = " + db + ", " + de);
					//console.log("distance="+distance);
					if (distance > 0.0) {
						this.scaleUp();
					}else if (distance < 0.0) {
						this.scaleDown();
					}
					this.during_distance = distance;
				}
				return;
			}
			if (this.is_rotating) {
				var rotbegin =  this.touchpoints["3"].pos.x - this.touchpoints["1"].pos.x;
				var rotend = this.touchpoints["13"].pos.x - this.touchpoints["11"].pos.x;
				if (rotbegin < 0) rotbegin = rotbegin * -1;
				if (rotend < 0) rotend = rotend * -1;
				if (rotend > rotbegin) {
					this.rotateRight();
				}else if (scaleend < scalebegin) {
					this.rotateLeft();
				}
			}
			//スクロールモード
			if (this.is_scrolling) {
				this.scale_pos["end"] = pos;
				var db = {
					"x": this.startX, //this.scale_pos["begin"].x,
					"y" : this.startY, //this.scale_pos["begin"].y
				};
				var de = {
					"x" : this.scale_pos["end"].x,
					"y" : this.scale_pos["end"].y
				};
				var distance = {
					"x" : (de.x - db.x) * -1,
					"y" : (de.y - db.y) * -1
				};
				var cp = document.getElementById("basepanel");
				cp.scrollTop = cp.scrollTop + (distance.y * 0.1);
				cp.scrollLeft = cp.scrollLeft + (distance.x * 0.1);
				
				this.during_translate.x += de.x - db.x;
				this.during_translate.y += de.y - db.y;
				console.log("db.x -> de.x = during_translate.x : " + db.x + " -> " + de.x + " = " + this.during_translate.x);
				console.log("db.y -> de.y = during_translate.y : " + db.y + " -> " + de.y + " = " + this.during_translate.y);
				this.transformCanvas({
					"translateX" : this.during_translate.x + "px",
					"translateY" : this.during_translate.y + "px"
				});
				//this.startX = offsetX;
				//this.startY = offsetY;
				return;
			}
			//直線描画モード
			if (this.is_drawing_line) {
				this.drawshape_function_move(event,pos);
			}
			//選択モード
			if (this.is_selecting) {
				if (event.pointerType == "touch") {
					if ((this.touchpoints["1"]) && (this.touchpoints["1"].id == event.pointerId)) {
						this.select_function_move(event,pos);
					}
				}else{
					this.select_function_move(event,pos);
				}
				if (this.select_type == "tempdraw"){
					if (this.pen.current["pentype"] != PenType.fill) {
						this.drawing = true;
					}
				}else{
					this.drawing = false;
				}
			}
			//通常描画モード
			if (this.drawing) {
				//this.moveCursor(event.clientX,event.clientY);
				//console.log("offsetPressure=" + offsetPressure);
				//console.log("move, event.button=");
				this.elementParameter["keyCode"] = this.pressedKey;
				//---筆ごとの描画開始
				//---補完判定・処理開始
				var distance = 0;
				var saX = 0;
				var saY = 0;
				var saPres = 0;
				if (this.delay.poshist.length > 0) {
					distance = Math.sqrt(
						(offsetX - this.delay.poshist[0].x) * (offsetX - this.delay.poshist[0].x)
						+ (offsetY - this.delay.poshist[0].y) * (offsetY - this.delay.poshist[0].y)
					);
					saX = offsetX - this.delay.poshist[0].x;
					saY = offsetY - this.delay.poshist[0].y;
					saPres = offsetPressure - this.delay.poshist[0].pressure;
				}else{
					distance = Math.sqrt(
						(offsetX - this.startX) * (offsetX - this.startX)
						+ (offsetY - this.startY) * (offsetY - this.startY)
					);
					saX = offsetX - this.startX;
					saY = offsetY - this.startY;
					saPres = offsetPressure - this.startPressure;
				}
				var ju_saX = Math.abs(saX);
				var ju_saY = Math.abs(saY);
				var ju_distance = Math.abs(distance);
				var ju_saPres = saPres;
				var pmX = (saX < 0 ? -1 : 1); //+-基準値
				var pmY = (saY < 0 ? -1 : 1); //+-基準値
				var pmPres = (saPres < 0 ? -1 : 1); //+-基準値
				var size_sa = parseInt(document.getElementById("pensize").max) - this.pen.current["size"] + 1;
				size_sa = size_sa / 4;
				/*console.log("====>");
				console.log("start=" + this.startX + "	" + this.startY + "	" + this.startPressure);
				console.log("offset=" + offsetX + "	" + offsetY + "	" + offsetPressure);
				console.log("sa=" + ju_saX + "x" + ju_saY);
				console.log("distance=" + distance);
				console.log("pm=" + pmX + "x" + pmY);
				console.log("saPres=" + saPres);
				console.log("size_sa=" + size_sa);
				console.log("<====");*/
				
				//---大元を平均値算出補正
				if (this.pen.correction_level > 0) {
					var sum = {x:offsetX, y:offsetY, pres:offsetPressure};
					//console.log(this.draw_linehist);
					var realpluscnt = 1;
					for (var i = this.draw_linehist.length-1; i >= 0; i--) {
						if (i < (this.draw_linehist.length - (this.pen.correction_level-1))) break;
						sum.x += this.draw_linehist[i].x;
						sum.y += this.draw_linehist[i].y;
						sum.pres += this.draw_linehist[i].pressure;
						realpluscnt++;
					}
					if (realpluscnt > this.pen.correction_level) {
						realpluscnt = this.pen.correction_level;
					}
					offsetX = sum.x / realpluscnt;
					offsetY = sum.y / realpluscnt;
					//offsetPressure = sum.pres / realpluscnt;
				}
				
				if (this.delay.flag) {
					if (this.delay.count < 1) {
						this.elementParameter["pointHistory"] = [];
						//console.log("---" + this.delay.count + "nd delay.");
						this.elementParameter["pointHistory"] = this.elementParameter["pointHistory"].concat(this.delay.poshist);
						//---コピーしたら消す
						this.delay.poshist.splice(0,this.delay.poshist.length);
						this.delay.poshist = [];
						this.delay.flag = false;
						this.delay.count = 0;
					}
				}else{
					if (this.pen.current["delay"] > 0) {
						this.delay.flag = true;
						//console.log("---1st delay start");
						this.delay.count = this.pen.current["delay"];
						this.delay.poshist = [];
						//this.delay.poshist.push({"x":this.startX,"y":this.startY,"pressure":event.pressure});
					}
				}
				//---距離が一定を超えた＆補完有効フラグがtrueのブラシのみ自動補正
				var ret = null;
				if (this.pen.current["complete"]) {
					if ((!this.delay.flag)){
						if (  (ju_distance > size_sa)) {
						//if ((!this.is_discomplete) && (ju_distance > size_sa)) {
						//if ((ju_saX > this.pen.current["size"]*size_sa) || (ju_saY > this.pen.current["size"]*size_sa)){
							//---補完算出開始
							//console.log("---correct_main---");
							//console.log(this.elementParameter["pointHistory"]);
							ret = this.correct_main(event,{
								"prev": {"x" : (this.elementParameter["pointHistory"].length > 0 ? 
									this.elementParameter["pointHistory"][0].x : -1),
										 "y" : (this.elementParameter["pointHistory"].length > 0 ? 
									this.elementParameter["pointHistory"][0].y : -1)},
								"start"  : {"x" : this.startX, "y" : this.startY},
								"offset" : {"x" : offsetX, "y" : offsetY},
							},{
								"prev"  : (this.elementParameter["pointHistory"].length > 0 ? 
									this.elementParameter["pointHistory"][0].pressure : -1),
								"start" : this.startPressure,
								"offset": offsetPressure
							});
							this.draw_linehist = this.draw_linehist.concat(ret.pos);
							this.elementParameter["pointHistoryLast"] = ret.pos[ret.pos.length-1];
						}else{
							//pen pressure calc
							this.realDrawMain(this.context,offsetPressure,this.startX,this.startY,offsetX,offsetY,event,this.elementParameter);
							//console.log("draw: no assist");
						}
					}else{
						if (this.pen.current.delay_assist == true) {
							this.realDrawMain(this.context,offsetPressure,this.startX,this.startY,offsetX,offsetY,event,this.elementParameter);
						}
					}
				}else{
					//pen pressure calc
					this.realDrawMain(this.context,offsetPressure,this.startX,this.startY,offsetX,offsetY,event,this.elementParameter);
					//console.log("draw: normal");
				}
			}
			if (this.delay.count > 0) {
				this.delay.count--;
				this.delay.poshist.push({"x":this.startX,"y":this.startY,"pressure":offsetPressure});
				//console.log("delay push="+this.delay.poshist.length);
				//console.log(this.startX + "	" + this.startY);
				//console.log(this.delay.poshist[0]);
			}
			//console.log("    start=");
			//console.log(this.startX + "	" + this.startY + "	" + this.startPressure);
			if (!ret) {
				this.elementParameter["pointHistoryLast"] = {
					"x" : this.startX,
					"y" : this.startY,
					"pressure" : this.startPressure
				};
			}
			this.startX = offsetX;
			this.startY = offsetY;
			this.startPressure = offsetPressure;
			//console.log(this.elementParameter["pointHistoryLast"]);
			this.draw_linehist.push({"x":pos.x, "y":pos.y, "pressure":offsetPressure});
			this.elementParameter["pointHistory"] = [];
			event.preventDefault();
		},
		touchEnd : function(event) {
			var pos  = calculatePosition("touchmove",event,this.context.canvas,{
				"offset" : this.offset,
				"canvasspace":this.canvasspace
			});
			if (this.enablegrid.checked && this.vCtrl_for_aroundgrid) {
				//描画位置をグリッドに吸着させる
				pos = this.decide_nearGrid(pos);
			}
			//---直線描画モード確定
			if (this.is_drawing_line) {
				this.drawshape_function_end(event,pos);
			}
			//選択モード
			if (this.is_selecting) {
				this.select_function_end(event,pos);
				this.drawing = false;
			}
			if (this.drawing)  {
				offsetX = pos.x;
				offsetY = pos.y;
				//console.log("last start pressure="+this.startPressure);
				//console.log("end=" + offsetX + "	" + offsetY + "	" + event.pressure);
				if (this.elementParameter["pointHistoryLast"]) {
					this.elementParameter["pointHistory"].push(this.elementParameter["pointHistoryLast"]);
				}
				var offsetPressure = event.pressure * 0;
				//console.log("offsetPressure=" + offsetPressure);
				//this.pen.prepare(event,this.context,offsetPressure);
				//this.pen.drawMain(this.context,this.startX,this.startY,offsetX,offsetY,event,this.elementParameter);
				this.correct_main(event,{
					"prev": {"x" : (this.elementParameter["pointHistory"].length > 0 ? 
						this.elementParameter["pointHistory"][0].x : -1),
							 "y" : (this.elementParameter["pointHistory"].length > 0 ? 
						this.elementParameter["pointHistory"][0].y : -1)},
					"start"  : {"x" : this.startX, "y" : this.startY},
					"offset" : {"x" : offsetX, "y" : offsetY},
				},{
					"prev"  : (this.elementParameter["pointHistory"].length > 0 ? 
						this.elementParameter["pointHistory"][0].pressure : -1),
					"start" : this.startPressure,
					"offset": offsetPressure
				});

				//---save undo
				this.undo_function_end();
				this.drawing = false;
			}
			//	document.getElementById("log").innerHTML = this.startX + "x" + this.startY + " -> " + offsetX + "x" + offsetY;
			//document.getElementById("log3").innerHTML = event.tiltX;
			//console.log("end, event.button=");
			//console.log(event);
			this.is_scrolling = false;
			this.is_scaling = false;
			this.init_scale = this.during_scale;
			if (this.touchpoints["1"] && (event.pointerId == this.touchpoints["1"].id)) {
				this.touchpoints["1"] = null;
				delete this.touchpoints["1"];
				//一点目の指を離したのだから、2点目の指の位置を1点目に移し替え
				this.touchpoints["1"] = this.touchpoints["2"];
			}
			if (this.touchpoints["11"] && (event.pointerId == this.touchpoints["11"].id)) {
				this.touchpoints["11"] = null;
				delete this.touchpoints["11"];
				//一点目の指を離したのだから、2点目の指の位置を1点目に移し替え
				this.touchpoints["11"] = this.touchpoints["21"];
			}
			if (this.touchpoints["2"] && (event.pointerId == this.touchpoints["2"].id)){
				this.touchpoints["2"] = null;
				delete this.touchpoints["2"];
			}
			if (this.touchpoints["12"] && (event.pointerId == this.touchpoints["12"].id)){
				this.touchpoints["12"] = null;
				delete this.touchpoints["12"];
			}
			if (this.touchpoints["3"] && (event.pointerId == this.touchpoints["3"].id)){
				this.touchpoints["3"] = null;
				delete this.touchpoints["3"];
			}
			if (this.touchpoints["13"] && (event.pointerId == this.touchpoints["13"].id)){
				this.touchpoints["13"] = null;
				delete this.touchpoints["13"];
			}
			this.is_discomplete = false;
			this.discomplete_count.startx = 0;
			this.discomplete_count.offsetx = 0;
			this.discomplete_count.ju_sax = 0;
			this.discomplete_count.starty = 0;
			this.discomplete_count.offsety = 0;
			this.discomplete_count.ju_say = 0;
			this.delay.poshist.splice(0,this.delay.poshist.length);
			this.delay.poshist = [];
			this.delay.flag = false;
			this.delay.count = 0;
			//this.touchpoints = {};
			
			//console.log(this.draw_linehist);
			
			var lc = 0, hc = 0;
			if (this.draw_linehist.length > 0) {
				var lx = this.draw_linehist[0].x, ly = this.draw_linehist[0].y, hx = this.draw_linehist[0].x, hy = this.draw_linehist[0].y;
				for (var i = 0; i < this.draw_linehist.length; i++) {
					//most low
					if (lx >= this.draw_linehist[i].x) {
						lx = this.draw_linehist[i].x;
						lc = i;
					}
					if (ly >= this.draw_linehist[i].y) {
						ly = this.draw_linehist[i].y;
					}
					//most high
					if (hx <= this.draw_linehist[i].x) {
						hx = this.draw_linehist[i].x;
						hc = i;
					}
					if (hy <= this.draw_linehist[i].y) {
						hy = this.draw_linehist[i].y;
					}
					
				}
				/*console.log("low count="+lc);
				console.log("lx="+lx);
				console.log("ly="+ly);
				console.log("high count="+hc);
				console.log("hx="+hx);
				console.log("hy="+hy);*/
			}
			event.preventDefault();
			console.log("canvas touch end");
			this.draw_linehist = [];
			this.elementParameter["pointHistory"] = [];
			this.elementParameter["pointHistoryLast"] = null;
		},
		touchLeave : function(event){
			var pos  = calculatePosition("touchmove",event,this.context.canvas,{
				"offset" : this.offset,
				"canvasspace":this.canvasspace
			});
			//console.log("leave, event.button=");
			//console.log(event);
			//---直線描画モード確定
			if (this.is_drawing_line) {
				if (this.enablegrid.checked && this.vCtrl_for_aroundgrid) {
					//描画位置をグリッドに吸着させる
					pos = this.decide_nearGrid(pos);
				}
				this.drawshape_function_end(event,pos);

			}
			if (this.drawing)  {
				if (this.enablegrid.checked && this.vCtrl_for_aroundgrid) {
					//描画位置をグリッドに吸着させる
					pos = this.decide_nearGrid(pos);
				}
				offsetX = pos.x;
				offsetY = pos.y;
				if (this.elementParameter["pointHistoryLast"]) {
					this.elementParameter["pointHistory"].push(this.elementParameter["pointHistoryLast"]);
				}
				console.log("leave pos=" + pos.x + "	" + pos.y);
				console.log(this.elementParameter["pointHistory"]);
				var offsetPressure = event.pressure * 0;
				//this.pen.prepare(event,this.context,offsetPressure);
				//this.pen.drawMain(this.context,this.startX,this.startY,offsetX,offsetY,event,this.elementParameter);
					
				this.correct_main(event,{
					"prev": {"x" : (this.elementParameter["pointHistory"].length > 0 ? 
						this.elementParameter["pointHistory"][0].x : -1),
							 "y" : (this.elementParameter["pointHistory"].length > 0 ? 
						this.elementParameter["pointHistory"][0].y : -1)},
					"start"  : {"x" : this.startX, "y" : this.startY},
					"offset" : {"x" : offsetX, "y" : offsetY},
				},{
					"prev"  : (this.elementParameter["pointHistory"].length > 0 ? 
						this.elementParameter["pointHistory"][0].pressure : -1),
					"start" : this.startPressure,
					"offset": offsetPressure
				});
				//---save undo
				this.undo_function_end();
				
				//this.drawing = false;
				this.startX = offsetX;
				this.startY = offsetY;
			}
			if (this.touchpoints["1"] && (event.pointerId == this.touchpoints["1"].id)) {
				this.touchpoints["1"] = null;
				delete this.touchpoints["1"];
			}
			if (this.touchpoints["11"] && (event.pointerId == this.touchpoints["11"].id)) {
				this.touchpoints["11"] = null;
				delete this.touchpoints["11"];
			}
			if (this.touchpoints["2"] && (event.pointerId == this.touchpoints["2"].id)){
				this.touchpoints["2"] = null;
				delete this.touchpoints["2"];
			}
			if (this.touchpoints["21"] && (event.pointerId == this.touchpoints["21"].id)){
				this.touchpoints["21"] = null;
				delete this.touchpoints["21"];
			}
			this.is_discomplete = false;
			this.discomplete_count.startx = 0;
			this.discomplete_count.offsetx = 0;
			this.discomplete_count.ju_sax = 0;
			this.discomplete_count.starty = 0;
			this.discomplete_count.offsety = 0;
			this.discomplete_count.ju_say = 0;
			for (var i = 0; i < this.delay.poshist.length; i++) {
				delete this.delay.poshist[i];
			}
			this.delay.poshist.splice(0,this.delay.poshist.length);
			this.delay.poshist = [];
			this.delay.flag = false;
			this.delay.count = 0;
			this.draw_linehist = [];
			this.elementParameter["pointHistory"] = [];
			this.elementParameter["pointHistoryLast"] = null;
			this.focusing = false;
			this.end_drawCursor(event,pos);
			console.log("canvas touch leave");
		},
		touchEnter : function(event){
			//console.log("enter, event.button=");
			//console.log(event);
			this.focusing = true;
			//$("#" + Draw.screencan.id).css("cursor","crosshair");
			var pos  = calculatePosition("touchmove",event,this.context.canvas,{
				"offset" : this.offset,
				"canvasspace":this.canvasspace
			});
			if (this.drawing) {
				//this.drawing = false;
				this.startX = pos.x;
				this.startY = pos.y;
				//this.startPressure = offsetPressure;
				
			}
			if (this.is_selecting) {
				//this.operateCursor("select",this.sizebar.value);
				//this.showCursor(false);
				event.target.style.cursor = "default";
			}else{
				//this.operateCursor("draw",this.sizebar.value);
				//this.showCursor(true);
				this.start_drawCursor(event,this.pen.current.size,pos);
				event.target.style.cursor = "none";
			}
			//this.moveCursor(event.clientX,event.clientY);
		},
		hammer_touches : function(event) {
			console.log("---"+event.type);
			//図形描画・選択操作中は多点タッチ操作を中止
			if (Draw.is_drawing_line || Draw.is_selecting) return false;
			if (event.type == "pinch") {
				
				console.log("pinch scale" + event.scale);
				Draw.scale(event.scale*100);
			}else if (event.type == "rotate") {
				console.log("rotate rotation" + event.rotation);
				Draw.rotate(event.rotation);
			}
		}
	};
