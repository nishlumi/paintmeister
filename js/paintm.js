var onKeyope = true;
function alert(message){
	$.messager.alert("PaintMeister",message,"warning");
}
function confirm(message,callback,callthen) {
	$.messager.confirm("PaintMeister",message,function(ret){
		if (ret){
			if (!callback()) {
				if (callthen) callthen();
			}
		}
	});
}
function prompt(message,callthen){
	onKeyope = false;
	$.messager.prompt("PaintMeister",message,function(ret){
		//if (ret) {
			if (callthen) callthen(ret);
			onKeyope = true;
		//}
	});
}
function saveImage() {
	if ((navigator.userAgent.indexOf("Chrome") > -1) && (chrome.fileSystem)) {
		//---for ChromeApps
		var blob = dataURItoBlob(Draw.canvas.toDataURL("image/png"));

		var config = {type: 'saveFile', suggestedName: "New Image.png"};
		chrome.fileSystem.chooseEntry(config, function(writableEntry) {
			console.log("writableEntry=");
			console.log(writableEntry);
			writeFileEntry(writableEntry, blob, function(e) {
				$.jGrowl("キャンバスの画像を保存しました");
			});
		});
	}else{
		//---for Web app
		var w = window.open("","_blank");
		w.document.open();
		w.document.write("<img src='" + Draw.canvas.toDataURL("image/png") + "'>");
		w.document.close();
	}
}
function loadProjectFile(files){
	var reader = new FileReader();
	if (files.length == 0) {
		alert("ファイルが指定されていません！");
		return false;
	}
	if (files[0].name.indexOf(".pmpf") == -1) {
		alert("有効なPaintMeisterプロジェクトファイルではありません！");
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
				document.getElementById("basepanel").style.display = "block";
				document.getElementById("openedProjName").innerText = " - " + files[0].name;
				Draw.progresspanel.style.display = "none";
				document.getElementById("progressicon").className = "";
			}else{
				alert("有効なPaintMeisterプロジェクトファイルではありません！");
			}
		}
		reader.onerror = function(e){
			alert("有効なPaintMeisterプロジェクトファイルではありません！");
		}
		reader.readAsText(files[0]);
		return true;
	}
}
function saveProject(data){
	if ((navigator.userAgent.indexOf("Chrome") > -1) && (chrome.fileSystem)) {
		var config = {type: 'saveFile', suggestedName: "New Project.pmpf",
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
				$.jGrowl("プロジェクトファイルに保存しました");
				document.getElementById("openedProjName").innerText = " - " + writableEntry.name;
				Draw.progresspanel.style.display = "none";
				document.getElementById("progressicon").className = "";
			}else{
				Draw.progresspanel.style.display = "none";
				document.getElementById("progressicon").className = "";
			}
		});
	}else{
		prompt("ファイル名を入力してください。(拡張子は不要です）",function(fl){
			if (fl) {
				var bb = new Blob([data],{type:"text/plain",encodings:"native"});
				if (navigator.userAgent.indexOf("Trident") > -1){
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
		});
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
					callback();
				}
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
	window.addEventListener("load",function(){
		//---ここからストアアプリも共通
		document.addEventListener("keydown", function(event) {
			if (!onKeyope) return false;
			//console.log(event.keyCode);
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
			}else if (event.keyCode == "89" && event.ctrlKey) { //Ctrl + Z
				if (document.getElementById("initialsetup").style.display == "none") {
					Draw.redobtn.click();
					return;
				}
			}else if (event.keyCode == "83" && event.ctrlKey) { //Ctrl + S
				if (document.getElementById("initialsetup").style.display == "none") {
					Draw.checkstat.click();
					return;
				}
			}else if (event.keyCode == "48" && event.altKey) { // 0 + ctrl
				document.getElementById("canvaspanel").style.transform = "scale(1.0)";
				document.getElementById("info_magni").innerText = "1.0";
				Draw.canvassize[0] = Draw.defaults.canvas.size[0];
				Draw.canvassize[1] = Draw.defaults.canvas.size[0];
				Draw.resizeCanvasMargin(window.innerWidth,window.innerHeight);
				Draw.init_scale = 1.0;
			}else if (event.keyCode == "38") { // Up key
				Draw.scaleUp();
			}else if (event.keyCode == "40") { // Down key
				Draw.scaleDown();
			}
			var relkey = ["81","87"];
			//---手動筆圧イベント
			if (document.getElementById("chk_enable_handpres").className == "switchbutton_on") {
				if ((event.keyCode == "81") || (event.keyCode == "87")) {
					Draw.keyLikePres += virtual_pressure[event.keyCode];
					document.getElementById("pres_curline").value = 
						parseInt(document.getElementById("pres_curline").value) + virtual_pressure[event.keyCode];
				}else{
					Draw.keyLikePres = virtual_pressure[event.keyCode];
					document.getElementById("pres_curline").value = virtual_pressure[event.keyCode]
				}
				document.getElementById("presval").textContent = document.getElementById("pres_curline").value;
				Draw.pressedKey = event.keyCode;
			}
			document.getElementById("log3").innerHTML = "key=" + event.keyCode + " - pressure=" + virtual_pressure[event.keyCode] + event.ctrlKey;
		}, false);
		document.addEventListener("keyup", function(event) {
			Draw.keyLikePres = null;
			Draw.pressedKey = 0;
		}, false);
		AppStorage.initialize(function(){
			Draw.initialize();
			ColorPalette.initialize();
			$("#pickerpanel").hide();
			$("#colorpicker").on("click", function(event) {
				$("#pickerpanel").show();
			});
			document.getElementById("canvas_width").max = Math.floor((window.innerWidth-100) / 100) * 100;
			document.getElementById("lab_canwidth").innerHTML = document.getElementById("canvas_width").value;
			document.getElementById("canvas_height").max = Math.floor((window.innerHeight) / 100) * 100;
			document.getElementById("lab_canheight").innerHTML = document.getElementById("canvas_height").value;
			document.getElementById("chk_limit_canvas").addEventListener("change", function(event) {
				if (event.target.checked) {
					document.getElementById("canvas_width").max = Math.floor((window.innerWidth-100) / 100) * 100;
					document.getElementById("canvas_height").max = Math.floor((window.innerHeight) / 100) * 100;
				}else{
					document.getElementById("canvas_width").max = 2160;
					document.getElementById("canvas_height").max = 1440;
				}
			},false);
			//---プログレスパネルの準備
			document.getElementById("progresspanel").style.left = (Math.floor((window.innerWidth-300) / 100) * 50) + "px";
			document.getElementById("progresspanel").style.top = (Math.floor((window.innerHeight-50) / 100) * 50) + "px";
			//---キャンバス外からタッチしたまま入ったときのための描画制御
			var touchstart = 'touchstart';
			var touchend = 'touchend';
			var touchleave = 'touchleave';
			if (window.PointerEvent){
				touchstart = "pointerdown";
				touchend = "pointerup";
				touchleave = 'pointerleave';
			}else if (window.navigator.msPointerEnabled) { // for Windows8 + IE10
				touchstart = 'MSPointerDown';
				touchend = 'MSPointerUp';
				touchleave = 'MSPointerLeave';
			}
			document.body.addEventListener(touchstart, function(event) {
				//Draw.drawing = true;

			}, false);
			document.body.addEventListener(touchend, function(event) {
				if (!Draw.focusing)
					Draw.drawing = false;
			}, false);
			$("#colorpicker").on(touchstart, function(event) {
				$("#pickerpanel").show();
			});
			$("#pickerpanel").on(touchleave, function(event) {
				$("#pickerpanel").hide();
		    	event.preventDefault();
			});
			
			touchstart = 'mousedown';
			touchend = 'mouseup';
			touchleave = 'mouseleave';
			document.body.oncontextmenu = function(event) {
				return false;
			}
			document.body.addEventListener(touchstart, function(event) {
				//Draw.drawing = true;
			}, false);
			document.body.addEventListener(touchend, function(event) {
				console.log("document.body touchend");
				if (!Draw.focusing)
					Draw.drawing = false;
			}, false);
			window.addEventListener("resize",function(event){
				console.log("width=" + event.target.innerWidth);
				console.log("height=" + event.target.innerHeight);
				Draw.resizeCanvasMargin(event.target.innerWidth,event.target.innerHeight);
			}, false);
			$("#colorpicker").on(touchstart, function(event) {
				$("#pickerpanel").show();
			});
			$("#pickerpanel").on(touchleave, function(event) {
				$("#pickerpanel").hide();
		    	event.preventDefault();
			});
		});
		console.log(window.innerWidth + "/" + window.innerHeight);
	},false);
})();
