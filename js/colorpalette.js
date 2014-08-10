//#################################################################################
//#################################################################################
	var ColorPalette = {
		name : "colorpalette",
		elements : null,
		touching : false,
		startX : 0,
		startY : 0,
		mode : "a",
		offset : 0,
		pickerUI : null,
		initialize : function (){
			var nm = "plt";
			var elems = document.querySelectorAll("button.palette_button");
			this.pickerUI = $("#pickerpanel").farbtastic("#colorpicker",function(color){
				$("#pickerpanel").hide();
			});

			var touchstart = 'touchstart';
			var touchmove = 'touchmove';
			var touchend = 'touchend';
			var touchleave = 'touchleave';
			if (window.PointerEvent){
				touchstart = "pointerdown";
				touchmove = "pointermove";
				touchend = "pointerup";
				touchleave = 'pointerleave';
			}else if (window.navigator.msPointerEnabled) { // for Windows8 + IE10
				touchstart = 'MSPointerDown';
				touchmove = 'MSPointerMove';
				touchend = 'MSPointerUp';
				touchleave = 'MSPointerLeave';
			} else if (document.ontouchstart === undefined) { // for other PC browsers
				touchstart = 'mousedown';
				touchmove = 'mousemove';
				touchend = 'mouseup';
				touchleave = 'mouseleave';
			}

			for (var i = 1; i < 16; i++){
				var obj = i;
				var elem = document.createElement("td");
				elem.id = nm + obj;
				elem.className = "palette_button";
				elem.style.backgroundColor = "#FFFFFF";
				elem.title = i;
				//document.getElementById("colorpalette").appendChild(elem);
				document.getElementById("palettepanel_line").appendChild(elem);
				//console.log(elem.innerHTML);
				elem.addEventListener("click",function(event){
					var c = new RGBColor(event.target.style.backgroundColor);
					document.getElementById("colorpicker").value = c.toHex();
					document.getElementById("colorpicker").style.backgroundColor = event.target.style.backgroundColor;
					$.farbtastic("#pickerpanel").setColor(c.toHex());
				}, false);
				elem.addEventListener(touchstart,function(event){
					this.touching = true;
					if (event.offsetX === undefined) {
						if (event.type == 'touchstart') {
							this.startX = event.changedTouches[0].pageX - event.target.offsetLeft - this.offset; // for Android
						} else {
							this.startX = event.pageX - event.target.offsetLeft - ColorPalette.offset;
						}
					} else {
						this.startX = event.offsetX - ColorPalette.offset;
					}
					
					if (event.offsetY === undefined) {
						if (event.type == 'touchstart') {
							this.startY = event.changedTouches[0].pageY - event.target.offsetTop - ColorPalette.offset; // for Android
						} else {
							this.startY = event.pageY - event.target.offsetTop - ColorPalette.offset;
						}
					} else {
						this.startY = event.offsetY - this.offset;
					}
					var pos  = calculatePosition("touchstart",event,event.target,{
						"offset" : ColorPalette.offset,
						"canvasspace":0
					});
					this.startX = pos.x;
					this.startY = pos.y;
					//document.getElementById("log").innerHTML = event.target.id;
				},false);
				elem.addEventListener(touchmove,function(event){
					if (this.touching) {
						var offsetX = 0;
						var offsetY = 0;
						if (event.offsetX === undefined) {
							if (event.type == 'touchmove') {
								offsetX = event.changedTouches[0].pageX - event.target.offsetLeft - ColorPalette.offset; // for Android
							} else {
								offsetX = event.pageX - event.target.offsetLeft - ColorPalette.offset;
							}
						} else {
							offsetX = event.offsetX - ColorPalette.offset;
						}
						
						if (event.offsetY === undefined) {
							if (event.type == 'touchmove') {
								offsetY = event.changedTouches[0].pageY - event.target.offsetTop - ColorPalette.offset; // for Android
							} else {
								offsetY = event.pageY - event.target.offsetTop - ColorPalette.offset;
							}
						} else {
							offsetY = event.offsetY - ColorPalette.offset;
						}
						var pos  = calculatePosition("touchmove",event,event.target,{
							"offset" : ColorPalette.offset,
							"canvasspace":0
						});
						offsetX = pos.x;
						offsetY = pos.y;
						/*if (offsetY < this.startY) {
							this.mode = "d";
						}else if (offsetY > this.startY) {
							this.mode = "a";
						}else{
							this.mode = "";
						}*/
						//移動量が多い向きが今回の動作モードとする
						var saY = this.startY - offsetY;
						var saX = this.startX - offsetX;
						var whichMode = Math.abs(saX) - Math.abs(saY) > 0 ? "rl" : "tb";
						if (whichMode == "tb") {
							if ((saY > 0) && (saY > 2)) { //↑
									this.mode = "d"; //色の削除
							}else if ((saY < 0) && ((saY * -1) > 2)) { //↓
								this.mode = "a"; //色の追加
							}else{
								this.mode = "c";
							}
						}else if (whichMode == "rl") {
							if (saX > 0) { //←
								this.mode = ""; 
							}else if (saX < 0){ //→
								this.mode = ""; 
							}else{
								this.mode = "";
							}
						}
						console.log(this.mode);
						document.getElementById("log").innerHTML = this.mode + "<br/>"+
						this.startY + "==" +  offsetY + "/" + saX + "x" + saY;
						this.startX = offsetX;
						this.startY = offsetY;
					}
				},false);
				elem.addEventListener(touchend,function(event){
					this.touching = false;
					/*if (this.mode == "a"){
						event.target.style.backgroundColor = document.getElementById("colorpicker").value;
					}else if (this.mode == "d"){
						event.target.style.backgroundColor = "#FFFFFF";
					}else if (this.mode == "c") {
						event.target.click();
					}*/
				},false);
				elem.addEventListener(touchleave,function(event){
					if (this.touching) {
						//---ID取得・変換
						var id = event.target.id;
						console.log(id);
						id = parseInt(id.replace("plt",""));
						if (isNaN(id)) id = 1;
						//---通常処理
						if (this.mode == "a"){
							event.target.style.backgroundColor = document.getElementById("colorpicker").value;
						}else if (this.mode == "d"){
							event.target.style.backgroundColor = "#FFFFFF";
						}/*else if (this.mode == "c") {
							event.target.click();
						}*/
						//---保存有効時、カラーパレットの各場所の色を保存
						if (document.getElementById("chk_sv_colorpalette").checked) {
							var c = new RGBColor(event.target.style.backgroundColor);
							if (AppStorage.isEnable()) {
								var val = AppStorage.get("sv_colorpalette0");
								console.log(val);
								console.log(c.toHex());
								var arr;
								if (val) {
									arr = val.split(",");
								}else{
									arr = [];
									for (var i = 0; i < 15; i++) arr.push("#FFFFFF");
								}
								console.log(id);
								arr[id-1] = c.toHex();
								console.log(arr);
								AppStorage.set("sv_colorpalette0",arr.join(","));
							}
						}
					}
					this.touching = false;
				},false);
			}
			if (AppStorage.isEnable()) {
				if (document.getElementById("chk_sv_colorpalette").checked) {
					var val = AppStorage.get("sv_colorpalette0",null);
					if (val) {
						var arr = val.split(",");
						for (var i = 0; i < arr.length; i++) {
							var nm = "plt" + (i+1);
							document.getElementById(nm).style.backgroundColor = arr[i];
						}
					}
				
				}
			}

		}
	};
