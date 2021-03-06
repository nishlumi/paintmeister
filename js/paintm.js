var onKeyope = true;
function wacom() {
    return document.getElementById('wtPlugin');
}
var penAPI;
var is_checkedAPI;

function alert(message){
	alertify.set({ 
		buttonReverse : true,
	});
	alertify.alert(message);
	//$.messager.alert("PaintMeister",message,"warning");
}
function confirm(message,callback,callthen) {
	alertify.set({ 
		buttonReverse : true
	});
	alertify.confirm(message,function(ret){
		if (ret){
			if (!callback()) {
				if (callthen) callthen();
			}
		}
	});
	/*$.messager.confirm("PaintMeister",message,function(ret){
		if (ret){
			if (!callback()) {
				if (callthen) callthen();
			}
		}
	});*/
}
function prompt(message,callthen,defaultval){
	onKeyope = false;
	alertify.set({ 
		buttonReverse : true
	});
	alertify.prompt(message,function(ret,str){
		//if (ret) {
			if (callthen) callthen(str);
		//}
		onKeyope = true;
	},defaultval);
	/*$.messager.prompt("PaintMeister",message,function(ret){
		//if (ret) {
			if (callthen) callthen(ret);
			onKeyope = true;
		//}
	});*/
}
function saveImage() {
	//if ((navigator.userAgent.indexOf("Chrome") > -1) && (chrome.fileSystem)) {
	if (checkBrowser() == "chromeapps") {
		//---for ChromeApps
		var blob = dataURItoBlob(Draw.canvas.toDataURL("image/png"));

		var config = {type: 'saveFile', suggestedName: "New Image.png"};
		chrome.fileSystem.chooseEntry(config, function(writableEntry) {
			console.log("writableEntry=");
			console.log(writableEntry);
			writeFileEntry(writableEntry, blob, function(e) {
				//$.jGrowl("キャンバスの画像を保存しました");
				$.jGrowl(_T("saveImage_msg1"));
			});
		});
	}else{
		//---for Web app
		console.log("dataURL length=");
		console.log(Draw.canvas.toDataURL("image/png"));
		var w = window.open("","_blank");
		w.document.open();
		w.document.write("<img src='" + Draw.canvas.toDataURL("image/png") + "'>");
		w.document.close();
	}
}
function preloadProjectFile(file,options){
	var def = $.Deferred();
	var reader = new FileReader();
	if (String(file.name).indexOf(".pmpf") == -1) {
		def.reject(false);
	}else{
		reader.onload = function(e) {
			//document.getElementById("progressbar").value = 3;
			//console.log(file);
			var ret = Draw.preloadProject(file.name,reader.result);
			//---1つ読み込んだらサムネイルセットして画面に追加
			Draw.addToFilelistPanel(file,ret);
		}
		reader.onerror = function(e){
		}
		reader.readAsText(file);
	}
	return def.promise();
}
function loadProjectFile(files){
	var reader = new FileReader();
	if (files.length == 0) {
		//alert("ファイルが指定されていません！");
		alert(_T("loadProjectFile_msg1"));
		return false;
	}
	if (files[0].name.indexOf(".pmpf") == -1) {
		//alert("有効なPaintMeisterプロジェクトファイルではありません！");
		alert(_T("loadProjectFile_msg2"));
		return false;
	}else{
		reader.onloadstart = function (e){
			document.getElementById("progressicon").className = "get-animestart";
			Draw.progresspanel.style.display = "block";
		}
		reader.onload = function(e) {
			//document.getElementById("progressbar").value = 3;
			console.log(files[0]);
			if (Draw.loadProject(reader.result)) {
				Draw.displayFromProject(files[0].name);
			}else{
				//alert("有効なPaintMeisterプロジェクトファイルではありません！");
				alert(_T("loadProjectFile_msg2"));
			}
		}
		reader.onerror = function(e){
			//alert("有効なPaintMeisterプロジェクトファイルではありません！");
			alert(_T("loadProjectFile_msg2"));
		}
		reader.readAsText(files[0]);
		return true;
	}
}
function saveProject(data){
	//if ((navigator.userAgent.indexOf("Chrome") > -1) && (chrome.fileSystem)) {
	if (checkBrowser() == "chromeapps") {
		var sugfilename;
		if (Draw.filename == "") {
			sugfilename = "New Project.pmpf"
		}else{
			sugfilename = Draw.filename;
		}
		var config = {type: 'saveFile', suggestedName: sugfilename,
		accepts:[
			{description:"PaintMeister Project File (*.pmpf)", extensions:["pmpf"]}
		]};
		chrome.fileSystem.chooseEntry(config, function(writableEntry) {
			console.log("writableEntry=");
			console.log(writableEntry);
			if (writableEntry) {
				var blob = new Blob([data],{type:"text/plain",encodings:"native"});
				writeFileEntry(writableEntry, blob, function(e) {
				});
				//$.jGrowl("プロジェクトファイルに保存しました");
				$.jGrowl(_T("saveProject_msg1"));
				document.getElementById("openedProjName").innerText = " - " + writableEntry.name;
				Draw.filename = writableEntry.name;
				Draw.progresspanel.style.display = "none";
				document.getElementById("progressicon").className = "";
			}else{
				Draw.progresspanel.style.display = "none";
				document.getElementById("progressicon").className = "";
			}
		});
	}else{
		//"ファイル名を入力してください。(拡張子は不要です）"
		prompt(_T("saveProject_msg2"),function(fl){
			if (fl) {
				var bb = new Blob([data],{type:"text/plain",encodings:"native"});
				Draw.filename = fl + ".pmpf";
				//if (navigator.userAgent.indexOf("Trident") > -1){
				if ((checkBrowser() == "ie") || (checkBrowser() == "edge")) {
					window.navigator.msSaveBlob(bb, fl + ".pmpf");
					document.getElementById("openedProjName").innerText = " - " + fl + ".pmpf";
				}else{
					var bb = new Blob([data],{type:"application/octet-stream",encodings:"native"});
					var a = document.createElement("a");
					a.href = window.URL.createObjectURL(bb);
					a.target = "_blank";
					a.download = fl + ".pmpf";
					a.click();
					document.getElementById("openedProjName").innerText = " - " + fl + ".pmpf";
				}
				Draw.progresspanel.style.display = "none";
				document.getElementById("progressicon").className = "";
			}else{
				Draw.progresspanel.style.display = "none";
				document.getElementById("progressicon").className = "";
			}
			console.log("fl=");
			console.log(fl);
		},Draw.filename.replace(/\..+$/,""));
	}
}
function ElementTransform(element, value) {
	element.style.msTransform = value;
	element.style.webkitTransform = value;
	element.style.mozTransform = value;
	element.style.transform = value;
}
var AppStorage = {
	apptype : "",
	chromestorage : {},
	isEnable : function (){
		if (this.apptype == "chromeapp") {
			return true;
		}else{
			if (localStorage) {
				return true;
			}else{
				return false;
			}
		}
	},
	get : function (key,defaults) {
		var a;
		if (this.apptype == "chromeapp") {
			a = this.chromestorage[key];
		}else{
			a = localStorage.getItem(key);
		}
		if (!a) a = defaults;
		return a;
	},
	set : function (key,value) {
		if (this.apptype == "chromeapp") {
			this.chromestorage[key] = value;
			this.save();
		}else{
			localStorage.setItem(key,value);
		}
	},
	remove : function(key){
		if (this.apptype == "chromeapp") {
			delete this.chromestorage[key];
		}else{
			localStorage.removeItem(key);
		}
	},
	initialize : function (callback){
		if ((navigator.userAgent.indexOf("Chrome") > -1) && (chrome.fileSystem)) {
			this.apptype = "chromeapp";
			chrome.storage.local.get("appstorage",function(items){
				if (items["appstorage"]) {
					AppStorage.chromestorage = items["appstorage"];
				}
				callback();
			});
		}else{
			this.apptype = "webapp";
			callback();
		}
		console.log(this.apptype);
	},
	save : function(){
		if (this.apptype == "chromeapp") {
			chrome.storage.local.set({"appstorage":this.chromestorage});
		}
	}
};
var PluginManager = {
	plugins : [],
	platform : "",	//web, chromeapps, storeapp
	add : function (data) {
		
	},
	initialize : function (pltfrm){
		this.platform = pltfrm;
		if (pltfrm == "web") {
		}else if (pltfrm == "chromeapps") {
		}
	}
};
//#################################################################################
//#################################################################################
(function(){
	$(window).on("beforeunload",function(){
		return "戻る、再読み込みをすると保存していない作業中の絵が消えます。大丈夫ですか？";
	});
	document.body.oncontextmenu = function(event) {
		return false;
	}
	window.addEventListener("load",function(){
		//console.log(wacom());
		is_checkedAPI = false;
		//if (navigator.userAgent.indexOf("Trident") < 0) {
		if ((checkBrowser() != "ie") && (checkBrowser() != "edge")) {
		//if (window.PointerEvent == undefined) {
			
		//}else{
			//if ((navigator.userAgent.indexOf("Chrome") > -1) && (chrome.fileSystem)) {
			if (checkBrowser() == "chromeapps") {
				var obj = document.createElement("embed");
				obj.id = "wtPlugin";
				obj.type = "application/x-wacomtabletplugin";
				obj.width = "1";
				obj.height = "1";
				obj.style.position = "absolute";
				obj.style.left = "100px";
				obj.style.top = "100px";
				document.body.appendChild(obj);
			}else{
				var obj = document.createElement("object");
				obj.id = "wtPlugin";
				obj.type = "application/x-wacomtabletplugin";
				obj.width = "1";
				obj.height = "1";
				obj.style.position = "absolute";
				obj.style.left = "100px";
				obj.style.top = "100px";
				document.body.appendChild(obj);
			}
			penAPI = wacom().penAPI;
		}
		//---ここからストアアプリも共通
		document.addEventListener("keydown", function(event) {
			if (!onKeyope) return false;
			console.log(event.keyCode);
			Draw.pressedKey = event.keyCode;
			return Draw.appKeyEvent(event.keyCode, event.ctrlKey,event.altKey,event.shiftKey);
			/*
			if ((event.keyCode == "32") || (event.keyCode == "49") || (event.keyCode == "97")){ //SPACE or 1
				if (document.getElementById("initialsetup").style.display == "none") {
					document.getElementById("btn_menu").click();
					
					//return event.preventDefault();
				}
			}else if ((event.keyCode == "50") || (event.keyCode == "98")) { // 2
				if (document.getElementById("initialsetup").style.display == "none") {
					document.getElementById("info_btn_canvassize").click();
					
					//return event.preventDefault();
				}
			}else if ((event.keyCode == "51") || (event.keyCode == "99")) { // 3
				if (document.getElementById("initialsetup").style.display == "none") {
					document.getElementById("info_layer").click();
					
					//return event.preventDefault();
				}
			}else if ((event.keyCode == "52") || (event.keyCode == "100")) { // 4
				if (document.getElementById("initialsetup").style.display == "none") {
					document.getElementById("info_pen_mode").click();
					
					//return event.preventDefault();
				}
			}else if (event.keyCode == "90" && event.ctrlKey) { //Ctrl + Z
				if (document.getElementById("initialsetup").style.display == "none") {
					Draw.undobtn.click();
					return;
				}
			}else if (event.keyCode == "89" && event.ctrlKey) { //Ctrl + Y
				if (document.getElementById("initialsetup").style.display == "none") {
					Draw.redobtn.click();
					return;
				}
			}else if (event.keyCode == "83" && event.ctrlKey) { //Ctrl + S
				if (document.getElementById("initialsetup").style.display == "none") {
					Draw.checkstat.click();
					return;
				}
			}else if (event.keyCode == "82") { // R
				if (document.getElementById("initialsetup").style.display == "none") {
					if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
						document.getElementById("sel_seltype_box").click();
						return;
					}
				}
			}else if (event.keyCode == "84") { // T
				if (document.getElementById("initialsetup").style.display == "none") {
					if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
						document.getElementById("sel_seltype_free").click();
						return;
					}
				}
			}else if (event.keyCode == "89") { // Y
				if (document.getElementById("initialsetup").style.display == "none") {
					if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
						document.getElementById("sel_seltype_move").click();
						return;
					}
				}
			}else if (event.keyCode == "85") { // U
				if (document.getElementById("initialsetup").style.display == "none") {
					if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
						document.getElementById("sel_seltype_rotate").click();
						return;
					}
				}
			}else if (event.keyCode == "73") { // I
				if (document.getElementById("initialsetup").style.display == "none") {
					if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
						document.getElementById("sel_seltype_tempdraw").click();
						return;
					}
				}
			}else if (event.keyCode == "88" && event.ctrlKey) { //Ctrl + X
				if (document.getElementById("initialsetup").style.display == "none") {
					if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
						document.getElementById("sel_operationtype_cut").click();
						return;
					}
				}
			}else if (event.keyCode == "67" && event.ctrlKey) { //Ctrl + C
				if (document.getElementById("initialsetup").style.display == "none") {
					if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
						document.getElementById("sel_operationtype_copy").click();
						return;
					}
				}
			}else if (event.keyCode == "86" && event.ctrlKey) { //Ctrl + V
				if (document.getElementById("initialsetup").style.display == "none") {
					if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
						document.getElementById("sel_operationtype_paste").click();
						return;
					}
				}
			}else if (event.keyCode == "48" && event.altKey) { // Alt + 0
				document.getElementById("canvaspanel").style.transform = "scale(1.0)";
				document.getElementById("info_magni").innerText = "1.0";
				Draw.canvassize[0] = Draw.defaults.canvas.size[0];
				Draw.canvassize[1] = Draw.defaults.canvas.size[0];
				Draw.resizeCanvasMargin(window.innerWidth,window.innerHeight);
				Draw.init_scale = 1.0;
			}else if (event.keyCode == "38" && event.altKey) { // Alt + Up key
				Draw.scaleUp();
			}else if (event.keyCode == "107" && event.altKey) { //Alt + +
				Draw.scaleUp();
				event.returnValue = false;
				return false;
			}else if (event.keyCode == "40" && event.altKey) { // Alt + Down key
				Draw.scaleDown();
			}else if (event.keyCode == "109" && event.altKey) { //Alt + -
				Draw.scaleDown();
				event.returnValue = false;
				return false;
			}else if (event.keyCode == "221" && event.altKey) { // Alt + ]
				Draw.turnLayerUp();
			}else if (event.keyCode == "219" && event.altKey) { // Alt + [
				Draw.turnLayerDown();
			}else if (event.keyCode == "221" && event.altKey) { // ]
				Draw.changePensizeUp();
			}else if (event.keyCode == "219" && event.altKey) { // [
				Draw.changePensizeDown();
			}
			var relkey = ["81","87"];
			//---手動筆圧イベント
			if (document.getElementById("chk_enable_handpres").className == "switchbutton_on") {
				if ((event.keyCode == "81") || (event.keyCode == "87")) { //--Q or W
					Draw.keyLikePres += virtual_pressure[event.keyCode];
					document.getElementById("pres_curline").value = 
						parseInt(document.getElementById("pres_curline").value) + virtual_pressure[event.keyCode];
				}else if (event.keyCode == "69") { //--E
					Draw.keyLikePres = virtual_pressure[event.keyCode];
					document.getElementById("pres_curline").value = virtual_pressure[event.keyCode];
				}//else{
				//	Draw.keyLikePres = virtual_pressure[event.keyCode];
				//	document.getElementById("pres_curline").value = virtual_pressure[event.keyCode]
				//}
				document.getElementById("presval").textContent = document.getElementById("pres_curline").value;
			}
			*/
			//document.getElementById("log3").innerHTML = "key=" + event.keyCode + " - pressure=" + virtual_pressure[event.keyCode] + event.ctrlKey;
		}, false);
		document.addEventListener("keyup", function(event) {
			//手動筆圧を既定の50に戻す
			Draw.keyLikePres = 50;
			document.getElementById("pres_curline").value = 50;
			Draw.pressedKey = 0;
		}, false);
		//if ((navigator.userAgent.indexOf("Chrome") > -1)) {
		if (checkBrowser().indexOf("chrome") != -1) {
			$("#area_projdir").css("visibility","visible");
		}

		//---メインのオブジェクト類の設定開始
		Draw.parseURL();
		setupLocale(Draw.urlparams)
		.then(function(flag){
			var def = $.Deferred();
			Draw.setupLocale();
			def.resolve(true);
			return def;
		})
		.then(function(flag){
			var def = $.Deferred();
			AppStorage.initialize(function(){
				//document.getElementById("canvas_width").max = Math.floor((window.innerWidth-100) / 100) * 100;
				document.getElementById("lab_canwidth").value = document.getElementById("canvas_width").value;
				//document.getElementById("canvas_height").max = Math.floor((window.innerHeight) / 100) * 100;
				document.getElementById("lab_canheight").value = document.getElementById("canvas_height").value;
				document.getElementById("lab_canwidth").max = document.getElementById("canvas_width").max;
				document.getElementById("lab_canheight").max = document.getElementById("canvas_height").max;
				/*document.getElementById("chk_limit_canvas").addEventListener("change", function(event) {
					if (event.target.checked) {
						document.getElementById("canvas_width").max = Math.floor((window.innerWidth-100) / 100) * 100;
						document.getElementById("canvas_height").max = Math.floor((window.innerHeight) / 100) * 100;
					}else{
						document.getElementById("canvas_width").max = 2160;
						document.getElementById("canvas_height").max = 1440;
					}
					document.getElementById("lab_canwidth").max = document.getElementById("canvas_width").max;
					document.getElementById("lab_canheight").max = document.getElementById("canvas_height").max;
				},false);*/
				document.getElementById("canvas_width").addEventListener("change", function(event) {
					document.getElementById("lab_canwidth").value = event.target.value;
				},false);
				document.getElementById("canvas_height").addEventListener("change", function(event) {
					document.getElementById("lab_canheight").value = event.target.value;
				},false);
				document.getElementById("lab_canwidth").addEventListener("change", function(event) {
					var a = parseInt(event.target.value);
					if (isNaN(a)) {
						a = document.getElementById("canvas_width").value;
						event.target.value = a;
					}
					if (a > event.target.max) {
						a = event.target.max;
						event.target.value = a;
					}
					if (a < event.target.min) {
						a = event.target.min;
						event.target.value = a;
					}
					document.getElementById("canvas_width").value = event.target.value;
				},false);
				document.getElementById("lab_canheight").addEventListener("change", function(event) {
					var a = parseInt(event.target.value);
					if (isNaN(a)) {
						a = document.getElementById("canvas_height").value;
						event.target.value = a;
					}
					if (a > event.target.max) {
						a = event.target.max;
						event.target.value = a;
					}
					if (a < event.target.min) {
						a = event.target.min;
						event.target.value = a;
					}
					document.getElementById("canvas_height").value = event.target.value;
				},false);
				Draw.initialize();
				ColorPalette.initialize();
				$("#pickerpanel,#pickerpanel2").hide();
				$("#colorpicker").on("click", function(event) {
					$("#pickerpanel").show();
				});
				//---プログレスパネルの準備
				document.getElementById("progresspanel").style.left = (Math.floor((window.innerWidth-300) / 100) * 50) + "px";
				document.getElementById("progresspanel").style.top = (Math.floor((window.innerHeight-50) / 100) * 50) + "px";
				//---キャンバス外からタッチしたまま入ったときのための描画制御
				var touchstart = 'touchstart';
				var touchmove = 'touchmove';
				var touchend = 'touchend';
				var touchenter = 'touchenter';
				var touchleave = 'touchleave';
				if (window.PointerEvent){
					touchstart = "pointerdown";
					touchmove = 'pointermove';
					touchend = "pointerup";
					touchenter = 'pointerenter';
					touchleave = 'pointerleave';
				}else if (window.navigator.msPointerEnabled) { // for Windows8 + IE10
					touchstart = 'MSPointerDown';
					touchmove = 'MSPointerMove';
					touchend = 'MSPointerUp';
					touchenter = 'MSPointerEnter';
					touchleave = 'MSPointerLeave';
				}
				function operate_move(event) {
					if (PalmRest.touching) {
						PalmRest.move(event);
					}
				}
				function operate_endleave(event){
					if ("focusing" in Draw) {
						if (!Draw.focusing) {
							Draw.drawing = false;
						}
					}
				}
				//---PointerEvent向け
				document.body.addEventListener(touchstart, function(event) {}, false);
				document.body.addEventListener(touchmove,function(event){}, false);
				document.body.addEventListener(touchend, operate_endleave, false);
				document.body.addEventListener(touchenter,function(event){
					if (Draw.touchpoints["1"] != undefined) {
						Draw.drawing = false;
					}
				}, false);
				document.body.addEventListener(touchleave, operate_endleave, false);
				//カラーピッカーでPointerEvent向け
				$("#colorpicker").on(touchstart, function(event) {
					$("#pickerpanel").show();
				});
				$("#pickerpanel").on(touchleave, function(event) {
					$("#pickerpanel").hide();
			    	event.preventDefault();
				});
				$("#pickerpanel2").on(touchleave, function(event) {
					$("#pickerpanel2").hide();
			    	event.preventDefault();
				});
				
				touchstart = 'mousedown';
				touchmove = 'mousemove';
				touchend = 'mouseup';
				touchleave = 'mouseleave';
				//---マウスイベント向け
				document.body.addEventListener(touchstart, function(event) {}, false);
				document.body.addEventListener(touchmove, function(event) {}, false);
				document.body.addEventListener(touchend, operate_endleave, false);
				document.body.addEventListener(touchleave, operate_endleave, false);
				$("#colorpicker").on(touchstart, function(event) {
					$("#pickerpanel").show();
				});
				$("#pickerpanel").on(touchleave, function(event) {
					$("#pickerpanel").hide();
			    	event.preventDefault();
				});
				$("#pickerpanel2").on(touchleave, function(event) {
					$("#pickerpanel2").hide();
			    	event.preventDefault();
				});
				
				//---その他グローバルなイベント
				window.addEventListener("resize",function(event){
					console.log("width=" + event.target.innerWidth);
					console.log("height=" + event.target.innerHeight);
					document.getElementById("canvas_width").max = Math.floor((window.innerWidth-100) / 100) * 100;
					document.getElementById("lab_canwidth").innerHTML = document.getElementById("canvas_width").value;
					document.getElementById("canvas_height").max = Math.floor((window.innerHeight) / 100) * 100;
					document.getElementById("lab_canheight").innerHTML = document.getElementById("canvas_height").value;
					Draw.resizeCanvasMargin(event.target.innerWidth,event.target.innerHeight);
				}, false);
				def.resolve(true);
			});
			return def;
		})
		.then(function(flag){
			var def = $.Deferred();
			//システムブラシ読み込み
			var sysbru_pen = ["colorchangepen",
							"simplepen","pencil","fudepen","calligraphy","neonpen","testplugin",
							"airbrush","oilpaint","oilpaintv","waterpaint","directpaint","testplugin3","sketchpen","blurpen"];//,"testplugin2","testplugin3"
			for (var i = 0; i < sysbru_pen.length; i++) {
				var sc = document.createElement("script");
				sc.src = "js/brush/" + sysbru_pen[i] + ".js";
				document.body.appendChild(sc);
				def.resolve(true);
			}
			return def;
		});
		console.log(window.innerWidth + "/" + window.innerHeight);
	},false);
})();

