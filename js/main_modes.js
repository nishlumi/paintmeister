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
	if (this.select_type == "tempdraw") return;
	if (this.select_type == "move") {
		//if (this.selectors.items.length < 1) return;
		var o = this.select_clipboard; //this.selectors.items[0];
		o.selectType = selectionType.move;
		//if (o.status != selectionStatus.paste_begin) return;
		o.destx = pos.x;
		o.desty = pos.y;
		o.origdestx = pos.x;
		o.origdesty = pos.y;
		o.status = selectionStatus.pasting;
		//this.opeselcontext.isPointInPath(pos.x,pos.y)
		return;
	}
	if (this.select_type == "rotate") {
		var o = this.select_clipboard;
		o.selectType = selectionType.rotate;
		o.status = selectionStatus.pasting;
		//o.rotateangle = 0;
		if (o.destx <= 0) o.destx = pos.x;
		if (o.desty <= 0) o.desty = pos.y;
		if (o.origdestx <= 0) o.origdestx = pos.x;
		if (o.origdesty <= 0) o.origdesty = pos.y;
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
	if (this.select_type == "tempdraw") return;
	if ((this.select_clipboard) && (this.select_clipboard.status == selectionStatus.pasting)) {
		if (this.select_clipboard.selectType == selectionType.move) {
			var o = this.select_clipboard;
			this.opeselcontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			//this.opeselcontext.drawImage(this.canvas,pos.x-(this.select_clipboard.w*0.5),pos.y-(this.select_clipboard.h*0.5));
			//補助線は選択操作キャンバスのみで描く(元オブジェクトを汚さないため)
			//this.drawAssistLine(this.canvas,this.opeselcontext,
			//{"x":pos.x-(this.select_clipboard.w*0.5), "y":pos.y-(this.select_clipboard.h*0.5)});
			this.opeselcontext.save();
			this.opeselcontext.translate(o.origdestx,o.origdesty);
			this.opeselcontext.rotate(o.rotateangle/180*Math.PI);
			this.opeselcontext.translate(-1 * (o.w/2),-1 * (o.h/2));
			this.opeselcontext.drawImage(this.canvas,0,0);
			//補助線は選択操作キャンバスのみで描く(元オブジェクトを汚さないため)
			this.drawAssistLine(this.canvas,this.opeselcontext,
			{"x":0, "y":0});
			this.opeselcontext.restore();

			//this.select_clipboard.oldx = this.select_clipboard.x;
			//this.select_clipboard.oldy = this.select_clipboard.y;
			//---中心座標としての意味合いで保存
			this.select_clipboard.destx = pos.x;
			this.select_clipboard.desty = pos.y;
			this.select_clipboard.origdestx = pos.x;
			this.select_clipboard.origdesty = pos.y;
		}else
		if (this.select_clipboard.selectType == selectionType.rotate) {
			var basedistance = 1;
			var o = this.select_clipboard;
			//console.log(pos.x + " - " + o.destx);
			if (pos.x < this.select_clipboard.destx) {
				if ((o.destx - pos.x) > basedistance) {
					o.rotateangle--;
				}
				if (o.rotateangle < 0) o.rotateangle = 360;
			}else{
				if ((pos.x - o.destx) > basedistance) {
					o.rotateangle++;
				}
				if (o.rotateangle > 360) o.rotateangle = 0;
			}
			//console.log("angle="+o.rotateangle);
			this.opeselcontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			this.opeselcontext.save();
			this.opeselcontext.translate(o.origdestx,o.origdesty);
			this.opeselcontext.rotate(o.rotateangle/180*Math.PI);
			this.opeselcontext.translate(-1 * (o.w/2),-1 * (o.h/2));
			this.opeselcontext.drawImage(this.canvas,0,0);
			//補助線は選択操作キャンバスのみで描く(元オブジェクトを汚さないため)
			this.drawAssistLine(this.canvas,this.opeselcontext,
			{"x":0, "y":0});
			this.opeselcontext.restore();
			o.destx = pos.x;
			o.desty = pos.y;
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
	if (this.select_type == "tempdraw") return;
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
	if (this.select_type == "rotate") {
		o = this.select_clipboard; //this.selectors.items[0];
		
		if (o.status == selectionStatus.end) return;
		if (o.status == selectionStatus.pasting) {
			o.status = selectionStatus.paste_begin;
		}
		o.destx = pos.x-(o.w*0.5);
		o.desty = pos.y-(o.h*0.5);
		return;
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
		o.addPoint(o.x, o.y);
		o.addPoint(o.x+o.w, o.y);
		o.addPoint(pos.x, pos.y);
		o.addPoint(o.x, o.y+o.h);
		
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
	//---本来のキャンバスにもサブパスをセット
	o.setToContext();
}
Draw["select_function_execute"] = function(event) {
	if (this.select_type == "tempdraw") return;
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
		var tmpcan = document.createElement("canvas");
		//tmpcan.style.display = "none";
		tmpcan.style.position = "absolute";
		tmpcan.style.top = "0px";
		tmpcan.style.left = "0px;" 
		tmpcan.id = "tmpcan";
		document.body.appendChild(tmpcan);
		if (this.select_type == "box") {
			this.select_clipboard.selectType = selectionType.box;
			var ang = o.calculateAngle();
			ang.rb.x = ang.lt.x + o.w;
			ang.rb.y = ang.lt.y + o.h;
			imgdata = this.context.getImageData(ang.lt.x,ang.lt.y, o.w,o.h);
			this.select_clipboard.oldx = ang.lt.x;
			this.select_clipboard.oldy = ang.lt.y;
			this.select_clipboard.destx = ang.lt.x;
			this.select_clipboard.desty = ang.lt.y;
			this.select_clipboard.origdestx = ang.lt.x;
			this.select_clipboard.origdesty = ang.lt.y;
			//console.log(ang);
		}else if (this.select_type == "free") {
			this.select_clipboard.selectType = selectionType.free;
			//---将来のために一応セットまでしておく
			var ang = locateMinMaxPosition(o.points);
			imgdata = this.context.getImageData(ang.lt.x,ang.lt.y, 
				ang.rb.x-ang.lt.x, ang.rb.y-ang.lt.y);
			this.select_clipboard.oldx = ang.lt.x;
			this.select_clipboard.oldy = ang.lt.y;
			this.select_clipboard.w = ang.rb.x-ang.lt.x;
			this.select_clipboard.h = ang.rb.y-ang.lt.y;
			this.select_clipboard.destx = ang.lt.x;
			this.select_clipboard.desty = ang.lt.y;
			this.select_clipboard.origdestx = ang.lt.x;
			this.select_clipboard.origdesty = ang.lt.y;
			//console.log(ang);
		}
		tmpcan.width = imgdata.width;
		tmpcan.height = imgdata.height;
		var tmpcancon = tmpcan.getContext("2d");
		tmpcancon.putImageData(imgdata,0,0);
		//---クリップボード代わりにダミーキャンバスにコピー退避
		//   クリップエリア適用も兼ねて、1回目はオリジナルのキャンバス含めたコピー描画
		this.canvas.width = this.context.canvas.width; //imgdata.width;
		this.canvas.height = this.context.canvas.height; //imgdata.height;
		this.canvas.globalAlpha = this.context.globalAlpha;
		this.canvas.globalCompositeOperation = this.context.globalCompositeOperation;
		this.context.save();
		var can2d = this.canvas.getContext("2d");
		can2d.lineWidth = 1;
		can2d.strokeStyle = "rgba(0,0,0,1)";
		can2d.shadowBlur = 0;
		if (this.select_type == "free") {
			//---選択モードが自由の場合はクリップエリア設定開始
			can2d.save();
			can2d.beginPath();
			can2d.moveTo(o.points[0].x,o.points[0].y);
			for (var i = 0; i < o.points.length; i++) {
				can2d.lineTo(o.points[i].x,o.points[i].y);
			}
			can2d.closePath();
			can2d.clip();
		}
		can2d.clearRect(0,0,this.canvas.width,this.canvas.height);
		//can2d.putImageData(imgdata,0,0);
		can2d.drawImage(tmpcan,ang.lt.x,ang.lt.y);
		can2d.restore();
		$("#tmpcan").remove();
		//---2回目は本来やるべき、キャンバスサイズを絞ったコピー
		imgdata = can2d.getImageData(ang.lt.x,ang.lt.y, 
				ang.rb.x-ang.lt.x, ang.rb.y-ang.lt.y);
		this.canvas.width = imgdata.width;
		this.canvas.height = imgdata.height;
		can2d.clearRect(0,0,this.canvas.width,this.canvas.height);
		can2d.putImageData(imgdata,0,0);
		
		document.getElementById("sel_operationtype_paste").className = "button uibutton-mid flatbutton";
	}else if (this.select_operation == "paste") {
		var o = this.select_clipboard; //this.selectors.items[0];
		if ((o.status == selectionStatus.pasting) || (o.status == selectionStatus.paste_begin)) {
			//---現在のキャンバスに固定
			//var imgdata = this.canvas.getContext("2d").getImageData(0,0,this.canvas.width,this.canvas.height);
			//this.context.putImageData(imgdata,o.destx,o.desty);
			//---前の選択キャンバス、操作キャンバスをクリア
			this.opeselcontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			this.undo_function_begin(true);
			if (o.action == selectActionType.cut) {
				var ang = o.calculateAngle();
				if (o.selectType = selectionType.free) {
					//---選択モードが自由の場合は保存したポイントからパスを設定して手動消しゴムクリア
					o.cutfrom.save();
					o.cutfrom.globalCompositeOperation = "destination-out";
					o.cutfrom.fillStyle = "#000000";
					
					o.cutfrom.beginPath();
					o.cutfrom.moveTo(o.points[0].x,o.points[0].y);
					for (var i = 0; i < o.points.length; i++) {
						o.cutfrom.lineTo(o.points[i].x,o.points[i].y);
					}
					o.cutfrom.closePath();
					o.cutfrom.fill();
					o.cutfrom.restore();
					
				}else{
					o.cutfrom.clearRect(o.oldx,o.oldy, o.w,o.h);
				}
			}
			this.context.globalAlpha = 1.0;
			this.context.shadowBlur = 0;
			
			this.context.save();
			this.context.translate(o.origdestx,o.origdesty);
			this.context.rotate(o.rotateangle/180*Math.PI);
			this.context.translate(-1 * (o.w/2),-1 * (o.h/2));
			this.context.drawImage(this.canvas,0,0);
			//this.context.drawImage(this.canvas,o.destx,o.desty);
			
			/*this.context.drawImage(this.canvas,
				1,1,this.canvas.width-3,this.canvas.height-3,
				o.destx+1,o.desty+1,this.canvas.width-2,this.canvas.height-2);*/
			
			//---save undo
			this.undo_function_end();
			this.context.restore();
			o.status = selectionStatus.end;
			if (this.selectors.items.length > 0) this.selectors.remove(this.selectors.items[0].id);
			document.getElementById("sel_operationtype_paste").title = _T("sel_operationtype_paste_title"); //"貼り付け";
			document.getElementById("sel_operationtype_paste").innerHTML = "&#9744";
			var selmove = document.getElementById("sel_seltype_box");
			selmove.click();
		}else{
			//---貼り付け開始
			o.status = selectionStatus.paste_begin;
			o.selectType = selectionType.move;
			//o.action = selectActionType.paste;
			//---前の選択キャンバス、操作キャンバスをクリア
			this.opeselcontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
			//this.opeselcontext.drawImage(this.canvas,this.selectors.items[0].x,this.selectors.items[0].y);
			this.opeselcontext.drawImage(this.canvas,this.select_clipboard.destx,this.select_clipboard.desty);
			document.getElementById("sel_operationtype_paste").title = _T("sel_operationtype_paste_title2"); //"貼り付けの確定";
			document.getElementById("sel_operationtype_paste").innerHTML = "&#9745";
			var selmove = document.getElementById("sel_seltype_move");
			selmove.click();
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
		
		//console.log("ang=");
		//console.log(ang);
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
			}else if ((this.drawing_type == "box") || (this.drawing_type == "html")) {
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
				var midpos = {x:0, y:0};
				if (this.drawpoints[0].x > this.drawpoints[1].x) {
					midpos.x = this.drawpoints[1].x + ((this.drawpoints[0].x - this.drawpoints[1].x)/2);
				}else{
					midpos.x = this.drawpoints[0].x + ((this.drawpoints[1].x - this.drawpoints[0].x)/2);
				}
				if (this.drawpoints[0].y > this.drawpoints[1].y) {
					midpos.y = this.drawpoints[1].y + ((this.drawpoints[0].y - this.drawpoints[1].y)/2);
				}else{
					midpos.y = this.drawpoints[0].y + ((this.drawpoints[1].y - this.drawpoints[0].y)/2);
				}
				var distance = Math.sqrt(
					(midpos.x - this.drawpoints[0].x)
					* (midpos.x - this.drawpoints[0].x)
					+
					(midpos.y - this.drawpoints[0].y)
					* (midpos.y - this.drawpoints[0].y)
				);
				this.opecontext.arc(midpos.x,midpos.y,distance,0/180*Math.PI,360/180*Math.PI);
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
		}else if ((this.drawing_type == "box") || (this.drawing_type == "html")) {
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
			var midpos = {x:0, y:0};
			if (this.touchpoints["1"].pos.x > this.touchpoints["2"].pos.x) {
				midpos.x = this.touchpoints["2"].pos.x + ((this.touchpoints["1"].pos.x - this.touchpoints["2"].pos.x)/2);
			}else{
				midpos.x = this.touchpoints["1"].pos.x + ((this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x)/2);
			}
			if (this.touchpoints["1"].pos.y > this.touchpoints["2"].pos.y) {
				midpos.y = this.touchpoints["2"].pos.y + ((this.touchpoints["1"].pos.y - this.touchpoints["2"].pos.y)/2);
			}else{
				midpos.y = this.touchpoints["1"].pos.y + ((this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y)/2);
			}
			var distance = Math.sqrt(
				(midpos.x - this.touchpoints["1"].pos.x)
				* (midpos.x - this.touchpoints["1"].pos.x)
				+
				(midpos.y - this.touchpoints["1"].pos.y)
				* (midpos.y - this.touchpoints["1"].pos.y)
			);
			this.opecontext.arc(midpos.x,midpos.y,distance,0/180*Math.PI,360/180*Math.PI);
				
			/*var distance = Math.sqrt(
				(this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x)
				* (this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x)
				+
				(this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y)
				* (this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y)
			);
			this.opecontext.arc(this.touchpoints["1"].pos.x,this.touchpoints["1"].pos.y,distance,0/180*Math.PI,360/180*Math.PI);*/
		}else if (this.drawing_type == "triangle") {
			var top2nd = {}, top3rd = {};
			var ang_top = {};
			if (this.touchpoints["1"].pos.x > this.touchpoints["2"].pos.x) {
				if (event.shiftKey) {
					top2nd["x"] = this.touchpoints["2"].pos.x;
					top3rd["x"] = this.touchpoints["2"].pos.x;
					ang_top["x"] = this.touchpoints["1"].pos.x;
				}else{
					top2nd["x"] = this.touchpoints["1"].pos.x;
					top2nd["sx"] = this.touchpoints["1"].pos.x - this.touchpoints["2"].pos.x;
					top3rd["x"] = this.touchpoints["2"].pos.x;
					ang_top["x"] = top3rd.x + (top2nd["sx"]/2);
				}
			}else{
				if (event.shiftKey) {
					top2nd["x"] = this.touchpoints["2"].pos.x;
					top3rd["x"] = this.touchpoints["2"].pos.x;
					ang_top["x"] = this.touchpoints["1"].pos.x;
				}else{
					top2nd["x"] = this.touchpoints["1"].pos.x;
					top3rd["sx"] = this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x;
					top3rd["x"] = this.touchpoints["2"].pos.x;
					ang_top["x"] = top2nd.x + (top3rd["sx"]/2);
				}
			}
			if (this.touchpoints["1"].pos.y > this.touchpoints["2"].pos.y) {
				if (event.shiftKey) {
					top2nd["y"] = this.touchpoints["1"].pos.y;
					top2nd["sy"] = this.touchpoints["1"].pos.y - this.touchpoints["2"].pos.y;
					top3rd["y"] = this.touchpoints["2"].pos.y;
					ang_top["y"] = top3rd.y + (top2nd["sy"]/2);
				}else{
					top2nd["y"] = this.touchpoints["2"].pos.y;
					top3rd["y"] = this.touchpoints["2"].pos.y;
					ang_top["y"] =  this.touchpoints["1"].pos.y;
				}
			}else{
				if (event.shiftKey) {
					top2nd["y"] = this.touchpoints["1"].pos.y;
					top3rd["sy"] = this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y;
					top3rd["y"] = this.touchpoints["2"].pos.y;
					ang_top["y"] = top2nd.y + (top3rd["sy"]/2);
				}else{
					top2nd["y"] = this.touchpoints["2"].pos.y;
					top3rd["y"] = this.touchpoints["2"].pos.y;
					ang_top["y"] = this.touchpoints["1"].pos.y;
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
	this.elementParameter["current"] = this.pen.current;
	this.elementParameter["keyCode"] = this.pressedKey;
	this.elementParameter["pointHistory"] = [];
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
				this.prepare_drawnewshape(event,this.drawing_type,decidepos);
				decidepos.splice(0,decidepos.length);
			}else if (this.drawing_type == "box") {
				decidepos.push({x:this.drawpoints[0].x, y:this.drawpoints[0].y});
				decidepos.push({x:this.drawpoints[0].x, y:this.drawpoints[1].y});
				decidepos.push({x:this.drawpoints[1].x, y:this.drawpoints[1].y});
				decidepos.push({x:this.drawpoints[1].x, y:this.drawpoints[0].y});
				decidepos.push({x:this.drawpoints[0].x, y:this.drawpoints[0].y});
				this.prepare_drawnewshape(event,this.drawing_type,decidepos);
				decidepos.splice(0,decidepos.length);
			}else if (this.drawing_type == "circle") {
				decidepos.push({x:this.drawpoints[0].x, y:this.drawpoints[0].y});
				decidepos.push({x:this.drawpoints[1].x, y:this.drawpoints[1].y});
				this.prepare_drawnewshape(event,this.drawing_type,decidepos);
				decidepos.splice(0,decidepos.length);
				/*var distance = Math.sqrt(
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
				is_executedraw = true;*/
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
				decidepos.push({"x":ang_top.x,"y":ang_top.y});
				this.prepare_drawnewshape(event,this.drawing_type,decidepos);
				decidepos.splice(0,decidepos.length);
			}else if (this.drawing_type == "html") {
				this.variables["sv_drawhtml_pos_begin"] = {x:this.drawpoints[0].x, y:this.drawpoints[0].y};
				this.variables["sv_drawhtml_pos_end"] = {x:this.drawpoints[1].x, y:this.drawpoints[1].y};
				$("#inp_htmlbox_src").focus();
				$("#dlg_htmlbox").css({"display":"block"});
			}
		}
	}else if (this.touchpoints["1"] && this.touchpoints["2"] && this.touchpoints["1"].id != this.touchpoints["2"].id) {
		if (event.pointerId != this.touchpoints["1"].id ) {
			this.context.restore();
			this.pen.prepare(event,this.context,temppres);
			if (this.drawing_type == "line") {
				decidepos.push({x:this.touchpoints["1"].pos.x, y:this.touchpoints["1"].pos.y});
				decidepos.push({x:this.touchpoints["2"].pos.x, y:this.touchpoints["2"].pos.y});
				this.prepare_drawnewshape(event,this.drawing_type,decidepos);
				decidepos.splice(0,decidepos.length);
			}else if (this.drawing_type == "box") {
				decidepos.push({x:this.touchpoints["1"].pos.x, y:this.touchpoints["1"].pos.y});
				decidepos.push({x:this.touchpoints["2"].pos.x, y:this.touchpoints["1"].pos.y});
				decidepos.push({x:this.touchpoints["2"].pos.x, y:this.touchpoints["2"].pos.y});
				decidepos.push({x:this.touchpoints["1"].pos.x, y:this.touchpoints["2"].pos.y});
				decidepos.push({x:this.touchpoints["1"].pos.x, y:this.touchpoints["1"].pos.y});
				this.prepare_drawnewshape(event,this.drawing_type,decidepos);
				decidepos.splice(0,decidepos.length);
			}else if (this.drawing_type == "circle") {
				decidepos.push({x:this.touchpoints["1"].pos.x, y:this.touchpoints["1"].pos.y});
				decidepos.push({x:this.touchpoints["2"].pos.x, y:this.touchpoints["2"].pos.y});
				this.prepare_drawnewshape(event,this.drawing_type,decidepos);
				decidepos.splice(0,decidepos.length);
				/*var distance = Math.sqrt(
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
				is_executedraw = true;*/
			}else if (this.drawing_type == "triangle") {
				var top2nd = {}, top3rd = {};
				var ang_top = {};
				if (this.touchpoints["1"].pos.x > this.touchpoints["2"].pos.x) {
					if (event.shiftKey) {
						top2nd["x"] = this.touchpoints["2"].pos.x;
						top3rd["x"] = this.touchpoints["2"].pos.x;
						ang_top["x"] = this.touchpoints["1"].pos.x;
					}else{
						top2nd["x"] = this.touchpoints["1"].pos.x;
						top2nd["sx"] = this.touchpoints["1"].pos.x - this.touchpoints["2"].pos.x;
						top3rd["x"] = this.touchpoints["2"].pos.x;
						ang_top["x"] = top3rd.x + (top2nd["sx"]/2);
					}
				}else{
					if (event.shiftKey) {
						top2nd["x"] = this.touchpoints["2"].pos.x;
						top3rd["x"] = this.touchpoints["2"].pos.x;
						ang_top["x"] = this.touchpoints["1"].pos.x;
					}else{
						top2nd["x"] = this.touchpoints["1"].pos.x;
						top3rd["sx"] = this.touchpoints["2"].pos.x - this.touchpoints["1"].pos.x;
						top3rd["x"] = this.touchpoints["2"].pos.x;
						ang_top["x"] = top2nd.x + (top3rd["sx"]/2);
					}
				}
				if (this.touchpoints["1"].pos.y > this.touchpoints["2"].pos.y) {
					if (event.shiftKey) {
						top2nd["y"] = this.touchpoints["1"].pos.y;
						top2nd["sy"] = this.touchpoints["1"].pos.y - this.touchpoints["2"].pos.y;
						top3rd["y"] = this.touchpoints["2"].pos.y;
						ang_top["y"] = top3rd.y + (top2nd["sy"]/2);
					}else{
						top2nd["y"] = this.touchpoints["2"].pos.y;
						top3rd["y"] = this.touchpoints["2"].pos.y;
						ang_top["y"] =  this.touchpoints["1"].pos.y;
					}
				}else{
					if (event.shiftKey) {
						top2nd["y"] = this.touchpoints["1"].pos.y;
						top3rd["sy"] = this.touchpoints["2"].pos.y - this.touchpoints["1"].pos.y;
						top3rd["y"] = this.touchpoints["2"].pos.y;
						ang_top["y"] = top2nd.y + (top3rd["sy"]/2);
					}else{
						top2nd["y"] = this.touchpoints["2"].pos.y;
						top3rd["y"] = this.touchpoints["2"].pos.y;
						ang_top["y"] = this.touchpoints["1"].pos.y;
					}
				}
				decidepos.push(ang_top);
				decidepos.push(top2nd);
				decidepos.push(top3rd);
				decidepos.push({"x":ang_top.x,"y":ang_top.y});
				this.prepare_drawnewshape(event,this.drawing_type,decidepos);
				decidepos.splice(0,decidepos.length);
			}else if (this.drawing_type == "html") {
				this.variables["sv_drawhtml_pos_begin"] = {x:this.touchpoints["1"].pos.x, y:this.touchpoints["1"].pos.y};
				this.variables["sv_drawhtml_pos_end"] = {x:this.touchpoints["2"].pos.x, y:this.touchpoints["2"].pos.y};
				$("#dlg_htmlbox").css({"display":"block"});
			}
		}
	}
	if ((this.drawing_type != "circle") && (this.drawing_type != "html")) {
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

	}
	for (var i = 0; i < this.drawpoints.length; i++) this.drawpoints[i] = null;
	this.drawpoints.splice(0,this.drawpoints.length);
	this.opecontext.clearRect(0,0, this.canvassize[0],this.canvassize[1]);
}
/*
@param {Canvas} canvas - 描画対象のキャンバス
@param {Context} context - 描画先のコンテキスト
@param {JSON} pos - 描画先の位置（{x:0 , y:0}形式）
*/
Draw["drawAssistLine"] = function(canvas,context,pos) {
	context.strokeStyle = "rgba(15,15,15,1.0)";
	context.lineWidth = 1;
	posarr = [
		{"start":[pos.x,pos.y],"end":[pos.x+canvas.width,pos.y]},
		{"start":[pos.x+canvas.width,pos.y],"end":[pos.x+canvas.width,pos.y+canvas.height]},
		{"start":[pos.x,pos.y],"end":[pos.x,pos.y+canvas.height]},
		{"start":[pos.x,pos.y+canvas.height],"end":[pos.x+canvas.width,pos.y+canvas.height]}
	];
	for (var p in posarr) {
		var pos = posarr[p];
		var xsa = 0, ysa = 0, linelength = 15;
		if (pos.start[0] < pos.end[0]) {
			xsa = 1;
		}else if (pos.start[0] > pos.end[0]) {
			xsa = -1;
		}else{
			xsa = 0;
		}
		if (pos.start[1] < pos.end[1]) {
			ysa = 1;
		}else if (pos.start[1] > pos.end[1]) {
			ysa = -1;
		}else{
			ysa = 0;
		}
		if (xsa != 0) {
			for (var i = pos.start[0]; i < pos.end[0]; i += (linelength*2)) {
				context.beginPath();
				context.moveTo(i,pos.start[1]);
				if ((i+linelength) > (canvas.width+pos.start[0])) {
					var w = (i+linelength) - (canvas.width+pos.start[0]);
					context.lineTo(i+w,pos.start[1]);
				}else{
					context.lineTo(i+linelength,pos.start[1]);
				}
				
				context.stroke();
			}
		}
		if (ysa != 0) {
			for (var i = pos.start[1]; i < pos.end[1]; i += (linelength*2)) {
				context.beginPath();
				context.moveTo(pos.start[0],i);
				if ((i+linelength) > (canvas.height+pos.start[1])) {
					var h = (i+linelength) - (canvas.height+pos.start[1]);
					context.lineTo(pos.start[0],i+h);
				}else{
					context.lineTo(pos.start[0],i+linelength);
				}
				context.stroke();
			}
		}
	}
}
Draw["prepare_drawnewshape"] = function(event,drawtype,decidepos){
	var minmax = locateMinMaxPosition(decidepos);
	var pensize = parseInt(this.pen.current["size"]);
	var midpos = {x:0, y:0};
	if (drawtype == "circle") {
		if (decidepos[0].x > decidepos[1].x) {
			midpos.x = decidepos[1].x + ((decidepos[0].x - decidepos[1].x)/2);
		}else{
			midpos.x = decidepos[0].x + ((decidepos[1].x - decidepos[0].x)/2);
		}
		if (decidepos[0].y > decidepos[1].y) {
			midpos.y = decidepos[1].y + ((decidepos[0].y - decidepos[1].y)/2);
		}else{
			midpos.y = decidepos[0].y + ((decidepos[1].y - decidepos[0].y)/2);
		}
		var distance = Math.sqrt(
			(midpos.x - decidepos[0].x)
			* (midpos.x - decidepos[0].x)
			+
			(midpos.y - decidepos[0].y)
			* (midpos.y - decidepos[0].y)
		);
		//---円の場合は余分にサイズとって拡張
		pensize += (distance/2);
	}
	minmax.lt.x -= (pensize); //ペンの半径分は最低限拡張しておく
	minmax.lt.y -= (pensize);
	if (minmax.lt.x < 0) minmax.lt.x = 0;
	if (minmax.lt.y < 0) minmax.lt.y = 0;
	minmax.rb.x += (pensize);
	minmax.rb.y += (pensize);
	document.getElementById("btn_shapes").click();
	document.getElementById("btn_select").click();
	document.getElementById("sel_seltype_box").click();
	//選択操作
	this.select_function_start(null,minmax.lt);
	this.select_function_end(null,minmax.rb);
	var o = this.selectors.items[0];
	this.select_clipboard.selectType = selectionType.box;
	var ang = o.calculateAngle();
	this.select_clipboard.oldx = ang.lt.x;
	this.select_clipboard.oldy = ang.lt.y;
	this.canvas.width = o.w; //移動線用に+2
	this.canvas.height = o.h;
	this.select_clipboard.w = this.canvas.width;
	this.select_clipboard.h = this.canvas.height;
	
	//描き込み座標変換（フロートオブジェクトに描くのでtop-leftのところからマイナスする）
	for (var i = 0; i < decidepos.length; i++) {
		decidepos[i].x -= minmax.lt.x + (pensize/2);
		decidepos[i].y -= minmax.lt.y + (pensize/2);
	}
	var can2d = this.canvas.getContext("2d");
	can2d.clearRect(0,0,this.canvas.width,this.canvas.height);
	can2d.lineWidth = 1;
	can2d.strokeStyle = "rgba(0,0,0,1)";
	can2d.shadowBlur = 0;
	can2d.save();
	
	can2d.strokeStyle = Draw.pen.current["color"];
	if (drawtype == "circle") {
		if (decidepos[0].x > decidepos[1].x) {
			midpos.x = decidepos[1].x + ((decidepos[0].x - decidepos[1].x)/2);
		}else{
			midpos.x = decidepos[0].x + ((decidepos[1].x - decidepos[0].x)/2);
		}
		if (decidepos[0].y > decidepos[1].y) {
			midpos.y = decidepos[1].y + ((decidepos[0].y - decidepos[1].y)/2);
		}else{
			midpos.y = decidepos[0].y + ((decidepos[1].y - decidepos[0].y)/2);
		}
		var distance = Math.sqrt(
			(midpos.x - decidepos[0].x)
			* (midpos.x - decidepos[0].x)
			+
			(midpos.y - decidepos[0].y)
			* (midpos.y - decidepos[0].y)
		);
		can2d.beginPath();
		//can2d.arc(midpos.x,midpos.y,distance,0/180*Math.PI,360/180*Math.PI);
		can2d.arc(o.w/2,o.h/2,distance,0/180*Math.PI,360/180*Math.PI);
		can2d.stroke();
		can2d.closePath();
	}else{
		this.pen.prepare(event,can2d,0.5);
		for (var i = 1; i < decidepos.length; i++) {
			this.pen.drawMain(can2d,
				decidepos[i-1].x,decidepos[i-1].y,
				decidepos[i].x,decidepos[i].y,
				event,this.elementParameter);
		}
	}
	//移動線描画
	can2d.restore();
	//this.drawAssistLine(this.canvas,can2d);
	//クリップボードに座標情報を再セット
	var o = this.selectors.items[0];
	var ang = o.calculateAngle();
	ang.rb.x = ang.lt.x + o.w;
	ang.rb.y = ang.lt.y + o.h;
	this.select_clipboard.oldx = ang.lt.x;
	this.select_clipboard.oldy = ang.lt.y;
	this.select_clipboard.destx = ang.lt.x;
	this.select_clipboard.desty = ang.lt.y ;
	this.select_clipboard.origdestx = ang.lt.x + (o.w/2);
	this.select_clipboard.origdesty = ang.lt.y + (o.h/2);
	document.getElementById("sel_operationtype_paste").className = "button uibutton-mid flatbutton";
	document.getElementById("sel_operationtype_paste").click();
}
Draw["prepare_drawhtml"] = function(src){
	//---画面操作
	document.getElementById("btn_shapes").click();
	document.getElementById("btn_select").click();
	document.getElementById("sel_seltype_box").click();
	this.select_function_start(null,this.variables["sv_drawhtml_pos_begin"]);
	this.select_function_end(null,this.variables["sv_drawhtml_pos_end"]);
	
	//---クリップボードにコピー操作
	var o = this.selectors.items[0];
	var opt_align = $("#sel_htmlbox_align").val();
	this.select_clipboard.selectType = selectionType.box;
	var ang = o.calculateAngle();
	this.select_clipboard.oldx = ang.lt.x;
	this.select_clipboard.oldy = ang.lt.y;
	this.canvas.width = o.w; //移動線用に+2
	this.canvas.height = o.h;
	this.select_clipboard.w = this.canvas.width;
	this.select_clipboard.h = this.canvas.height;
	
	var can2d = this.canvas.getContext("2d");
	can2d.lineWidth = 1;
	can2d.shadowBlur = 0;
	can2d.strokeStyle = "rgba(0,0,0,1)";
	can2d.clearRect(0,0,this.canvas.width,this.canvas.height);
	//必要プロパティをメインのコンテキストからコピー
	can2d.fillStyle = this.context.strokeStyle;
	can2d.font = document.getElementById("inp_htmlbox_css").value;
	can2d.textAlign = opt_align;
	can2d.textBaseline = $("#sel_htmlbox_baseline").val();
	
	//文字描画開始
	if (document.getElementById("chk_text_vertical").checked) {
		var fonttext = String(can2d.font).split(/\s/g);
		var finx = -1;
		for (var f = 0; f < fonttext.length; f++) {
			if (fonttext[f].indexOf("px") > -1) {
				finx = f;
				break;
			}
		}
		var unity = parseInt(fonttext[finx]);
		if (isNaN(unity)) unity = 20;	//既定
		var tmpy = 0;
		var w = can2d.measureText(src[0]);
		var maxw = w.width;
		//---最大幅を取得
		for (var i = 1; i < src.length; i++) {
			w = can2d.measureText(src[i]);
			if (maxw < w.width) {
				maxw = w.width;
			}
		}
		//console.log("maxw="+maxw);
		//console.log(can2d.textAlign);
		for (var i = 0; i < src.length; i++) {
			var w = can2d.measureText(src[i]);
			var tmpw = 0;
			if ((opt_align == "left") || (opt_align == "start")) {
				tmpw = ((maxw - w.width)/2);
			}else if (opt_align == "right") {
				tmpw = o.w - (maxw) + ((maxw - w.width)/2);
				can2d.textAlign = "start";
			}else if (opt_align == "center") {
				tmpw = (o.w * 0.5) - (maxw/2) + ((maxw - w.width)/2);
				can2d.textAlign = "start";
			}
			//---Japanese: X座標とY座標を文字の半分の幅分ずらす
			var targetchar = "、。ぁぃぅぇぉゃゅょっ";
			if ((targetchar.indexOf(src[i]) > 0) || (src[i].charCodeAt() == 12289)) {
				//console.log(src[i] + "=" + targetchar.indexOf(src[i]));
				tmpy -= (unity/2);
				if ((src[i].charCodeAt() == 12289) || (src[i].charCodeAt() == 12290)){
					//、。の場合はもっとずらす
					tmpw += (w.width);
				}else{
					tmpw += (w.width/2);
				}
			}
			//---rotation: 90 angle right
			targetchar = "：:-ー－～()（）「」{}｛｝[]【】『』［］=＝";
			if (targetchar.indexOf(src[i]) > 0) {
				
				can2d.save();
				targetchar = "-ー－=＝～";
				if (targetchar.indexOf(src[i]) > 0) {
					can2d.translate(tmpw + (w.width),tmpy);
				}else{
					can2d.translate(tmpw + (w.width*2),tmpy);
				}
				can2d.rotate(90/180*Math.PI);
				can2d.fillText(src[i],0,0);
				targetchar = "(（「{｛[【『［";
				if (targetchar.indexOf(src[i]) > 0) {
					tmpy += (unity/2) + 5;
				}else{
					tmpy += unity + 5;
				}
				can2d.restore();
			}else{
				can2d.fillText(src[i],tmpw,tmpy);
				tmpy += unity + 5;
			}
		}
	}else{
		can2d.fillText(src, 0,0);
	}
	//移動線描画
	//this.drawAssistLine(this.canvas,can2d);
	//console.log("src="+src);
	//console.log(can2d);
	document.getElementById("sel_operationtype_paste").className = "button uibutton-mid flatbutton";
	document.getElementById("sel_operationtype_paste").click();

}
Draw["changeGrid"] = function(flag,w,h,color){
	var cw = Draw.gridcan.width;
	var ch = Draw.gridcan.height;
	
	Draw.gridcontext.clearRect(0,0,cw,ch);
	
	if (flag) {
		Draw.gridcontext.strokeStyle = color;
		Draw.gridcontext.lineWidth = 1;
		//X座標のグリッド線描画
		for (var x = w; x < cw; x += w) {
			Draw.gridcontext.beginPath();
			Draw.gridcontext.moveTo(x,0);
			Draw.gridcontext.lineTo(x,ch);
			Draw.gridcontext.stroke();
		}
		//Y座標のグリッド線描画
		for (var y = h; y < ch; y += h) {
			Draw.gridcontext.beginPath();
			Draw.gridcontext.moveTo(0,y);
			Draw.gridcontext.lineTo(cw,y);
			Draw.gridcontext.stroke();
		}
	}
	
}