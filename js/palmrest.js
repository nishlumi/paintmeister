//#################################################################################
//  oelement - 元にする要素
//  dir - 方向("left", "right")
//#################################################################################
var PalmRest = function (oelement,dir) {
	var own = this;
	this.name = "palmrest";
	this.element = oelement;
	this.btn = null;
	this.touching = false;
	this.touchelement = null;
	this.isEnable = false;
	this.limit = {
		top : window.innerHeight * 0.1,
		left :  window.innerWidth * 0.8,
		right :  window.innerWidth * 0.2,
		bottom : window.innerHeight * 0.9
	};
	this.startX = 0;
	this.startY = 0;
	this.direction = "";
	this.defaults = {
		"width" : 0
	};
	this.enable = function (flag) {
		if (this.element) {
			var glstyle = this.element.className;
			if (flag) {
				glstyle = glstyle.replace("guard_off","guard_on");
			}else{
				glstyle = glstyle.replace("guard_on","guard_off");
			}
			this.element.className = glstyle;
			this.isEnable = flag;
		}
		/*if (this.relement) {
			var grstyle = this.relement.className;
			if (flag) {
				grstyle = grstyle.replace("guard_off","guard_on");
			}else{
				grstyle = grstyle.replace("guard_on","guard_off");
			}
			this.relement.className = grstyle;
			//this.enables.right = flag;
		}*/
	}
	this.setColor = function (color) {
		/*
			parameter:
				color - "red", "blue", "green", "yellow", "none"
		*/
		carr = ["red","blue", "green", "yellow", "none"];
		var ishit = false;
		for (var i = 0; i < carr.length; i++) {
			if (color == carr[i]) ishit = true;
		}
		if (!ishit) return false;
		
		if (this.element) {
			var glstyle = this.element.className;
			glstyle = glstyle.replace(" guard_color_none","%a");
			glstyle = glstyle.replace(" guard_color_red","%a");
			glstyle = glstyle.replace(" guard_color_blue","%a");
			glstyle = glstyle.replace(" guard_color_green","%a");
			glstyle = glstyle.replace(" guard_color_yellow","%a");
			glstyle = glstyle.replace("%a"," guard_color_"+color);
			this.element.className = glstyle;
		}
		/*if (this.relement) {
			var grstyle = this.relement.className;
			grstyle = grstyle.replace(" guard_color_none","%a");
			grstyle = grstyle.replace(" guard_color_red","%a");
			grstyle = grstyle.replace(" guard_color_blue","%a");
			grstyle = grstyle.replace(" guard_color_green","%a");
			grstyle = grstyle.replace(" guard_color_yellow","%a");
			grstyle = grstyle.replace("%a"," guard_color_"+color);
			this.relement.className = grstyle;
		}*/
	}
	this.move = function (event) {
		var offsetX = 0;
		var offsetY = 0;

		offsetX = event.clientX;
		offsetY = event.clientY;
		console.log(event);
		console.log("  x=" + event.clientX);
		console.log("  y=" + event.clientY);
		var mye = this.touchelement;
		var myewidth = (parseInt($("#"+mye.id).css("width"))*0.5);
		//---ボタンを動かした位置に合わせてパームレストの幅と高さを調整する
		if (mye.parentElement.id == own.element.id) {
			if (offsetY >= own.limit.top) {
				if (own.direction == "left") {
					if (offsetX+myewidth <= own.limit.left) {
						$("#"+mye.parentElement.id).css({
							"width" : (offsetX + myewidth) + "px",
							"height" : (window.innerHeight - offsetY+ myewidth) + "px"
						});
					}else{
						own.touching = false;
					}
				}else if (own.direction == "right") {
					if (offsetX-myewidth >= own.limit.right) {
						$("#"+mye.parentElement.id).css({
							"width" : (window.innerWidth - offsetX + myewidth) + "px",
							"height" : (window.innerHeight - offsetY+ myewidth) + "px"
						});
					}else{
						own.touching = false;
					}
				}
			}else{
				own.touching = false;
			}
		}
		this.startX = offsetX;
		this.startY = offsetY;
	}
	this.operate_move = function (event) {
		//---イベント内から呼び出されるため参照はグローバル扱いの変数から
		if (own.touching) {
			own.move(event);
		}
	}
	this._setupEvent = function (touch,elem) {
		elem.addEventListener("dblclick",function(event){
			//---デフォルトの大きさに戻す操作
			own.touching = false;
			var mye = event.target;
			if (mye.parentElement.id == own.element.id) {
				$("#"+mye.parentElement.id).css({
					"width" : "5%",
					"height": "calc(2.5rem + 6px)"
				});
				
			}else if (mye.parentElement.id == own.relement.id) {
				$("#"+mye.parentElement.id).css({
					"width" : "5%",
					"height": "calc(2.5rem + 6px)"
				});
			}
			
		},false);
		elem.addEventListener(touch.start,function(event){
			own.touching = true;
			console.log("!!" + event.target.id + " touch start");
			own.touchelement = event.target;
			//event.preventDefault();
		},false);
		elem.addEventListener(touch.move,function(event){
			if (own.touching) {
				console.log("!!" + event.target.id + " touch move");
				/*var offsetX = 0;
				var offsetY = 0;

				offsetX = event.clientX;
				offsetY = event.clientY;
				console.log("  x=" + event.clientX);
				console.log("  y=" + event.clientY);
				var mye = event.target;
				//---ボタンを動かした位置に合わせてパームレストの幅と高さを調整する
				if (mye.className.indexOf("lguard") > -1) {
					mye.style.top = offsetY + "px";
					mye.style.left = "0px";
					mye.parentElement.style.top = offsetY + "px";
					mye.parentElement.style.left = "0px";
					mye.parentElement.style.width = offsetX + (parseInt(this.lbtn.style.width)/2);
					mye.parentElement.style.height = "100%";
					
				}else if (mye.className.indexOf("rguard") > -1) {
					mye.style.top = offsetY + "px";
					mye.style.left = offsetX + (parseInt(this.lbtn.style.width)/2);
					mye.parentElement.style.top = offsetY + "px";
					mye.parentElement.style.left = offsetX + (parseInt(this.lbtn.style.width)/2);
					mye.parentElement.style.width = "100%";
					mye.parentElement.style.height = "100%";
				}
				this.startX = offsetX;
				this.startY = offsetY;*/
				event.preventDefault();
			}
		},true);
		elem.addEventListener(touch.end,function(event){
			own.touching = false;
			console.log("!!" + event.target.id + " touch end");
		},false);
		/*elem.addEventListener(touch.leave,function(event){
			console.log("!!" + event.target.id + " touch leave");
			//PalmRest.touching = false;
		},false);*/
		document.body.addEventListener(touch.move,this.operate_move, false);
	},
	this.initialize = function (e,d){
		var nm = "plt";
		this.direction = d;
		//console.log("palmrest initialize start");
		var touch = {
			start : 'touchstart',
			move : 'touchmove',
			end : 'touchend',
			leave : 'touchleave'
		}
		if (window.PointerEvent){
			touch.start = "pointerdown";
			touch.move = "pointermove";
			touch.end = "pointerup";
			touch.leave = 'pointerleave';
		}else if (window.navigator.msPointerEnabled) { // for Windows8 + IE10
			touch.start = 'MSPointerDown';
			touch.move = 'MSPointerMove';
			touch.end = 'MSPointerUp';
			touch.leave = 'MSPointerLeave';
		} else if (document.ontouchstart === undefined) { // for other PC browsers
			touch.start = 'mousedown';
			touch.move = 'mousemove';
			touch.end = 'mouseup';
			touch.leave = 'mouseleave';
		}else{
			touch.start = 'mousedown';
			touch.move = 'mousemove';
			touch.end = 'mouseup';
			touch.leave = 'mouseleave';
			touch.enter = 'mouseenter';
		}
		touch.start = "pointerdown";
		touch.move = "pointermove";
		touch.end = "pointerup";
		touch.leave = 'pointerleave';
		touch.enter = 'pointerenter';
		
		//---generate & setting elements
		if (d == "left") {
			this.element.className = "guard_canvas lguard guard_color_none guard_off";
			this.btn = document.createElement("div");
			this.btn.id = "palmrest_" + d + "_button";
			this.btn.className = "guard_operate_button guard_left_btn";
			this.element.appendChild(this.btn);
			this._setupEvent(touch,this.btn);
		}else if (d == "right") {
			this.element.className = "guard_canvas rguard guard_color_none guard_off";
			this.btn = document.createElement("div");
			this.btn.id = "palmrest_" + d + "_button";
			this.btn.className = "guard_operate_button guard_right_btn";
			this.element.appendChild(this.btn);
			this._setupEvent(touch,this.btn);
		}
		//console.log("palmrest initialized");
	}
	this.initialize(oelement,dir);
};
