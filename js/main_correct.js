Draw["correct_main"] = function (event,position,pressure) {
	var delay = {
		flag : false,
		count : 0,
		smooth : 0,
		poshist : []
	};
	var distance = 0, middistance = 0;
	var saX = 0, midsaX = 0;
	var saY = 0, midsaY = 0;
	var saPres = 0, midsaPres = 0;
	var completeCount = 0, completeMidCount = 0, completeHalf = 0;
	var pmPres = 0; //+-基準値
	
	//---prev -> start
	if (this.elementParameter["pointHistory"].length > 0) {
		//---過去座標あるまま補正に突入した場合
		middistance = Math.sqrt(
			(position.start.x - position.prev.x) * (position.start.x - position.prev.x)
			+ (position.start.y - position.prev.y) * (position.start.y - position.prev.y)
		);
		midsaX = position.start.x - position.prev.x;
		midsaY = position.start.y - position.prev.y;
		midsaPres = pressure.start - pressure.prev;
		
	}
	var ju_midsaX = Math.abs(midsaX);
	var ju_midsaY = Math.abs(midsaY);
	var ju_middistance = Math.abs(middistance);
	var ju_midsaPres = Math.abs(midsaPres);
	var midpmX = (midsaX < 0 ? -1 : 1); //+-基準値
	var midpmY = (midsaY < 0 ? -1 : 1); //+-基準値
	var midpmPres = (pressure.offset < pressure.start ? -1 : 1); //+-基準値
	
	//---start -> offset
	distance = Math.sqrt(
		(position.offset.x - position.start.x) * (position.offset.x - position.start.x)
		+ (position.offset.y - position.start.y) * (position.offset.y - position.start.y)
	);
	saX = position.offset.x - position.start.x;
	saY = position.offset.y - position.start.y;
	saPres = pressure.offset - pressure.start;
	pmPres = (pressure.offset < pressure.start ? -1 : 1);
	
	var ju_saX = Math.abs(saX);
	var ju_saY = Math.abs(saY);
	var ju_distance = Math.abs(distance);
	var ju_saPres = Math.abs(saPres);
	var pmX = (saX < 0 ? -1 : 1); //+-基準値
	var pmY = (saY < 0 ? -1 : 1); //+-基準値
	
	//その他設定
	var size_sa = parseInt(document.getElementById("pensize").max) - this.pen.current["size"] + 1;
	size_sa = size_sa / 4;
	var svpointhist = [];
	svpointhist = svpointhist.concat(this.elementParameter["pointHistory"]);
	this.elementParameter["pointHistory"] = [];
	/*console.log("====>");
	console.log(svpointhist);
	console.log("prev=" + position.prev.x + "	" + position.prev.y + "	" + pressure.prev);
	console.log("start=" + position.start.x + "	" + position.start.y + "	" + pressure.start);
	console.log("offset=" + position.offset.x + "	" + position.offset.y + "	" + pressure.offset);
	console.log("sa=" + ju_saX + "x" + ju_saY);
	console.log("distance=" + distance);
	console.log("pm=" + pmX + "x" + pmY);
	console.log("saPres=" + saPres);
	console.log("size_sa=" + size_sa);
	console.log("<====");*/
	
	//---補完算出開始
	var prevpos = {};
	var prevpres = 0;
	//-completeCount = Math.ceil(ju_distance / (this.pen.current["size"]*size_sa));
	var fullpoint = 2 + this.pen.current["delay"];
	var isgusu = ((fullpoint % 2) == 0 ? true : false);
	completeMidCount = Math.ceil(ju_middistance / this.pen.current["size"]);
	completeCount = Math.ceil(ju_distance / this.pen.current["size"]);
	if ((completeMidCount%2) == 0) {
		if (!isgusu) completeMidCount += 1;
	}else{
		if (isgusu) completeMidCount += 1;
	}
	if ((completeCount%2) == 0) {
		if (!isgusu) completeCount += 1;
	}else{
		if (isgusu) completeCount += 1;
	}
	if (svpointhist.length > 0) {
		//---過去座標がある場合はそれを加味して2倍にする
		//completeCount *= 2;
		completeHalf = completeCount/2;
		prevpos = {"x":position.prev.x,"y":position.prev.y};
		prevpres = pressure.prev;
	}else{
		prevpos = {"x":position.start.x,"y":position.start.y};
		prevpres = pressure.start;
	}
	//console.log("completeCount=" + completeCount + "	completeMidCount=" + completeMidCount);
	var cplarr = [];
	var retobj = {
		"count" : completeCount,
		"midcount" : completeMidCount,
		"pos" : []
	};
	var divsax = (ju_midsaX / completeMidCount * midpmX);
	var divsay = (ju_midsaY / completeMidCount * midpmY);
	var divsapres = (ju_midsaPres / completeMidCount * midpmPres);
	/*console.log("    divsax="+divsax);
	console.log("    divsay="+divsay);
	console.log("    divsapres="+divsapres);*/
	
	var pos = {"x":0,"y":0};
	var tempPressure = 0;
	/*pos.x = prevpos.x;
	pos.y = prevpos.y;
	tempPressure = prevpres;
	this.elementParameter["pointHistory"].push({
		"x" : pos.x,
		"y" : pos.y,
		"pressure" : tempPressure
	});
	prevpos = pos;
	prevpres = tempPressure;*/
	
	//---prev -> start
	for (var c = 0; c < completeMidCount; c++) {
		
		pos.x = prevpos.x + divsax;
		pos.y = prevpos.y + divsay;
		tempPressure = prevpres + divsapres;
		retobj.pos.push({"x":pos.x, "y":pos.y, "pressure":tempPressure });
		//---オリジナルのstartを超えた（下回った）らそれが上限値（下限値）
		if ((midsaX > 0) && (pos.x > position.start.x)) pos.x = position.start.x;
		if ((midsaX < 0) && (pos.x < position.start.x)) pos.x = position.start.x;
		if ((midsaY > 0) && (pos.y > position.start.y)) pos.y = position.start.y;
		if ((midsaY < 0) && (pos.y < position.start.y)) pos.y = position.start.y;
		if ((midsaPres > 0) && (tempPressure > pressure.start)) tempPressure = pressure.start;
		if ((midsaPres < 0) && (tempPressure < pressure.start)) tempPressure = pressure.start;
		
		//---ここでもブラシ固有の遅延補正を実施
		if (delay.flag) {
			if (delay.count < 1) {
				this.elementParameter["pointHistory"] = [];
				//console.log("---" + delay.count + "nd delay.");
				this.elementParameter["pointHistory"] = this.elementParameter["pointHistory"].concat(delay.poshist);
				//console.log(this.elementParameter["pointHistory"]);
				//---コピーしたら消す
				delay.poshist.splice(0,delay.poshist.length);
				delay.flag = false;
				delay.count = 0;
			}
		}else{
			if (this.pen.current["delay"] > 0) {
				delay.flag = true;
				//console.log("---1st delay start");
				delay.count = this.pen.current["delay"];
				//this.delay.poshist.push({"x":this.startX,"y":this.startY,"pressure":event.pressure});
			}
		}

		//---main start
		/*if (c == (completeCount-1)) {
			//---最後になったら強制的に遅延処理をやめる
			if (delay.count > 0) {
				delay.flag = false;
				this.elementParameter["pointHistory"] = [];
			}
		}*/
		if (!delay.flag){
			/*console.log("c.no=" + c);
			console.log("   prev=" + prevpos.x + "	" + prevpos.y + "	" + prevpres);
			console.log("   pos=" + pos.x + "	" + pos.y + "	" + tempPressure);*/
			this.realDrawMain(this.context,tempPressure,
				prevpos.x,prevpos.y,
				pos.x,pos.y,
				event,this.elementParameter);
		}
		if (delay.count > 0) {
			delay.count--;
			delay.poshist.push({"x":prevpos.x,"y":prevpos.y,"pressure":prevpres});
		}
		//console.log("draw: assist");
		prevpos.x = pos.x;
		prevpos.y = pos.y;
		prevpres = tempPressure;
	}
	
	//start -> offset
	divsax = (ju_saX / completeCount * pmX);
	divsay = (ju_saY / completeCount * pmY);
	divsapres = (ju_saPres / completeCount * pmPres);
	/*console.log("    divsax="+divsax);
	console.log("    divsay="+divsay);
	console.log("    divsapres="+divsapres);*/
	prevpos = {"x":position.start.x,"y":position.start.y};
	prevpres = pressure.start;
	
	for (var c = 0; c < completeCount; c++) {
		
		pos.x = prevpos.x + divsax;
		pos.y = prevpos.y + divsay;
		tempPressure = prevpres + divsapres;
		retobj.pos.push({"x":pos.x, "y":pos.y, "pressure":tempPressure });
		//---オリジナルのoffsetを超えた（下回った）らそれが上限値（下限値）
		if ((saX > 0) && (pos.x > position.offset.x)) pos.x = position.offset.x;
		if ((saX < 0) && (pos.x < position.offset.x)) pos.x = position.offset.x;
		if ((saY > 0) && (pos.y > position.offset.y)) pos.y = position.offset.y;
		if ((saY < 0) && (pos.y < position.offset.y)) pos.y = position.offset.y;
		if ((saPres > 0) && (tempPressure > pressure.offset)) tempPressure = pressure.offset;
		if ((saPres < 0) && (tempPressure < pressure.offset)) tempPressure = pressure.offset;
		
		//---ここでもブラシ固有の遅延補正を実施
		if (delay.flag) {
			if (delay.count < 1) {
				this.elementParameter["pointHistory"] = [];
				//console.log("---" + delay.count + "nd delay.");
				this.elementParameter["pointHistory"] = this.elementParameter["pointHistory"].concat(delay.poshist);
				//console.log(this.elementParameter["pointHistory"]);
				//---コピーしたら消す
				delay.poshist.splice(0,delay.poshist.length);
				delay.flag = false;
				delay.count = 0;
			}
		}else{
			if (this.pen.current["delay"] > 0) {
				delay.flag = true;
				//console.log("---1st delay start");
				delay.count = this.pen.current["delay"];
				//this.delay.poshist.push({"x":this.startX,"y":this.startY,"pressure":event.pressure});
			}
		}

		//---main start
		/*if (c == (completeCount-1)) {
			//---最後になったら強制的に遅延処理をやめる
			if (delay.count > 0) {
				delay.flag = false;
				this.elementParameter["pointHistory"] = [];
			}
		}*/
		if (!delay.flag){
			/*console.log("c.no=" + c);
			console.log("   prev=" + prevpos.x + "	" + prevpos.y + "	" + prevpres);
			console.log("   pos=" + pos.x + "	" + pos.y + "	" + tempPressure);*/
			this.realDrawMain(this.context,tempPressure,
				prevpos.x,prevpos.y,
				pos.x,pos.y,
				event,this.elementParameter);
		}
		if (delay.count > 0) {
			delay.count--;
			delay.poshist.push({"x":prevpos.x,"y":prevpos.y,"pressure":prevpres});
		}
		//console.log("draw: assist");
		prevpos.x = pos.x;
		prevpos.y = pos.y;
		prevpres = tempPressure;
	}

	//console.log("    svpointhist=");
	//console.log(svpointhist);
	this.elementParameter["pointHistory"] = this.elementParameter["pointHistory"].concat(retobj[retobj-1]);
	return retobj;
}