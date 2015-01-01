var PenType = {
	"normal" : 0,
	"fill" : 1,
	"operate" : 2
};
function call_parentEvent(removeLabel) {
	var id = String(event.target.id).replace(removeLabel,"");
	document.getElementById(id).click();
}
//#################################################################################
//#################################################################################
	var PenSet = {
		parent : null,
			
		//special pen
		eraser : null, 
		fillpen : null,
		
		sizebar : null,
		colorpicker : null,
		defaults : {
			"eraser" : [20,"#000000"],
			"fillpen" : [0, "#000000"]
		},
		current : {"mode":"","size":-1,"color":"#000000","complete":false}, //0=mode, 1=size, 2=color, 3=complete?
		pentype : 0,
		penfolders : {
			"special" : null,
			"pen" : null,
			"brush" : null
		},
		items : [],
		lastpressure : 0.5,
		correction_level : 3,

		updateInfo : function(panname,pensize){
			document.getElementById("info_pen_mode").textContent = panname;
			//document.getElementById("info_pen_size").innerHTML = Math.ceil(pensize);
			document.getElementById("lab_pensize").textContent = pensize;
			this.sizebar.value = this.current["size"];
		},
		setEraser : function(context) {
			this.current = {
				"mode":"eraser",
				"pentype" : PenType.normal,
				"size":20,
				"color":"#000000",
				"pressure":true,
				"complete":false
			};
			if (arguments.length > 1)  { //指定ありの場合はそれを優先
				this.current["size"] = arguments[1]["size"];
			}
			context.globalCompositeOperation = "destination-out";
			context.strokeStyle = "#000000";
			context.lineWidth = this.current["size"];
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0;
			context.lineCap = "round";
			
			this.updateInfo(_T("brush_eraser"),context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.normal;
		},
		setFillpen : function(context) {
			this.current = {
				"mode":"fillpen",
				"pentype" : PenType.fill,
				"size":1,
				"color":"#000000",
				"pressure":false,
				"complete":false
			};
			context.globalCompositeOperation = "destination-over";
			context.strokeStyle = this.colorpicker.value;
			context.fillStyle = this.colorpicker.value;
			context.lineWidth = this.current["size"];
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0;
			context.lineCap = "round";
			
			this.updateInfo(_T("brush_fillpen"),context.lineWidth);
			this.sizebar.value = this.current["size"];
			this.pentype = PenType.fill;
		},
		/*
			event - Each pointer event
			context - current canvas's context
			pressure2 - sub pressure
		*/
		prepare : function (event, context, pressure2){
			var pres = 0;
			if ((event.pressure) || (event.mozPressure)) {
				pres = event.pressure;
				if (event.mozPressure) pres = event.mozPressure;
				if (event.pressure == 0) pres = 0.001;
				if ((pressure2 != null) && (pressure2 > 0)) { //サブの筆圧があれば使用
					pres = pressure2;
				}
				if (document.getElementById("chk_enable_handpres").className == "switchbutton_on") {
					pres = parseInt(document.getElementById("pres_curline").value) / 100;
					if (pres <= 0) pres = 0.001;
				}
				if (!this.current["pressure"]) pres = 0.5;
				if ((this.current["mode"] == "airbrush") || 
					(this.current["mode"] == "fudepen") || 
					(this.current["mode"] == "calligraphy") || 
					(this.current["mode"] == "oilpaintv") || 
					(this.current["mode"] == "oilpaint")) {
					context.lineWidth = (this.sizebar.value * 0.5 * pres) * 2;
				}else{
					context.lineWidth = (this.sizebar.value * pres) * 2 + (pres * 0.5);
					//document.getElementById("log2").innerHTML = "pressure on:" + context.lineWidth;
				}
				this.lastpressure = pres;
				//document.getElementById("log").innerHTML =  "pressure on:" + this.lastpressure;
			}else{
				if (event.pressure == 0) {
					pres = 0.001;
				}else if (event.pressure == undefined) {
					pres = 0.5;
				}else{
					pres = 0.5;
				}
				if ((pressure2 != null) && (pressure2 > 0)) { //サブ筆圧があれば使用
					pres = pressure2;
				}
				if (document.getElementById("chk_enable_handpres").className == "switchbutton_on") {
					pres = parseInt(document.getElementById("pres_curline").value) / 100;
					if (pres <= 0) pres = 0.001;
				}
				if ((this.current["mode"] == "airbrush") || 
					(this.current["mode"] == "fudepen") || 
					(this.current["mode"] == "calligraphy") || 
					(this.current["mode"] == "oilpaint") || 
					(this.current["mode"] == "oilpaintv")) {
					context.lineWidth = (this.sizebar.value * 0.5 * pres) * 2;
				}else{
					context.lineWidth = (this.sizebar.value * pres) * 2 + (pres * 0.5);
				}
				this.lastpressure = pres;
				//document.getElementById("log").innerHTML = "pressure off:" + this.lastpressure;
			}
			//console.log("this.lastpressure="+this.lastpressure);
			this.parent.elementParameter["lastpressure"] = this.lastpressure;
			if (this.current["mode"] in this.items) {
				var retobj = this.items[this.current["mode"]].prepare(event, context, this.parent.elementParameter["lastpressure"]);
				if (retobj) {
					if ("pressure" in retobj) {
						if (!isNaN(parseFloat(retobj["pressure"]))) {
							this.lastpressure = parseFloat(retobj["pressure"]);
							this.parent.elementParameter["lastpressure"] = this.lastpressure;
						}
					}
					if ("context" in retobj) {
						context = retobj["context"];
					}
				}
			}
			//console.log("pres="+pres);
			//console.log(this.parent.elementParameter["lastpressure"]);
		},
		drawMain : function(context,startX,startY,offsetX,offsetY,event,parentElement){
			if (this.parent.discomplete_count.cnt > 0) {
				this.parent.discomplete_count.cnt--;
				return;
			}
			
			var hairStX = 0;
			var hairStY = 0;
			var hairX = 0;
			var hairY = 0;
			var hairWidth = 0;
			var hairDist = 0;
			var hair_outblur = 0;
			if (this.current["mode"] == "fillpen" && this.current["pentype"] == PenType.fill){
				//console.log("points="+this.parent.selectors.items[0].points.length);
				if ((this.parent.selectors.items.length > 0) && (this.parent.selectors.items[0].points.length > 0)) {
					context.fill();
				}else{
					context.fillRect(0,0,parentElement["canvas"].width,parentElement["canvas"].height);
				}
			}else{
				try {
					if (this.current["mode"] in this.items) {
						this.items[this.current["mode"]].drawMain(context,startX,startY,offsetX,offsetY,event,parentElement);
					}else{
						context.beginPath();
						context.moveTo(startX, startY);
						context.lineTo(offsetX, offsetY);
						context.stroke();
					}
				}catch(e){
				}
			}
			//context.closePath();
		},
		hiddenMenu : function (evt){
			document.getElementById("menupanel").style.display = "none";
			document.getElementById("btn_menu").style.backgroundColor = "#c4fab3";
			
			var p = document.querySelectorAll("div.item1st");
			//console.log(p);
			for (var j = 0; j < p.length; j++) {
				
				//if (String(p[j].innerHTML).substr(0,1).charCodeAt() == "10004")
				//	p[j].innerText = String(p[j].innerHTML).substr(1,String(p[j].innerHTML).length);
				p[j].querySelector("img").style.border = "0px";
			}
			if (evt.target.tagName.toLowerCase() == "img") {
				evt.target.style.border = "2px solid #000000";
			}else{
				//渡された要素がspanの場合は親から参照
				if (evt.target.tagName.toLowerCase() == "span") {
					evt.target.parentElement.querySelector("img").style.border = "2px solid #000000";
				}else{
					evt.target.querySelector("img").style.border = "2px solid #000000";
				}
			}
			//evt.target.innerHTML = "&#10004;" + evt.target.innerText;
			//console.log(event.target.id);
			document.getElementById("dlg_pen_mode").style.display = "none";
		},
		Add : function (item){
			var ishit = false;
			for (var obj in this.items) {
				if (item.id == obj) {
					ishit = true;
					break;
				}
			}
			if (ishit) {
				//return [false,"すでに同じ名前のブラシが存在します"];
				return [false,_T("penset_Add_msg1")];
			}else{
				this.items[item.id] = item;
				this.defaults[item.id] = item.defaults;
				//プラグインブラシの画面要素生成
				var li = document.createElement("div");
				var img = document.createElement("img");
				var span = document.createElement("span");
				li.id = item.id;
				img.id = "img_" + item.id;
				span.id = "sp_" + item.id;
				if (item.name[curLocale.name]) {
					li.title = item.name[curLocale.name];
					img.title = item.name[curLocale.name];
					span.title = item.name[curLocale.name];
					span.innerHTML = item.name[curLocale.name];
				}else{
					//---ロケールがない場合はenを優先
					li.title = item.name["en"];
					img.title = item.name["en"];
					span.title = item.name["en"];
					span.innerHTML = item.name["en"];
				}
				
				//---li element and img image
				if (item.setFolder == "special") {
					li.className = "item1st item1st-special";
					img.src = "images/brush_special.png";
				}else{
					li.className = "item1st";
					if (item.setFolder == "pen") {
						img.src = "images/brush_pen.png";
					}else{
						img.src = "images/brush_brush.png";
						li.className = "item1st item1st-brush";
					}
				}
				img.width = "32";
				img.height = "32";
				img.className = "floatIcon";
				li.appendChild(img);
				img.addEventListener("click",function(event) {
					call_parentEvent("img_");
				},false);
				//span.style.marginTop = "1px";
				li.appendChild(span);
				
				//---span label
				span.addEventListener("click",function(event) {
					call_parentEvent("sp_");
				},false);
				//li.innerHTML = item.name;
				this.penfolders[item.setFolder].appendChild(li);
				
				li.addEventListener("click",function(event) {
					var o = {
						"colorpicker" : PenSet.colorpicker.value,
						"sizebar" : PenSet.sizebar.value
					};
					var it = PenSet.items[event.target.id];
					if (it) {
						PenSet.current = it.set(Draw.context,o);
						var brushname = "";
						if (it.name[curLocale.name]) {
							brushname = it.name[curLocale.name];
						}else{
							brushname = it.name["en"];
						}
						PenSet.updateInfo(brushname,Draw.context.lineWidth);
						PenSet.sizebar.value = PenSet.current["size"];
						PenSet.hiddenMenu(event);
						PenSet.parent.last.pen = {
							"name" : it.id,
							"func" : it.element,
						};
					}
				}, false);
				//初期化処理呼び出し
				//console.log("add finished="+item.id);
				this.items[item.id].initialize(this,li);
				return [true,""];
			}
		},
		Remove : function (name) {
			for (var obj in this.items) {
				if (name == obj) {
					this.items[obj] = null;
					delete this.items[obj];
				}
			}
		},
		initialize : function(drawobject) {
			this.parent = drawobject;
			this.penfolders.special = document.getElementById("dir_brush_special");
			this.penfolders.pen = document.getElementById("dir_brush_pen");
			this.penfolders.brush = document.getElementById("dir_brush_wide");
			
			this.eraser = document.getElementById("eraser");
			this.fillpen = document.getElementById("fillpen");
			
			this.sizebar = document.getElementById("pensize");
			this.colorpicker = document.getElementById("colorpicker");
			
			//システムブラシ読み込み
			/*var sysbru_pen = ["colorchangepen",
							"simplepen","pencil","fudepen","calligraphy","neonpen","testplugin",
							"airbrush","oilpaint","oilpaintv","waterpaint","directpaint"];//,"testplugin2","testplugin3"
			for (var i = 0; i < sysbru_pen.length; i++) {
				var sc = document.createElement("script");
				sc.src = "js/brush/" + sysbru_pen[i] + ".js";
				document.body.appendChild(sc);
			}*/
			PenSet.parent.last.eraser = {
				"name" : "eraser",
				"func" : PenSet.eraser
			};
			this.eraser.addEventListener("click",function(event) {
				Draw.pen.setEraser(Draw.context); // change edit style to "eraser".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.eraser = {
					"name" : "eraser",
					"func" : PenSet.eraser
				};
				PenSet.parent.last.pen = {
					"name" : "eraser",
					"func" : PenSet.eraser
				};
			}, false);
			document.getElementById("img_eraser").addEventListener("click",function(event) {
				call_parentEvent("img_");
			},false);
			document.getElementById("sp_eraser").addEventListener("click",function(event) {
				call_parentEvent("sp_");
			},false);
			this.fillpen.addEventListener("click",function(event) {
				Draw.pen.setFillpen(Draw.context); // change edit style to "eraser".
				PenSet.hiddenMenu(event);
				PenSet.parent.last.pen = {
					"name" : "fillpen",
					"func" : PenSet.fillpen
				};
			}, false);
			document.getElementById("img_fillpen").addEventListener("click",function(event) {
				call_parentEvent("img_");
			},false);
			document.getElementById("sp_fillpen").addEventListener("click",function(event) {
				call_parentEvent("sp_");
			},false);
			
		}
	};
