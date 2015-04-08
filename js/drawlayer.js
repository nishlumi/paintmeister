/*
	レイヤーのz-index一覧
	canvas:ダミー = 0
	opecan:操作用 = 5
	0(base) = 10
	1(layer1) = 20
	2 = 30
	...
	15 = 150
	opeselcan:操作・選択用 = 6
*/
function configEvent(canvas,touch) {
	canvas.addEventListener(touch.start, function(event) {
		Draw.touchStart(event); // start drawing.
	}, false);
	
	canvas.addEventListener(touch.move, function(event) {
		Draw.touchMove(event); // continue drawing while dragging the pointer.
		event.preventDefault();
	}, false);
	
	canvas.addEventListener(touch.end, function(event) {
		Draw.touchEnd(event); // finish drawing.
	}, false);
	canvas.addEventListener(touch.leave, function(event) {
		Draw.touchLeave(event); // finish drawing.
	}, false);
	canvas.addEventListener(touch.enter, function(event) {
		Draw.touchEnter(event); // finish drawing.
	}, false);
	var mc = new Hammer.Manager(canvas);
	var pinch = new Hammer.Pinch();
	var rotate = new Hammer.Rotate();
	pinch.recognizeWith(rotate);
	mc.add([pinch, rotate]);
	mc.on("pinch rotate", Draw.hammer_touches);
}

var DrawLayer = function(parentobj,size,is_main,removable){
	var own = this;
	this.name = "lay";
	this.ctrlname = "lay_btn";
	this.title = "";
	this.originID = 0;
	
	this.canvassize = {"w":0, "h":0};
	this.canvas = null;
	this.control = null;
	this.parent = null;
	
	this.ismain = false;
	this.isremovable = true;
	this.islocking = false;
	this.btntouching = false;
	this.startX = 0;
	this.startY = 0;
	this.offset = 0;
	this.mode = "";
	this.selected = false;
	this.isvisible = true;
	this.Alpha = 100;
	this.CompositeOperation = "source-over";
	this.prev_image = null;
	this.cliparea = null;
	this.showcliparea = false;
	
	this.select = function(oldcontext){
		var ls = own.parent.layer;
		console.log(ls);
		for (var i = 0; i < ls.length; i++) {
			if (ls[i].selected) {
				ls[i].deselect()
				break;
			}
		}
		if (this.isvisible) {
			own.control.className = "layer_button_selected layer_button_show";
			document.getElementById("lab_layinfo_toggle").className = "layer_viewbtn_visible";
		}else{
			own.control.className = "layer_button_selected layer_button_hidden";
			document.getElementById("lab_layinfo_toggle").className = "layer_viewbtn_invisible";
		}
		own.selected = true;
		var newcontext = own.canvas.getContext("2d");
		//---選択前のキャンバスのコンテキストをコピー
		if (oldcontext) {
			newcontext.globalAlpha = oldcontext.globalAlpha;
			newcontext.globalCompositeOperation = oldcontext.globalCompositeOperation;
			newcontext.strokeStyle = oldcontext.strokeStyle;
			newcontext.lineWidth = oldcontext.lineWidth;
			newcontext.shadowColor = oldcontext.shadowColor;
			newcontext.shadowOffsetX = oldcontext.shadowOffsetX;
			newcontext.shadowOffsetY = oldcontext.shadowOffsetY;
			newcontext.shadowBlur = oldcontext.shadowBlur;
			newcontext.shadowBlur = oldcontext.shadowBlur;
			newcontext.lineCap = oldcontext.lineCap;
			newcontext.lineJoin = oldcontext.lineJoin;
		}
		own.parent.context = newcontext;
		//---念のためクリップボードのサブパスを再セット
		own.parent.select_clipboard.setToContext();
		own.parent.currentLayer = own;
		//own.parent.configOperationCanvas(own.canvas);
		//---opeselcontext のz-indexを現在のレイヤーの-1に変更する（表示中・非表示に関係なく）
		if (own.parent.opeselcan) own.parent.opeselcan.style.zIndex = parseInt(own.canvas.style.zIndex) + 1;
		
		document.getElementById("layinfo_opacity").value = own.Alpha;
		document.getElementById("layinfo_toggle").checked = own.isvisible;
		document.getElementById("info_layer").textContent = own.title;
		document.getElementById("layinfo_name").value = own.title;
		document.getElementById("prev_img").src = own.canvas.toDataURL();
		document.getElementById("layinfo_lock").checked = own.islocking; //!own.isremovable;
		if (own.islocking) {
			document.getElementById("lab_layinfo_lock").className = "layer_lockbtn_lock";
		}else{
			document.getElementById("lab_layinfo_lock").className = "layer_lockbtn_unlock";
		}
		if (own.showcliparea) own.SetClip(false,null);
		if (own.cliparea) {
			document.getElementById("layinfo_clip").checked = own.showcliparea;
			document.getElementById("layinfo_clip").disabled = "";
			document.getElementById("layinfo_clearclip").disabled = "";
		}else{
			document.getElementById("layinfo_clip").checked = false;
			document.getElementById("layinfo_clip").disabled = "disabled";
			document.getElementById("layinfo_clearclip").disabled = "disabled";
		}
	}
	this.deselect = function (){
		own.parent.context.beginPath();
		own.parent.context = null;
		if (own.isvisible) {
			own.control.className = "layer_button layer_button_show";
		}else{
			own.control.className = "layer_button layer_button_hidden";
		}
		own.selected = false;
		//own.ClearClip(false);
	}
	this.show = function (){
		var flag = true;
		if (this.show.arguments.length > 0) {
			flag = this.show.arguments[0];
		}
		own.isvisible = flag;
		own.canvas.style.visibility = (flag ? "visible" : "hidden");
		var cname = "";
		if (flag){
			cname = "layer_button_show";
			document.getElementById("lab_layinfo_toggle").className = "layer_viewbtn_visible";
		}else{
			cname = "layer_button_hidden";
			document.getElementById("lab_layinfo_toggle").className = "layer_viewbtn_invisible";
		}
		own.control.className = (own.selected ? "layer_button_selected "+cname : "layer_button "+cname);
	}
	this.toggleShow = function(){
		own.show(!own.isvisible);
	}
	this.opacity = function (value){
		own.Alpha = value;
		own.canvas.style.opacity = value / 100;
	}
	this.zMove = function(oldpos,newpos) {
		own.canvas.style.zIndex = 10 + newpos;
	}
	this.SetLock = function (flag) {
		//own.isremovable = !flag;
		own.islocking = flag;
		if (flag) {
			document.getElementById("lab_layinfo_lock").className = "layer_lockbtn_lock";
		}else{
			document.getElementById("lab_layinfo_lock").className = "layer_lockbtn_unlock";
		}
	}
	this.Locking = function () {
		//return !own.isremovable;
		return own.islocking;
	}
	this.SetClip = function(isclip,selector) {
		/*
			isclip - true=クリップする、 false=枠線のみ
			selector = 選択オブジェクト
		*/
		own.showcliparea = true;
		if (isclip) {
			//---実際のクリップ処理
			if (selector) { //Selectorオブジェクトが渡されたらそれで更新する
				own.cliparea = null;
				own.cliparea = selector;
			}
			if (!own.cliparea) return;
			var context = own.canvas.getContext("2d");
			context.beginPath();
			if (own.cliparea.selectType == selectionType.box) {
				context.rect(own.cliparea.x,own.cliparea.y, own.cliparea.w,own.cliparea.h);
			}else if (own.cliparea.selectType == selectionType.free) {
				context.moveTo(own.cliparea.points[0].x, own.cliparea.points[0].y);
				for (var i = 1; i < own.cliparea.points.length; i++) {
					context.lineTo(own.cliparea.points[i].x, own.cliparea.points[i].y);
				}
				//context.lineTo(selector.points[0].x, selector.points[0].y);
				context.closePath();
			}
			context.clip();
		}
		//---枠線のみの処理
		if (!own.parent.opeselcontext) return;
		if (!own.cliparea) return;
		own.parent.opeselcontext.clearRect(0,0, own.canvassize.w,own.canvassize.h);
		own.parent.opeselcontext.beginPath();
		if (own.cliparea.selectType == selectionType.box) {
			own.parent.opeselcontext.rect(own.cliparea.x,own.cliparea.y, own.cliparea.w,own.cliparea.h);
			own.parent.opeselcontext.stroke();
		}else if (own.cliparea.selectType == selectionType.free) {
			own.parent.opeselcontext.moveTo(own.cliparea.points[0].x, own.cliparea.points[0].y);
			for (var i = 1; i < own.cliparea.points.length; i++) {
				own.parent.opeselcontext.lineTo(own.cliparea.points[i].x, own.cliparea.points[i].y);
			}
			own.parent.opeselcontext.closePath();
			own.parent.opeselcontext.stroke();
		}
	}
	this.GetClip = function() {
		return own.cliparea;
	}
	this.ClearClip = function(isforce) {
		if (isforce) {
			own.cliparea = null;
			own.showcliparea  = false;
		}else{
			own.showcliparea  = false;
		}
		own.parent.opeselcontext.clearRect(0,0, own.canvassize.w,own.canvassize.h);
		var context = own.canvas.getContext("2d");
		context.restore();
		//context.rect(0,0, own.canvassize.w,own.canvassize.h);
		//context.clip();
	}
	this.generate_core = function (canvas,ctrl){
		//---キャンバスの核となる設定
		var touch = {
			start : "touchstart", move : "touchmove", end : "touchend",
			leave : "touchleave", enter : "touchenter"
		}
		/*var touchstart = 'touchstart';
		var touchmove = 'touchmove';
		var touchend = 'touchend';
		var touchleave = 'touchleave';
		var touchenter = 'touchenter';*/
		if (window.PointerEvent){
			touch.start = "pointerdown";
			touch.move = "pointermove";
			touch.end = "pointerup";
			touch.leave = 'pointerleave';
			touch.enter = 'pointerenter';
			console.log("browser:IE11 or Browser with PointerEvent");
		}else if (window.navigator.msPointerEnabled) { // for Windows8 + IE10
			touch.start = 'MSPointerDown';
			touch.move = 'MSPointerMove';
			touch.end = 'MSPointerUp';
			touch.leave = 'MSPointerLeave';
			touch.enter = 'MSPointerEnter';
			console.log("browser:Windows8 + IE10");
		} else if (document.ontouchstart === undefined) { // for other PC browsers
			//---toucheventあるはずなのでまずはセット
			//configEvent(touch);
			//---次に最低限のmouseeventをセット開始
			touch.start = 'mousedown';
			touch.move = 'mousemove';
			touch.end = 'mouseup';
			touch.leave = 'mouseleave';
			touch.enter = 'mouseenter';
			console.log("browser:other PC browsers");
		}else{
			//---toucheventあるはずなのでまずはセット
			/*configEvent(touch);
			touch.start = 'mousedown';
			touch.move = 'mousemove';
			touch.end = 'mouseup';
			touch.leave = 'mouseleave';
			touch.enter = 'mouseenter';*/
			console.log("browser:other PC browsers with touch");
		}
		/*if (navigator.userAgent.indexOf("Firefox") > -1) {
			//configEvent(canvas,touch);
		}else{*/
			touch.start = "pointerdown";
			touch.move = "pointermove";
			touch.end = "pointerup";
			touch.leave = 'pointerleave';
			touch.enter = 'pointerenter';
			//configEvent(canvas,touch);
		//}
		
		//---ボタンコントロールもイベント設定
		ctrl.addEventListener("click", function(event) {
			own.select(own.parent.context);
		}, false);

	};
	this.generateLayer = function (newname){
		var laylength = own.parent.layer.length;
		var reallastIndex = parseInt(own.parent.getLastAddedLayer()) + 1;
		/*if (laylength > 0) {
			var lastid = own.parent.layer[laylength-1].originID;
			own.originID  = lastid + 1;
		}else{
			own.originID = laylength;
		}*/
		var now = new Date();
		own.originID = now.getHours().toString() + now.getMinutes().toString() + now.getSeconds().toString() + now.getMilliseconds().toString();
		own.canvas = document.createElement("canvas");
		own.canvas.id = "lay" + own.originID;
		own.name = own.canvas.id;
		own.canvas.className = "main-canvas";
		own.canvas.width = own.canvassize.w;
		own.canvas.height = own.canvassize.h;
		own.canvas.style.zIndex = 10 * (laylength+1);
		document.getElementById("canvaspanel").appendChild(own.canvas);
		//own.title = "レイヤーNo." + own.canvas.style.zIndex;
		//own.title = "レイヤーNo." + reallastIndex;
		own.title = _T("generateLayer_defaultname") + reallastIndex;
		/*var winwid = window.innerWidth;
		var sa = winwid - own.canvassize.w;
		var say = window.innerHeight - own.canvassize.h;
		var space = Math.floor(sa / 2) - 30;
		var spacey = Math.floor(say / 2) - 30;
		own.parent.canvasspace = {"w" : space, "h" : spacey};
		ElementTransform(own.canvas,"translate("+space+"px," + spacey + "px)");*/
		
		if (own.ismain) {
			own.control = document.createElement("strong");
		}else{
			own.control = document.createElement("span");
		}
		own.control.id = "lay_btn" + own.originID;
		own.ctrlname = own.control.id;
		own.control.className = "layer_button layer_button_show";
		//own.control.title = "レイヤーNo." + own.canvas.style.zIndex;
		//own.control.title = "レイヤーNo." + reallastIndex;
		own.control.title = _T("generateLayer_defaultname") + reallastIndex;
		//own.control.innerHTML = own.canvas.style.zIndex;
		own.control.innerHTML = reallastIndex;
		
		document.getElementById("lay_btns").appendChild(own.control);
		own.generate_core(own.canvas,own.control);
		own.setup_other();
	};
	this.setup_other = function(){
		own.prev_image = own.canvas.getContext("2d").createImageData(own.canvassize.w,own.canvassize.h);
		own.parent.undohist.push(new UndoBuffer(UndoType.layadd,own.canvas,own.canvas.getContext("2d").getImageData(0,0,own.canvassize.w,own.canvassize.h)));
	};
	this.load = function(titlename,visible,opacity,datalength,data) {
		own.title = titlename;
		own.show(visible);
		own.opacity(opacity);
		var con = own.canvas.getContext("2d");
		var imgd = con.createImageData(this.canvassize.w,this.canvassize.h); //getImageData(0,0,this.canvassize.w,this.canvassize.h);
		var imgdcnt = 0;
		console.log("data length="+data.length);
		console.log("layer data="+imgd.data.length);
		console.log(data[0] + " - " + data[0].indexOf("0#"));
		for (var i = 0; i < data.length; i++) {
			if (data[i].indexOf("0#") > -1) {
				var zerocnt = parseInt(data[i].replace("0#",""));
				if (i == 0) console.log("zerocnt="+zerocnt);
				//---圧縮した0を復元
				for (var j = 0; j < zerocnt; j++) {
					imgd.data[imgdcnt] = 0;
					imgdcnt++;
				}
			}else{
				imgd.data[imgdcnt] = parseInt(data[i],16);
				imgdcnt++;
			}
			
		}
		console.log("imgdcnt="+imgdcnt);
		con.putImageData(imgd,0,0);
	};
	this.destroy = function (){
		var flag;
		if (own.isremovable) {
			if (own.ismain) {
				flag = false;
			}else{
				if (own.islocking) {
					flag = false;
				}else{
					document.getElementById("canvaspanel").removeChild(document.getElementById(own.canvas.id));
					//own.control.remove();
					document.getElementById("lay_btns").removeChild(document.getElementById(own.control.id));
					delete own.canvas;
					delete own.control;
					flag = true;
				}
			}
		}else{
			flag = false;
		}
		return flag;
	};
	this.initialize = function (parentobj,size,is_main,removable){
		own.parent = parentobj;
		own.canvassize = size;
		own.ismain = is_main;
		own.isremovable = removable;
		//if (is_main == true) own.isremovable = false;
		
		own.generateLayer();
		
	}
	this.initialize(parentobj,size,is_main,removable);
};
