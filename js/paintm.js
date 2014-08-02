function alert(message){
	$.messager.alert("PaintMeister",message,"warning");
}
function confirm(message,callback) {
	$.messager.confirm("PaintMeister",message,function(ret){
		if (ret){
			callback();
		}
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
function ElementTransform(element, value) {
	element.style.msTransform = value;
	element.style.webkitTransform = value;
	element.style.mozTransform = value;
	element.style.transform = value;
}
//#################################################################################
//#################################################################################
(function(){
	window.addEventListener("load",function(){
		document.addEventListener("keydown", function(event) {
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
		Draw.initialize();
		ColorPalette.initialize();
		$("#pickerpanel").hide();
		$("#colorpicker").on("click", function(event) {
			$("#pickerpanel").show();
		});
		document.getElementById("canvas_width").max = Math.floor((window.innerWidth-100) / 100) * 100;
		document.getElementById("lab_canwidth").innerHTML = document.getElementById("canvas_width").value;
		document.getElementById("canvas_height").max = Math.floor((window.innerHeight-100) / 100) * 95;
		document.getElementById("lab_canheight").innerHTML = document.getElementById("canvas_height").value;
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
		console.log(window.innerWidth + "/" + window.innerHeight);
	},false);
})();
