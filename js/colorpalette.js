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
		defaults : {
			"palettenum" : 21
		},
		pickerUI : null,
		load : function(paletteloc_num,data){
			var val = data;
			var arr = val.split(",");
			//console.log("paletteloc_num="+paletteloc_num);
			for (var i = 1; i < this.defaults.palettenum; i++) {
				if (i <= arr.length) {
					var nm = "plt" + (i + (paletteloc_num * 20));
					document.getElementById(nm).style.backgroundColor = arr[i-1];
				}
			}
		},
		manageColor : function(mode,evt){
			//---ID取得・変換
			var id = evt.target.id;
			console.log(id);
			id = parseInt(id.replace("plt",""));
			if (isNaN(id)) id = 1;
			
			//---通常処理
			if (mode == "a"){
				evt.target.style.backgroundColor = document.getElementById("colorpicker").value;
			}else if (mode == "d"){
				evt.target.style.backgroundColor = "#FFFFFF";
			}/*else if (this.mode == "c") {
				event.target.click();
			}*/
			//---保存有効時、カラーパレットの各場所の色を保存
			var alldatatext = "";
			var lines = String(document.getElementById("sv_palettevalue").value).split(/\r\n|\r|\n/);
			
			if (document.getElementById("chk_sv_colorpalette").checked) {
				var inx = -1; //$("input:radio[name=sv_paletteloc]:checked").val();
				var range = [
					[1,20],[21,40],[41,60],[61,80],[81,100]
				];
				for (var c = 0; c < range.length; c++) {
					if ((range[c][0] <= id) && (id <= range[c][1])) {
						inx = c;
					}
				}
				id--;
				//console.log("inx="+inx);
				var c = new RGBColor(evt.target.style.backgroundColor);
				if (AppStorage.isEnable()) {
					var val = AppStorage.get("sv_colorpalette"+inx);
					//console.log(val);
					//console.log(c.toHex());
					var arr;
					if (val) {
						arr = val.split(",");
					}else{
						arr = [];
						for (var i = 0; i < ColorPalette.defaults.palettenum-1; i++) arr.push("#FFFFFF");
					}
					//console.log(id);
					arr[id - (inx*(ColorPalette.defaults.palettenum-1))] = c.toHex();
					//document.getElementById("lab_pltloc" + inx + "_" + (id-1)).style.color = arr[id-1];
					console.log("sv_colorpalette"+inx);
					AppStorage.set("sv_colorpalette"+inx,arr.join(","));
					lines[inx] = arr.join(",");
					document.getElementById("sv_palettevalue").value = lines.join("\r\n");
				}
			}
		},
		initialize : function (){
			var nm = "plt";
			var elems = document.querySelectorAll("button.palette_button");
			this.pickerUI = $("#pickerpanel").farbtastic("#colorpicker",function(color){
				$("#pickerpanel").hide();
			});
			document.getElementById("palettepanel").addEventListener("mouseleave", function(event) {
				for (var l = 1; l < Draw.defaults.sv_paletteloc_num*2; l++) {
					//if ((l%2) == 0) {
						document.getElementById("palettepanel_line" + l).style.display = "none";
					//}
				}
			},false);
			document.getElementById("explain_palette").addEventListener("click", function(event) {
				for (var l = 1; l < Draw.defaults.sv_paletteloc_num*2; l++) {
					//if ((l%2) == 0) {
						document.getElementById("palettepanel_line" + l).style.display = "table-row";
					//}
				}
			},false);
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
			var cntl = -1;
			for (var l = 0; l < Draw.defaults.sv_paletteloc_num*2; l++) {
				var elemln = document.createElement("tr");
				elemln.id = "palettepanel_line" + l;
				if ((l%2) == 0) {
					elemln.className = "palette_line";
					cntl++;
				}else{
					elemln.className = "palette_emptyline";
					var tmptd = document.createElement("td");
					tmptd.colspan = this.defaults.palettenum-1;
					tmptd.className = "palette_empty_td";
					//tmptd.innerHTML = " ";
					elemln.appendChild(tmptd);
				}
				
				document.getElementById("palettepanel_body").appendChild(elemln);
				if (l == 0) {
					elemln.style.display = "table-row";
				}
				if ((l%2) != 0) continue;
				for (var i = 1; i < this.defaults.palettenum; i++){
					var obj = i + (cntl*20);
					var elem = document.createElement("td");
					elem.id = nm + obj;
					elem.className = "palette_button";
					elem.style.backgroundColor = "#FFFFFF";
					elem.title = obj;
					//document.getElementById("colorpalette").appendChild(elem);
					document.getElementById("palettepanel_line" + l).appendChild(elem);
					//console.log(elem.innerHTML);
					elem.addEventListener("dblclick",function(event){
						ColorPalette.manageColor("a",event);
					}, false);
					elem.addEventListener("click",function(event){
						console.log(event);
						var c = new RGBColor(event.target.style.backgroundColor);
						document.getElementById("colorpicker").value = c.toHex();
						document.getElementById("colorpicker").style.backgroundColor = event.target.style.backgroundColor;
						$.farbtastic("#pickerpanel").setColor(c.toHex());
					}, false);
					elem.addEventListener(touchstart,function(event){
						this.touching = true;
						/*if (event.offsetX === undefined) {
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
						}*/
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
							/*var offsetX = 0;
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
							}*/
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
							ColorPalette.manageColor(this.mode,event);
						}
						this.touching = false;
					},false);
				}
			}
			$(".palette_empty_td").attr("colspan",this.defaults.palettenum-1);
			if (AppStorage.isEnable()) {
				if (document.getElementById("chk_sv_colorpalette").checked) {
					//var inx = $("input:radio[name=sv_paletteloc]:checked").val();
					for (var i = 0; i < Draw.defaults.sv_paletteloc_num; i ++) {
						var val = AppStorage.get("sv_colorpalette" + i,null);
						if (val) {
							this.load(i,val);
						}
					}
					/*var val = AppStorage.get("sv_colorpalette0",null);
					if (val) {
						var arr = val.split(",");
						for (var i = 0; i < arr.length; i++) {
							var nm = "plt" + (i+1);
							document.getElementById(nm).style.backgroundColor = arr[i];
						}
					}*/
				
				}
			}
			//---カラーパレットのプレビュー＆イベントセットアップ
			var limt = this.defaults.palettenum - 1;
			var allcolortext = "";
			for (var l = 0; l < Draw.defaults.sv_paletteloc_num; l++) {
				//document.getElementById("rad_paletteloc"+i).addEventListener("click", function(event) {
					//var val = event.target.value;
					//console.log("rad_paletteloc=" + val);
					var dat = AppStorage.get("sv_colorpalette"+l,null);
					console.log("---" + l);
					console.log("dat="+dat);
					if (!dat) {
						var arr = [];
						for (var i = 0; i < limt; i++) arr.push("#FFFFFF");
						dat = arr.join(",");
					}
					allcolortext += dat + "\r\n";
					//document.getElementById("sv_palettevalue").innerText = dat;
					ColorPalette.load(l,dat);
				//},false);
				var val = AppStorage.get("sv_colorpalette"+l,null);
				var arr = "";
				if (val) {
					arr = val.split(",");
				}
				//プレビューセットアップ
				/*for (var j = 0; j < limt; j++) {
					var span = document.createElement("span");
					if (arr) {
						span.style.color = arr[j];
					}else{
						span.style.color = "#FFFFFF";
					}
					span.innerHTML = "&#9724;";
					span.id = "lab_pltloc"+ i + "_" + j;
					document.getElementById("lab_pltloc"+i).appendChild(span);
				}*/
			}
			//var dat = AppStorage.get("sv_colorpalette0",null);
			document.getElementById("sv_palettevalue").value = allcolortext;

		}
	};
