Draw["getSelectedLayerIndex"] = function (){
	var ls = this.layer;
	for (var i = 0; i < ls.length; i++) {
		if (ls[i].selected) {
			return i;
		}
	}
	return -1;
}
Draw["getSelectedLayer"] = function (){
	var inx = this.getSelectedLayerIndex();
	if (inx > -1) {
		return this.layer[inx];
	}else{
		return null;
	}
},
Draw["getLastAddedLayer"] = function (){
	var ls = this.layer;
	var maxbtnid = 0;
	if (ls.length > 0) {
		maxbtnid = parseInt(ls[0].control.textContent);
		for (var i = 1; i < ls.length; i++) {
			var n = parseInt(ls[i].control.textContent);
			if (maxbtnid < n) {
				maxbtnid = n;
			}
		}
	}
	console.log("maxbtnid="+maxbtnid);
	return maxbtnid;
}
Draw["moveLayer"] = function (target,oldpos,newpos){
	var hitid = -1;
	for (var i = 0; i < Draw.layer.length; i++) {
		if (Draw.layer[i].originID == target) {
			hitid = i;
			break;
		}
	}
	var obj = Draw.layer.splice(oldpos,1);
	Draw.layer.splice(newpos,0,obj[0]);
	//---全てのレイヤーのz-indexをリフレッシュ
	for (var i = 0; i < Draw.layer.length; i++) {
		console.log(Draw.layer[i]);
		Draw.layer[i].zMove(Draw.layer[i].canvas.style.zIndex,i+1);
	}
}
Draw["removeLayer"] = function (i,isremoveArray){
	if (this.layer[i].destroy()) {
		if (isremoveArray) {
			this.layer.splice(i,1);
			return true;
		}
	}else{
		return false;
	}
}
Draw["removeLayerAll"] = function (){
	for (var i = 1 ; i < this.layer.length; i++) {
		this.removeLayer(i,false);
	}
	this.layer.splice(1,this.layer.length);
}
Draw["removeLayerController"] = function (){
	var layindex = Draw.getSelectedLayerIndex();
	if (Draw.removeLayer(layindex,true)) {
		//---後始末：選択レイヤーの変更
		Draw.layer[layindex-1].control.click();
		//---後始末：レイヤーの優先度の再生成
		console.log("Draw.layer=");
		console.log(Draw.layer);
		for (var i = 0; i < Draw.layer.length; i++) {
			var lay = Draw.layer[i];
			lay.parent = Draw;
			lay.canvas.style.zIndex = i+1;
			//lay.control.title = lay.canvas.style.zIndex;
			//lay.control.innerHTML = lay.canvas.style.zIndex;
		}
		return true;
	}else{
		//alert("メインのキャンバスもしくはロックがかかったレイヤーは削除できません。");
		return false;
	}
}
