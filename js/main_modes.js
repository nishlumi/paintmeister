Draw["addCliphist"] = function(clip, imgurl) {
	var o = new Selector(new Date().valueOf());
	o.copyFrom(clip);
	o.status = clip.status;
	o.action = clip.action;
	o.selectType = clip.selectType;
	o.curfrom = imgurl;
	console.log(clip);
	this.cliphist.push(o);
	if (this.cliphist.length > this.defaults.cliphistory) {
		//---履歴最大数を超えていたらオブジェクトを削除（HTMLはそのまま）
		var c = this.cliphist.shift();
		c = null;
		
	}else{
		//---履歴最大数に達していなかったらHTMLを追加（オブジェクトはそのまま）
		var opt = document.createElement("option");
		opt.value = this.cliphist.length - 1;
		opt.innerText = this.cliphist.length;
		/*var img = document.createElement("img");
		img.src = imgurl;
		img.className = "clipthumb";
		var span = document.createElement("span");
		span.innerText = this.cliphist.length;
		opt.appendChild(img);
		opt.appendChild(span);*/
		document.getElementById("layinfo_cliphistory").appendChild(opt);
	}
}
Draw["getCliphist"] = function (index) {
	return this.cliphist[index];
}
Draw["clearCliphist"] = function () {
	for (var i = 0; i < this.cliphist.length; i++) {
		this.cliphist[i] = null;
	}
	this.cliphist.splice(0,this.cliphist.length);
	$("#layinfo_cliphistory > option").remove();
}
//---the functions for select mode--------------------------------------------------------------------
Draw["select_function_start"] = function (event,pos){
	if (this.select_type == "move") {
		//if (this.selectors.items.length < 1) return;
		var o = this.select_clipboard; //this.selectors.items[0];
		if (o.status != selectionStatus.paste_begin) return;
		o.destx = pos.x;
		o.desty = pos.y;
		o.origdestx = pos.x;
		o.origdesty = pos.y;
		o.status = selectionStatus.pasting;
		//this.opeselcontext.isPointInPath(pos.x,pos.y)
		return;
	}
	this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
	this.selectors.clear();
	var o = new Selector(new Date().valueOf());
	if (this.select_type == "box") {
		o.x = pos.x;
		o.y = pos.y;
		o.selectType = selectionType.box;
	}else if (this.select_type == "free") {
		o.selectType = selectionType.free;
		o.addPoint(pos.x,pos.y);
	}
	this.selectors.add(o);
}
Draw["select_function_move"] = function (event, pos) {
	if ((this.select_clipboard) && (this.select_clipboard.status == selectionStatus.pasting)) {
		if (this.select_clipboard.selectType == selectionType.move) {
			this.opeselcontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			this.opeselcontext.drawImage(this.canvas,pos.x-(this.select_clipboard.w*0.5),pos.y-(this.select_clipboard.h*0.5));
			//this.select_clipboard.oldx = this.select_clipboard.x;
			//this.select_clipboard.oldy = this.select_clipboard.y;
			this.select_clipboard.destx = pos.x;
			this.select_clipboard.desty = pos.y;
			this.select_clipboard.origdestx = pos.x;
			this.select_clipboard.origdesty = pos.y;
		}
		return;
	}
	if (this.selectors.items.length == 0) return;
	var o = this.selectors.items[0];
	if (o.status < selectionStatus.end) {
		this.opecontext.lineWidth = 2;
		this.opecontext.strokeStyle = "#888888";
		if (o.selectType == selectionType.box) {
			this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			o.destx = pos.x;
			o.desty = pos.y;
			o.origdestx = pos.x;
			o.origdesty = pos.y;
			var ang = o.calculateAngle();
			
			this.opecontext.strokeRect(ang.lt.x,ang.lt.y, ang.rb.x, ang.rb.y);
		}else if (o.selectType == selectionType.free) {
			if (this.touchpoints["1"] && (this.touchpoints["1"].id != event.pointerId)) {
				return;
			}
			var oldo = o.points[o.points.length-1];
			this.opecontext.beginPath();
			this.opecontext.moveTo(oldo.x, oldo.y);
			this.opecontext.lineTo(pos.x, pos.y);
			this.opecontext.stroke();
			o.addPoint(pos.x,pos.y);
		}
	}
}
Draw["select_function_end"] = function (event, pos) {
	var o;
	if (this.select_type == "move") {
		o = this.select_clipboard; //this.selectors.items[0];
		
		if (o.status == selectionStatus.end) return;
		if (o.status == selectionStatus.pasting) {
			o.status = selectionStatus.paste_begin;
			o.destx = pos.x-(o.w*0.5);
			o.desty = pos.y-(o.h*0.5);
			o.origdestx = pos.x;
			o.origdesty = pos.y;
			return;
		}
	}
	if (this.selectors.items.length == 0) return;
	o = this.selectors.items[0];
	this.opecontext.lineWidth = 2;
	this.opecontext.strokeStyle = "#888888";
	this.opecontext.beginPath();
	if (this.select_type == "box") {
		o.destx = pos.x;
		o.desty = pos.y;
		o.origdestx = pos.x;
		o.origdesty = pos.y;
		o.directionx = (o.x < o.destx ? 1 : -1);
		o.directiony = (o.y < o.desty ? 1 : -1);
		o.w = (o.destx - o.x) * o.directionx;
		o.h = (o.desty - o.y) * o.directiony;
		var ang = o.calculateAngle();
		
		this.opecontext.strokeRect(ang.lt.x,ang.lt.y, ang.rb.x, ang.rb.y);
	}else if (this.select_type == "free") {
		var oldo = o.points[o.points.length-1];
		this.opecontext.moveTo(oldo.x, oldo.y);
		this.opecontext.lineTo(pos.x, pos.y);
		//---選択のサブパスを念のため閉じる
		this.opecontext.lineTo(o.points[0].x, o.points[0].y);
		this.opecontext.stroke();
		this.opecontext.closePath();
		o.addPoint(pos.x,pos.y);
	}
	o.status = selectionStatus.end;
}
Draw["select_function_execute"] = function(event) {
	if ((this.select_operation == "copy") || (this.select_operation == "cut")) { //--コピー・切り取り時
		var o = this.selectors.items[0];
		this.select_clipboard.copyFrom(o);
		if (this.select_operation == "copy") {
			this.select_clipboard.action = selectActionType.copy;
		}else if (this.select_operation == "cut") {
			this.select_clipboard.action = selectActionType.cut;
			this.select_clipboard.cutfrom = this.context;
		}
		var imgdata;
		if (this.select_type == "box") {
			this.select_clipboard.selectType = selectionType.box;
			var ang = o.calculateAngle();
			imgdata = this.context.getImageData(ang.lt.x,ang.lt.y, o.w,o.h);
			this.select_clipboard.oldx = ang.lt.x;
			this.select_clipboard.oldy = ang.lt.y;
		}else if (this.select_type == "free") {
			this.select_clipboard.selectType = selectionType.free;
			//---将来のために一応セットまでしておく
			var ang = locateMinMaxPosition(o.points);
			imgdata = this.context.getImageData(ang.lt.x,ang.lt.y, 
				ang.rb.x-ang.lt.x, ang.rb.y-ang.lt.y);
			this.select_clipboard.oldx = ang.lt.x;
			this.select_clipboard.oldy = ang.lt.y;
			console.log(ang);
		}
		this.canvas.width = imgdata.width;
		this.canvas.height = imgdata.height;
		this.canvas.globalAlpha = this.context.globalAlpha;
		this.canvas.globalCompositeOperation = this.context.globalCompositeOperation;
		this.context.save();
		//---クリップボード代わりにダミーキャンバスにコピー退避
		this.canvas.getContext("2d").clearRect(0,0,this.canvas.width,this.canvas.height);
		this.canvas.getContext("2d").putImageData(imgdata,0,0);
		document.getElementById("sel_operationtype_paste").className = "button uibutton-mid flatbutton";
	}else if (this.select_operation == "paste") {
		var o = this.select_clipboard; //this.selectors.items[0];
		if ((o.status == selectionStatus.pasting) || (o.status == selectionStatus.paste_begin)) {
			//---現在のキャンバスに固定
			var imgdata = this.canvas.getContext("2d").getImageData(0,0,this.canvas.width,this.canvas.height);
			//this.context.putImageData(imgdata,o.destx,o.desty);
			//---前の選択キャンバス、操作キャンバスをクリア
			this.opeselcontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			this.undo_function_begin(true);
			if (o.action == selectActionType.cut) {
				var ang = o.calculateAngle();
				o.cutfrom.clearRect(o.oldx,o.oldy, o.w,o.h);
			}
			this.context.globalAlpha = 1.0;
			this.context.shadowBlur = 0;
			this.context.drawImage(this.canvas,o.destx,o.desty);
			//---save undo
			this.undo_function_end();
			this.context.restore();
			o.status = selectionStatus.end;
			if (this.selectors.items.length > 0) this.selectors.remove(this.selectors.items[0].id);
			document.getElementById("sel_operationtype_paste").title = _T("sel_operationtype_paste_title"); //"貼り付け";
			document.getElementById("sel_operationtype_paste").innerHTML = "&#9744";
		}else{
			//---貼り付け開始
			o.status = selectionStatus.paste_begin;
			o.selectType = selectionType.move;
			//o.action = selectActionType.paste;
			//---前の選択キャンバス、操作キャンバスをクリア
			this.opeselcontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			this.opeselcontext.drawImage(this.canvas,0,0);
			document.getElementById("sel_operationtype_paste").title = _T("sel_operationtype_paste_title2"); //"貼り付けの確定";
			document.getElementById("sel_operationtype_paste").innerHTML = "&#9745";
		}
	}else if (this.select_operation == "clip") {
		//---クリップ領域作成
		if (this.currentLayer.GetClip()) {
			//alert("このレイヤーにはすでにクリップ領域が適用されています。");
			alert(_T("select_function_execute_msg1"));
			return;
		}
		var o = this.selectors.items[0];
		o.action = selectActionType.clip;
		//this.context.beginPath();
		//---操作用はここでクリア
		this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
		this.context.save();
		this.currentLayer.SetClip(true,o);
		var ang;
		if (o.selectType == selectionType.box) {
			ang = o.calculateAngle();
		}else if (o.selectType == selectionType.free) {
			ang = locateMinMaxPosition(o.points);
			//---ここではrbの位置情報はWidth, Heightにする
			ang.rb.x = ang.rb.x - ang.lt.x;
			ang.rb.y = ang.rb.y - ang.lt.y;
		}
		this.canvas2.width = ang.rb.x + 10;
		this.canvas2.height = ang.rb.y + 10;
		var can2con = this.canvas2.getContext("2d");
		can2con.clearRect(0,0,Draw.canvas2.width,Draw.canvas2.height);
		var img = this.opeselcontext.getImageData(ang.lt.x,ang.lt.y, ang.rb.x,ang.rb.y);
		//---ダミーキャンバスにコピー
		can2con.putImageData(img, 5,5, 0,0, ang.rb.x,ang.rb.y);
		
		console.log("ang=");
		console.log(ang);
		this.addCliphist(o,this.canvas2.toDataURL("image/png"));
		document.getElementById("layinfo_clip").checked = true;
		document.getElementById("layinfo_clip").disabled = "";
		document.getElementById("layinfo_clearclip").disabled = "";
		if (this.cliphist.length > 0) {
			document.getElementById("layinfo_cliphistory").disabled = "";
			document.getElementById("layinfo_call_cliphist").disabled = "";
		}
		/*if (this.select_type == "box") {
			this.context.rect(o.x,o.y, o.w,o.h);
		}else if (this.select_type == "free") {
			this.context.moveTo(o.points[0].x, o.points[0].y);
			for (var i = 1; i < o.points.length; i++) {
				this.context.lineTo(o.points[i].x, o.points[i].y);
			}
			this.context.lineTo(o.points[0].x, o.points[0].y);
		}*/
		//this.context.closePath();
		//this.context.clip();
	}
}
//---the functions for draw shapes--------------------------------------------------------------------
Draw["drawshape_function_move"] = function (event, pos) {
	//if ((event.shiftKey) && (this.drawpoints.length > 0)) { //マウス・ペン
	if ((this.drawpoints.length > 0)) { //マウス・ペン
		this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
		if (this.pressedKey != "27") { //Escキー押下でキャンセル
			this.opecontext.lineWidth = 2;
			this.opecontext.strokeStyle = "#888888";
			this.opecontext.beginPath();
			if (this.drawing_type == "line") {
				this.opecontext.moveTo(this.drawpoints[0].x, this.drawpoints[0].y);
				this.opecontext.lineTo(pos.x, pos.y);
			}else if (this.drawing_type == "box") {
				var lt = {}, rb = {};
				if (this.drawpoints[0].x > this.drawpoints[1].x) {
					lt["x"] = this.drawpoints[1].x;
					rb["x"] = this.drawpoints[0].x - this.drawpoints[1].x;
				}else{
					lt["x"] = this.drawpoints[0].x;
					rb["x"] = this.drawpoints[1].x - this.drawpoints[0].x;
				}
				if (this.drawpoints[0].y > this.drawpoints[1].y) {
					lt["y"] = this.drawpoints[1].y;
					rb["y"] = this.drawpoints[0].y - this.drawpoints[1].y;
				}else{
					lt["y"] = this.drawpoints[0].y;
					rb["y"] = this.drawpoints[1].y - this.drawpoints[0].y;
				}
				this.opecontext.strokeRect(lt.x,lt.y, rb.x, rb.y);
			}else if (this.drawing_type == "circle") {
				var distance = Math.sqrt(
					(this.drawpoints[1].x - this.drawpoints[0].x)
					* (this.drawpoints[1].x - this.drawpoints[0].x)
					+
					(this.drawpoints[1].y - this.drawpoints[0].y)
					* (this.drawpoints[1].y - this.drawpoints[0].y)
				);
				this.opecontext.arc(this.drawpoints[0].x,this.drawpoints[0].y,distance,0/180*Math.PI,360/180*Math.PI);
			}else if (this.drawing_type == "triangle") {
				var top2nd = {}, top3rd = {};
				var ang_top = {};
				if (this.drawpoints[0].x > this.drawpoints[1].x) {
					if (event.shiftKey) {
						top2nd["x"] = this.drawpoints[1].x;
						top3rd["x"] = this.drawpoints[1].x;
						ang_top["x"] = this.drawpoints[0].x;
					}else{
						top2nd["x"] = this.drawpoints[0].x;
						top2nd["sx"] = this.drawpoints[0].x - this.drawpoints[1].x;
						top3rd["x"] = this.drawpoints[1].x;
						ang_top["x"] = top3rd.x + (top2nd["sx"]/2);
					}
				}else{
					if (event.shiftKey) {
						top2nd["x"] = this.drawpoints[1].x;
						top3rd["x"] = this.drawpoints[1].x;
						ang_top["x"] = this.drawpoints[0].x;
					}else{
						top2nd["x"] = this.drawpoints[0].x;
						top3rd["sx"] = this.drawpoints[1].x - this.drawpoints[0].x;
						top3rd["x"] = this.drawpoints[1].x;
						ang_top["x"] = top2nd.x + (top3rd["sx"]/2);
					}
				}
				if (this.drawpoints[0].y > this.drawpoints[1].y) {
					if (event.shiftKey) {
						top2nd["y"] = this.drawpoints[0].y;
						top2nd["sy"] = this.drawpoints[0].y - this.drawpoints[1].y;
						top3rd["y"] = this.drawpoints[1].y;
						ang_top["y"] = top3rd.y + (top2nd["sy"]/2);
					}else{
						top2nd["y"] = this.drawpoints[1].y;
						top3rd["y"] = this.drawpoints[1].y;
						ang_top["y"] =  this.drawpoints[0].y;
					}
				}else{
					if (event.shiftKey) {
						top2nd["y"] = this.drawpoints[0].y;
						top3rd["sy"] = this.drawpoints[1].y - this.drawpoints[0].y;
						top3rd["y"] = this.drawpoints[1].y;
						ang_top["y"] = top2nd.y + (top3rd["sy"]/2);
					}else{
						top2nd["y"] = this.drawpoints[1].y;
						top3rd["y"] = this.drawpoints[1].y;
						ang_top["y"] = this.drawpoints[0].y;
					}
				}
				this.opecontext.moveTo(ang_top.x, ang_top.y);
				this.opecontext.lineTo(top2nd.x, top2nd.y);
				this.opecontext.lineTo(top3rd.x, top3rd.y);
				this.opecontext.lineTo(ang_top.x, ang_top.y);
			}
			this.opecontext.closePath();
			this.opecontext.stroke();
			if (this.drawpoints.length < 2) {
				this.drawpoints.push(pos);
			}else{
				this.drawpoints[1] = pos;
			}
			this.context.save();
		}
	}else if (this.touchpoints["1"] && this.touchpoints["2"] && this.touchpoints["1"].id != this.touchpoints["2"].id) {
		//タッチ
		this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1])
		this.opecontext.lineWidth = 2;
		this.opecontext.strokeStyle = "#888888";
		this.opecontext.beginPath();
		if (this.drawing_type == "line") {
			this.opecontext.moveTo(this.touchpoints["1"].pos.x, this.touchpoints["1"].pos.y);
			this.opecontext.lineTo(this.touchpoints["2"].pos.x, this.touchpoints["2"].pos.y);
		}else if (this.drawing_type == "box") {
			var lt = {}, rb = {};
			if (this.touchpoints["1"].pos.x > this.touchpoints["2"].pos.x) {
				lt["x"] = this.touchpoints["2"].pos.x;
				rb["x"] = this.touchpoints["1"].pos.x - this.touchpoints["2"].pos.x;
			}else{
				lt["x"] = this.touchpoints["1"].pos.x;
				rb["x"] = this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x;
			}
			if (this.touchpoints["1"].pos.y > this.touchpoints["2"].pos.y) {
				lt["y"] = this.touchpoints["2"].pos.y;
				rb["y"] = this.touchpoints["1"].pos.y - this.touchpoints["2"].pos.y;
			}else{
				lt["y"] = this.touchpoints["1"].pos.y;
				rb["y"] = this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y;
			}
			this.opecontext.strokeRect(lt.x,lt.y, rb.x, rb.y);
		}else if (this.drawing_type == "circle") {
			var distance = Math.sqrt(
				(this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x)
				* (this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x)
				+
				(this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y)
				* (this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y)
			);
			this.opecontext.arc(this.touchpoints["1"].pos.x,this.touchpoints["1"].pos.y,distance,0/180*Math.PI,360/180*Math.PI);
		}else if (this.drawing_type == "triangle") {
			var top2nd = {}, top3rd = {};
			var ang_top = {};
			if (this.touchpoints["1"].x > this.touchpoints["2"].x) {
				if (event.shiftKey) {
					top2nd["x"] = this.touchpoints["2"].x;
					top3rd["x"] = this.touchpoints["2"].x;
					ang_top["x"] = this.touchpoints["1"].x;
				}else{
					top2nd["x"] = this.touchpoints["1"].x;
					top2nd["sx"] = this.touchpoints["1"].x - this.touchpoints["2"].x;
					top3rd["x"] = this.touchpoints["2"].x;
					ang_top["x"] = top3rd.x + (top2nd["sx"]/2);
				}
			}else{
				if (event.shiftKey) {
					top2nd["x"] = this.touchpoints["2"].x;
					top3rd["x"] = this.touchpoints["2"].x;
					ang_top["x"] = this.touchpoints["1"].x;
				}else{
					top2nd["x"] = this.touchpoints["1"].x;
					top3rd["sx"] = this.touchpoints["2"].x - this.touchpoints["1"].x;
					top3rd["x"] = this.touchpoints["2"].x;
					ang_top["x"] = top2nd.x + (top3rd["sx"]/2);
				}
			}
			if (this.touchpoints["1"].y > this.touchpoints["2"].y) {
				if (event.shiftKey) {
					top2nd["y"] = this.touchpoints["1"].y;
					top2nd["sy"] = this.touchpoints["1"].y - this.touchpoints["2"].y;
					top3rd["y"] = this.touchpoints["2"].y;
					ang_top["y"] = top3rd.y + (top2nd["sy"]/2);
				}else{
					top2nd["y"] = this.touchpoints["2"].y;
					top3rd["y"] = this.touchpoints["2"].y;
					ang_top["y"] =  this.touchpoints["1"].y;
				}
			}else{
				if (event.shiftKey) {
					top2nd["y"] = this.touchpoints["1"].y;
					top3rd["sy"] = this.touchpoints["2"].y - this.touchpoints["1"].y;
					top3rd["y"] = this.touchpoints["2"].y;
					ang_top["y"] = top2nd.y + (top3rd["sy"]/2);
				}else{
					top2nd["y"] = this.touchpoints["2"].y;
					top3rd["y"] = this.touchpoints["2"].y;
					ang_top["y"] = this.touchpoints["1"].y;
				}
			}
			this.opecontext.moveTo(ang_top.x, ang_top.y);
			this.opecontext.lineTo(top2nd.x, top2nd.y);
			this.opecontext.lineTo(top3rd.x, top3rd.y);
			this.opecontext.lineTo(ang_top.x, ang_top.y);
		}
		this.opecontext.closePath();
		this.opecontext.stroke();
		if (event.pointerId == this.touchpoints["2"].id) {
			this.touchpoints["2"].pos = pos;
		}
	}
	this.drawing = false;
}
Draw["drawshape_function_end"] = function (event, pos) {
	var is_executedraw = false;
	var decidepos = [];
	var temppres = 0.5;
	//if (event.shiftKey) {
	if ((this.drawpoints.length > 0)) { //マウス・ペン
		/*if (this.drawpoints.length < 2) {
			this.drawpoints.push(pos);
		}else{
			this.drawpoints[1] = pos;
		}*/
		if (Draw.pressedKey != "27") {
			this.context.restore();
			this.pen.prepare(event,this.context,temppres);
			if (this.drawing_type == "line") {
				decidepos.push({x:this.drawpoints[0].x, y:this.drawpoints[0].y});
				decidepos.push({x:this.drawpoints[1].x, y:this.drawpoints[1].y});
			}else if (this.drawing_type == "box") {
				decidepos.push({x:this.drawpoints[0].x, y:this.drawpoints[0].y});
				decidepos.push({x:this.drawpoints[0].x, y:this.drawpoints[1].y});
				decidepos.push({x:this.drawpoints[1].x, y:this.drawpoints[1].y});
				decidepos.push({x:this.drawpoints[1].x, y:this.drawpoints[0].y});
				decidepos.push({x:this.drawpoints[0].x, y:this.drawpoints[0].y});
			}else if (this.drawing_type == "circle") {
				var distance = Math.sqrt(
					(this.drawpoints[1].x - this.drawpoints[0].x)
					* (this.drawpoints[1].x - this.drawpoints[0].x)
					+
					(this.drawpoints[1].y - this.drawpoints[0].y)
					* (this.drawpoints[1].y - this.drawpoints[0].y)
				);
				this.context.beginPath();
				this.context.arc(this.drawpoints[0].x,this.drawpoints[0].y,distance,0/180*Math.PI,360/180*Math.PI);
				this.context.stroke();
				this.context.closePath();
				is_executedraw = true;
			}else if (this.drawing_type == "triangle") {
				var top2nd = {}, top3rd = {};
				var ang_top = {};
				if (this.drawpoints[0].x > this.drawpoints[1].x) {
					if (event.shiftKey) {
						top2nd["x"] = this.drawpoints[1].x;
						top3rd["x"] = this.drawpoints[1].x;
						ang_top["x"] = this.drawpoints[0].x;
					}else{
						top2nd["x"] = this.drawpoints[0].x;
						top2nd["sx"] = this.drawpoints[0].x - this.drawpoints[1].x;
						top3rd["x"] = this.drawpoints[1].x;
						ang_top["x"] = top3rd.x + (top2nd["sx"]/2);
					}
				}else{
					if (event.shiftKey) {
						top2nd["x"] = this.drawpoints[1].x;
						top3rd["x"] = this.drawpoints[1].x;
						ang_top["x"] = this.drawpoints[0].x;
					}else{
						top2nd["x"] = this.drawpoints[0].x;
						top3rd["sx"] = this.drawpoints[1].x - this.drawpoints[0].x;
						top3rd["x"] = this.drawpoints[1].x;
						ang_top["x"] = top2nd.x + (top3rd["sx"]/2);
					}
				}
				if (this.drawpoints[0].y > this.drawpoints[1].y) {
					if (event.shiftKey) {
						top2nd["y"] = this.drawpoints[0].y;
						top2nd["sy"] = this.drawpoints[0].y - this.drawpoints[1].y;
						top3rd["y"] = this.drawpoints[1].y;
						ang_top["y"] = top3rd.y + (top2nd["sy"]/2);
					}else{
						top2nd["y"] = this.drawpoints[1].y;
						top3rd["y"] = this.drawpoints[1].y;
						ang_top["y"] =  this.drawpoints[0].y;
					}
				}else{
					if (event.shiftKey) {
						top2nd["y"] = this.drawpoints[0].y;
						top3rd["sy"] = this.drawpoints[1].y - this.drawpoints[0].y;
						top3rd["y"] = this.drawpoints[1].y;
						ang_top["y"] = top2nd.y + (top3rd["sy"]/2);
					}else{
						top2nd["y"] = this.drawpoints[1].y;
						top3rd["y"] = this.drawpoints[1].y;
						ang_top["y"] = this.drawpoints[0].y;
					}
				}
				decidepos.push(ang_top);
				decidepos.push(top2nd);
				decidepos.push(top3rd);
				decidepos.push(ang_top);
			}
		}
	}else if (this.touchpoints["1"] && this.touchpoints["2"] && this.touchpoints["1"].id != this.touchpoints["2"].id) {
		if (event.pointerId != this.touchpoints["1"].id ) {
			this.context.restore();
			this.pen.prepare(event,this.context,temppres);
			if (this.drawing_type == "line") {
				decidepos.push({x:this.touchpoints["1"].pos.x, y:this.touchpoints["1"].pos.y});
				decidepos.push({x:this.touchpoints["2"].pos.x, y:this.touchpoints["2"].pos.y});
			}else if (this.drawing_type == "box") {
				decidepos.push({x:this.touchpoints["1"].pos.x, y:this.touchpoints["1"].pos.y});
				decidepos.push({x:this.touchpoints["2"].pos.x, y:this.touchpoints["1"].pos.y});
				decidepos.push({x:this.touchpoints["2"].pos.x, y:this.touchpoints["2"].pos.y});
				decidepos.push({x:this.touchpoints["1"].pos.x, y:this.touchpoints["2"].pos.y});
				decidepos.push({x:this.touchpoints["1"].pos.x, y:this.touchpoints["1"].pos.y});
			}else if (this.drawing_type == "circle") {
				var distance = Math.sqrt(
					(this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x)
					* (this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x)
					+
					(this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y)
					* (this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y)
				);
				this.context.beginPath();
				this.context.arc(this.touchpoints["1"].pos.x,this.touchpoints["1"].pos.y,distance,0/180*Math.PI,360/180*Math.PI);
				this.context.stroke();
				this.context.closePath();
				is_executedraw = true;
			}else if (this.drawing_type == "triangle") {
				var top2nd = {}, top3rd = {};
				var ang_top = {};
				if (this.touchpoints["1"].x > this.touchpoints["2"].x) {
					if (event.shiftKey) {
						top2nd["x"] = this.touchpoints["2"].x;
						top3rd["x"] = this.touchpoints["2"].x;
						ang_top["x"] = this.touchpoints["1"].x;
					}else{
						top2nd["x"] = this.touchpoints["1"].x;
						top2nd["sx"] = this.touchpoints["1"].x - this.touchpoints["2"].x;
						top3rd["x"] = this.touchpoints["2"].x;
						ang_top["x"] = top3rd.x + (top2nd["sx"]/2);
					}
				}else{
					if (event.shiftKey) {
						top2nd["x"] = this.touchpoints["2"].x;
						top3rd["x"] = this.touchpoints["2"].x;
						ang_top["x"] = this.touchpoints["1"].x;
					}else{
						top2nd["x"] = this.touchpoints["1"].x;
						top3rd["sx"] = this.touchpoints["2"].x - this.touchpoints["1"].x;
						top3rd["x"] = this.touchpoints["2"].x;
						ang_top["x"] = top2nd.x + (top3rd["sx"]/2);
					}
				}
				if (this.touchpoints["1"].y > this.touchpoints["2"].y) {
					if (event.shiftKey) {
						top2nd["y"] = this.touchpoints["1"].y;
						top2nd["sy"] = this.touchpoints["1"].y - this.touchpoints["2"].y;
						top3rd["y"] = this.touchpoints["2"].y;
						ang_top["y"] = top3rd.y + (top2nd["sy"]/2);
					}else{
						top2nd["y"] = this.touchpoints["2"].y;
						top3rd["y"] = this.touchpoints["2"].y;
						ang_top["y"] =  this.touchpoints["1"].y;
					}
				}else{
					if (event.shiftKey) {
						top2nd["y"] = this.touchpoints["1"].y;
						top3rd["sy"] = this.touchpoints["2"].y - this.touchpoints["1"].y;
						top3rd["y"] = this.touchpoints["2"].y;
						ang_top["y"] = top2nd.y + (top3rd["sy"]/2);
					}else{
						top2nd["y"] = this.touchpoints["2"].y;
						top3rd["y"] = this.touchpoints["2"].y;
						ang_top["y"] = this.touchpoints["1"].y;
					}
				}
				decidepos.push(ang_top);
				decidepos.push(top2nd);
				decidepos.push(top3rd);
				decidepos.push(ang_top);
			}
		}
	}
	if (this.drawing_type != "circle") {
		//this.pen.prepare(event,this.context,null);
		for (var i = 1; i < decidepos.length; i++) {
			this.pen.prepare(event,this.context,temppres);
			this.pen.drawMain(this.context,
				decidepos[i-1].x,decidepos[i-1].y,
				decidepos[i].x,decidepos[i].y,
				event,this.elementParameter);
			is_executedraw = true;
		}
	}
	if (is_executedraw) {
		//---save undo
		this.undo_function_end();
		/*this.canundo = true;
		this.undohist.push(new UndoBuffer(UndoType.paint,Draw.context.canvas,Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1])));
		this.undohist[this.undohist.length-1].prev_image = Draw.context.createImageData(Draw.canvassize[0],Draw.canvassize[1]);
		this.undohist[this.undohist.length-1].prev_image = this.currentLayer.prev_image;
		//this.undohist.push(new UndoBuffer(UndoType.paint,Draw.context.canvas,Draw.currentLayer.prev_image));
		this.undoindex = this.undohist.length-1;
		if (this.undohist.length > this.defaults.undo.max) {
			var o = this.undohist.shift();
			//o.destroy();
			o = null;
			this.undoindex = this.undohist.length-1;
		}
		this.toggleUndo(true);*/
	}
	for (var i = 0; i < this.drawpoints.length; i++) this.drawpoints[i] = null;
	this.drawpoints.splice(0,this.drawpoints.length);
	this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
}
