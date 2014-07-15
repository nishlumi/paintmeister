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
		this.btntouching = false;
		this.startX = 0;
		this.startY = 0;
		this.offset = 0;
		this.mode = "";
		this.selected = false;
		this.isvisible = true;
		this.Alpha = 100;
		this.CompositeOperation = "source-over";
		
		this.select = function(oldcontext){
			var ls = own.parent.layer;
			for (var i = 0; i < ls.length; i++) {
				if (ls[i].selected) {
					ls[i].deselect()
					break;
				}
			}
			if (this.isvisible) {
				own.control.className = "layer_button_selected layer_button_show";
			}else{
				own.control.className = "layer_button_selected layer_button_hidden";
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
			document.getElementById("layinfo_opacity").value = own.Alpha;
			document.getElementById("info_layer").textContent = "レイヤー No." + String(own.canvas.id).replace("lay","");
		}
		this.deselect = function (){
			own.parent.context = null;
			if (this.isvisible) {
				own.control.className = "layer_button layer_button_show";
			}else{
				own.control.className = "layer_button layer_button_hidden";
			}
			own.selected = false;
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
			}else{
				cname = "layer_button_hidden";
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
		this.generate_core = function (canvas,ctrl){
			//---キャンバスの核となる設定
			var touchstart = 'touchstart';
			var touchmove = 'touchmove';
			var touchend = 'touchend';
			var touchleave = 'touchleave';
			var touchenter = 'touchenter';
			if (window.PointerEvent){
				touchstart = "pointerdown";
				touchmove = "pointermove";
				touchend = "pointerup";
				touchleave = 'pointerleave';
				touchenter = 'pointerenter';
			}else if (window.navigator.msPointerEnabled) { // for Windows8 + IE10
				touchstart = 'MSPointerDown';
				touchmove = 'MSPointerMove';
				touchend = 'MSPointerUp';
				touchleave = 'MSPointerLeave';
				touchenter = 'MSPointerEnter';
			} else if (document.ontouchstart === undefined) { // for other PC browsers
				touchstart = 'mousedown';
				touchmove = 'mousemove';
				touchend = 'mouseup';
				touchleave = 'mouseleave';
				touchenter = 'mouseenter';
			}
			canvas.addEventListener(touchstart, function(event) {
				Draw.touchStart(event); // start drawing.
			}, false);
			
			canvas.addEventListener(touchmove, function(event) {
				Draw.touchMove(event); // continue drawing while dragging the pointer.
				event.preventDefault();
			}, false);
			
			canvas.addEventListener(touchend, function(event) {
				Draw.touchEnd(event); // finish drawing.
			}, false);
			canvas.addEventListener(touchleave, function(event) {
				Draw.touchLeave(event); // finish drawing.
			}, false);
			canvas.addEventListener(touchenter, function(event) {
				Draw.touchEnter(event); // finish drawing.
			}, false);
			
			//---ボタンコントロールもイベント設定
			ctrl.addEventListener("click", function(event) {
				own.select(own.parent.context);
			}, false);
			ctrl.addEventListener(touchstart,function(event){
				own.btntouching = true;
				if (event.offsetX === undefined) {
					if (event.type == 'touchstart') {
						own.startX = event.changedTouches[0].pageX - event.target.offsetLeft - own.offset; // for Android
					} else {
						own.startX = event.pageX - event.target.offsetLeft - own.offset;
					}
				} else {
					own.startX = event.offsetX - own.offset;
				}
				
				if (event.offsetY === undefined) {
					if (event.type == 'touchstart') {
						own.startY = event.changedTouches[0].pageY - event.target.offsetTop - own.offset; // for Android
					} else {
						own.startY = event.pageY - event.target.offsetTop - own.offset;
					}
				} else {
					own.startY = event.offsetY - own.offset;
				}
				var pos  = calculatePosition("touchstart",event,event.target,{
					"offset" : own.offset,
					"canvasspace":0
				});
				own.startX = pos.x;
				own.startY = pos.y;
				//document.getElementById("log").innerHTML = event.target.id;
			},false);
			ctrl.addEventListener(touchmove,function(event){
				if (own.btntouching) {
					var offsetX = 0;
					var offsetY = 0;
					if (event.offsetX === undefined) {
						if (event.type == 'touchmove') {
							offsetX = event.changedTouches[0].pageX - event.target.offsetLeft - own.offset; // for Android
						} else {
							offsetX = event.pageX - event.target.offsetLeft - own.offset;
						}
					} else {
						offsetX = event.offsetX - own.offset;
					}
					
					if (event.offsetY === undefined) {
						if (event.type == 'touchmove') {
							offsetY = event.changedTouches[0].pageY - event.target.offsetTop - own.offset; // for Android
						} else {
							offsetY = event.pageY - event.target.offsetTop - own.offset;
						}
					} else {
						offsetY = event.offsetY - own.offset;
					}
					var pos  = calculatePosition("touchstart",event,event.target,{
						"offset" : own.offset,
						"canvasspace":0
					});
					offsetX = pos.x;
					offsetY = pos.y;
					var saY = own.startY - offsetY;
					var saX = own.startX - offsetX;
					//移動量が多い向きが今回の動作モードとする
					var whichMode = Math.abs(saX) - Math.abs(saY) > 0 ? "rl" : "tb";
					if (whichMode == "tb") {
						if (saY > 0) { //↑
							own.mode = "";
						}else{ //↓
							own.mode = "v"; //表示・非表示切り替え
						}
					}else if (whichMode == "rl") {
						if (saX > 0) { //←
							own.mode = "l"; //layer 優先度ダウン
						}else{//→
							own.mode = "h"; //layer 優先度アップ
						}
					}
					//document.getElementById("log").innerHTML = this.mode;
					own.startX = offsetX;
					own.startY = offsetY;
				}
			},false);
			ctrl.addEventListener(touchend,function(event){
				own.btntouching = false;
				console.log(own.mode);
				/*if (own.mode == "v"){ //表示・非表示切り替え
					own.toggleShow();
				}else if (own.mode == "h"){ //優先度アップ
				}else if (own.mode == "l") { //優先度ダウン
					
				}*/
			},false);
			ctrl.addEventListener(touchleave,function(event){
				if (own.btntouching) {
					console.log(own.mode);
					if (own.mode == "v"){ //表示・非表示切り替え
						own.toggleShow();
					}else if (own.mode == "h"){ //優先度アップ
					}else if (own.mode == "l") { //優先度ダウン
						
					}
				}
				own.btntouching = false;
			},false);

			//return canvas;
		};
		this.generateLayer = function (newname){
			var laylength = own.parent.layer.length;
			if (laylength > 0) {
				var lastid = own.parent.layer[laylength-1].originID;
				own.originID  = lastid + 1;
			}else{
				own.originID = laylength;
			}
			own.canvas = document.createElement("canvas");
			own.canvas.id = "lay" + own.originID;
			own.name = own.canvas.id;
			own.canvas.className = "main-canvas";
			own.canvas.width = own.canvassize.w;
			own.canvas.height = own.canvassize.h;
			own.canvas.style.zIndex = laylength+1;
			document.getElementById("canvaspanel").appendChild(own.canvas);
			/*var winwid = window.innerWidth;
			var sa = winwid - own.canvassize.w;
			var say = window.innerHeight - own.canvassize.h;
			var space = Math.floor(sa / 2) - 30;
			var spacey = Math.floor(say / 2) - 30;
			own.parent.canvasspace = {"w" : space, "h" : spacey};
			ElementTransform(own.canvas,"translate("+space+"px," + spacey + "px)");*/
			
			own.control = document.createElement("button");
			own.control.id = "lay_btn" + own.originID;
			own.ctrlname = own.control.id;
			own.control.className = "layer_button layer_button_show";
			own.control.title = "レイヤーNo." + own.originID;
			own.control.innerHTML = own.originID;
			
			document.getElementById("lay_btns").appendChild(own.control);
			own.generate_core(own.canvas,own.control);
			
		};
		this.destroy = function (){
			var flag;
			if (own.isremovable) {
				if (own.ismain) {
					flag = false;
				}else{
					console.log(own.canvas.id);
					console.log(own.control.id);
					//own.canvas.remove();
					document.getElementById("canvaspanel").removeChild(document.getElementById(own.canvas.id));
					//own.control.remove();
					document.getElementById("lay_btns").removeChild(document.getElementById(own.control.id));
					delete own.canvas;
					delete own.control;
					flag = true;
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
			if (is_main == true) own.isremovable = false;
			
			own.generateLayer();
			
		}
		this.initialize(parentobj,size,is_main,removable);
};
