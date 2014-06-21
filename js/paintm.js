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
	if (chrome && chrome.fileSystem) {
		//---for ChromeApps
		//---function start
		var c = Draw.canvas.getContext("2d");
		c.clearRect(0, 0, Draw.canvassize[0], Draw.canvassize[1]);
		c.fillStyle = "#0000FF";
		c.fillRect(0, 0, Draw.canvassize[0], Draw.canvassize[1]);
		for (var obj in Draw.layer) {
			c.globalAlpha = Draw.layer[obj].canvas.getContext("2d").globalAlpha;
			c.globalCompositeOperation = Draw.layer[obj].canvas.getContext("2d").globalCompositeOperation;
			c.drawImage(Draw.layer[obj].canvas, 0, 0);
		}

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
	element.style.transform = value;
	element.style.msTransform = value;
	element.style.webkitTransform = value;
	element.style.mozTransform = value;
}
//#################################################################################
//#################################################################################
(function(){
	window.addEventListener("load",function(){
		document.addEventListener("keydown", function(event) {
			//console.log(event.keyCode);
			if (event.keyCode == "32"){ //SPACE
				if (document.getElementById("initialsetup").style.display == "none") {
					document.getElementById("btn_menu").click();
					return;
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
			}
			var relkey = ["81","87"];
			//---手動筆圧イベント
			if (document.getElementById("chk_enable_handpres").checked) {
				if ((event.keyCode == "81") || (event.keyCode == "87")) {
					Draw.keyLikePres += virtual_pressure[event.keyCode];
					document.getElementById("pres_curline").value = 
						parseInt(document.getElementById("pres_curline").value) + virtual_pressure[event.keyCode];
				}else{
					Draw.keyLikePres = virtual_pressure[event.keyCode];
					document.getElementById("pres_curline").value = virtual_pressure[event.keyCode]
				}
				document.getElementById("presval").innerHTML = document.getElementById("pres_curline").value;
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
		document.getElementById("btn_menu").addEventListener("click", function(event) {
			if (event.target.innerHTML.charCodeAt() == "9660") { //開く
				document.getElementById("menupanel").style.display = "block";
				event.target.innerHTML = "&#9650;";
				event.target.style.backgroundColor = "#91d780";
			}else{ //閉じる
				document.getElementById("menupanel").style.display = "none";
				event.target.innerHTML = "&#9660;";
				event.target.style.backgroundColor = "#c4fab3";
			}
		}, false);
		document.getElementById("canvas_width").max = Math.floor((window.innerWidth-50) / 100) * 100;
		document.getElementById("lab_canwidth").innerHTML = document.getElementById("canvas_width").value;
		document.getElementById("canvas_height").max = Math.floor((window.innerHeight-70) / 100) * 100;
		document.getElementById("lab_canheight").innerHTML = document.getElementById("canvas_height").value;
		//---キャンバス外からタッチしたまま入ったときのための描画制御
		var touchstart = 'touchstart';
		var touchend = 'touchend';
		if (window.PointerEvent){
			touchstart = "pointerdown";
			touchend = "pointerup";
		}else if (window.navigator.msPointerEnabled) { // for Windows8 + IE10
			touchstart = 'MSPointerDown';
			touchend = 'MSPointerUp';
		}
		document.body.addEventListener(touchstart, function(event) {
			Draw.drawing = true;
		}, false);
		document.body.addEventListener(touchend, function(event) {
			Draw.drawing = false;
		}, false);
		touchstart = 'mousedown';
		touchend = 'mouseup';
		document.body.addEventListener(touchstart, function(event) {
			Draw.drawing = true;
		}, false);
		document.body.addEventListener(touchend, function(event) {
			Draw.drawing = false;
		}, false);
		
		console.log(window.innerWidth + "/" + window.innerHeight);
	},false);
})();
