Draw["prepareSaveImage"] = function(w, h, isthumb){
	//ダミーのキャンバスから統合した画像を作成
	var c = Draw.canvas.getContext("2d");
	Draw.canvas.width = w;
	Draw.canvas.height = h;
	c.clearRect(0,0,w,h);
	c.fillStyle = "#FFFFFF";
	c.fillRect(0, 0, w, h);
	var magnrate = 0;
	var magn = {"x":0,"y":0};
	if (isthumb) {
		if (parseInt(Draw.canvassize[0]) > parseInt(Draw.canvassize[1])) {
			//width is large
			magnrate = 100 / Draw.canvassize[0];
			//Draw.canvas.width = 100;
			Draw.canvas.height = Draw.canvassize[1] * magnrate;
			c.translate(0,(100-Draw.canvassize[1] * magnrate)*0.5);
		}else{
			//height is large
			magnrate = 100 / Draw.canvassize[1];
			Draw.canvas.width = Draw.canvassize[0] * magnrate;
			//Draw.canvas.height = 100;
			c.translate((100-Draw.canvassize[0] * magnrate)*0.5,0);
		}
		c.fillStyle = "#FFFFFF";
		c.fillRect(0, 0, Draw.canvas.width, Draw.canvas.height);
		magn.x = magnrate;
		magn.y = magnrate;
		c.scale(magn.x,magn.y);
	}
	for (var obj in Draw.layer) {
		if (Draw.layer[obj].isvisible) {
			c.globalAlpha = Draw.layer[obj].Alpha / 100; //canvas.getContext("2d").globalAlpha;
			c.globalCompositeOperation = Draw.layer[obj].CompositeOperation; //canvas.getContext("2d").globalCompositeOperation;
			c.drawImage(Draw.layer[obj].canvas,0,0);
		}
	}
}
Draw["prepareSaveProject"] = function (){
	//***** Not execute******
	//var def = $.Deferred();
	var rawdatas = [];
	var projectdata = [];
	var fnldata = "";
	//---Header
	projectdata.push("paintm");					//:0
	projectdata.push(appversion);				//:1
	projectdata.push("0");						//:2
	projectdata.push("4");						//:3
	projectdata.push(Draw.canvassize[0]);		//:4
	projectdata.push(Draw.canvassize[1]);		//:5
	projectdata.push("1");						//:6
	projectdata.push("3");						//:7
	
	//Color Mode Data Block
	projectdata.push("768");					//:8
	//Image Resource Block
	projectdata.push(Draw.context.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]).data.length);	//:9
	//Image Data
	projectdata.push(Draw.layer.length);		//:10
	for (var obj in Draw.layer) {
		var r = "";
		var con = Draw.layer[obj].canvas.getContext("2d");
		var imgd = con.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]);
		var nulcnt = 0;
		//Image Data (each Layer)
		projectdata.push(0);
		projectdata.push(0);
		projectdata.push(Draw.canvassize[1]);
		projectdata.push(Draw.canvassize[0]);
		projectdata.push(Draw.layer[obj].title);
		projectdata.push(Draw.layer[obj].isvisible ? "1" : "0");
		projectdata.push(Draw.layer[obj].Alpha);
		projectdata.push(" ");projectdata.push(" ");projectdata.push(" ");projectdata.push(" ");
		for (var i = 0; i < imgd.data.length; i++) {
			
			if (imgd.data[i] == 0) {
				if (nulcnt == 0) {
					//最初の0のみ保存
					r += imgd.data[i];
				}
				nulcnt++;
			}else{
				if (nulcnt > 0) {
					r += "#" + nulcnt + ",";
					nulcnt = 0;
				}
				r += parseInt(imgd.data[i]).toString(16) + ",";
			}
		}
		projectdata.push(r);
	}
	//def.resolve(projectdata.join("\t"));
	//return def.promise();
	return projectdata;
}
Draw["displayFromProject"] = function (filename) {
    document.getElementById("basepanel").style.display = "block";
    document.getElementById("openedProjName").innerText = " - " + filename;
    this.filename = filename;
    this.progresspanel.style.display = "none";
    document.getElementById("progressicon").className = "";

}
/*
* @return {Object} 
*  ** success
*   version : バージョン
* 	width : 幅
*   height: 高さ
*   thumbnail : サムネイル（画像データ）
*  ** error
*   cd : 1 - 正しいプロジェクトファイルではない
*/
Draw["preloadProject"] = function(filename,data){
	var ret = {};
	var projectdata = (typeof(data) == "string" ? String(data).split("\t") : data);
	Draw.filelist[filename] = projectdata;
	var CST_width = 4
	var CST_height = 5;
	if (projectdata[0] != "paintm") {
		ret["cd"] = 1;
	}else{
		ret["version"] = projectdata[1];
		ret["width"] = projectdata[CST_width];
		ret["height"] = projectdata[CST_height];
		ret["thumbnail"] = projectdata[7];
	}
	return ret;
}
Draw["loadProject"] = function(data){
	var projectdata = (typeof(data) == "string" ? String(data).split("\t") : data);
	var CST_width = 4
	var CST_height = 5;
	var CST_layerCount = 10;
	console.log("projectdata="+projectdata.length);
	if (projectdata.length < 8) {
		//---ヘッダー部分ですでに8個ない場合は、不正なファイルとしてエラー
		return false;
	}
	if (projectdata[0] != "paintm") {
		return false;
	}
	//---キャンバスを生成
	this.createbody(projectdata[CST_width],projectdata[CST_height],false);
	var laycount = parseInt(projectdata[CST_layerCount]);
	console.log("laycount="+laycount);
	if (isNaN(laycount)) return false; //---レイヤーの個数が正常にとれなかったらエラー
	//---レイヤーの復元
	//レイヤー0番目はメインキャンバスなので固定で読み込み
	console.log(projectdata[CST_layerCount+5]);
	var data = projectdata[CST_layerCount+12].split(",");
	this.layer[0].load(
		projectdata[CST_layerCount+5],
		(projectdata[CST_layerCount+6] == "1" ? true : false),
		projectdata[CST_layerCount+7],
		projectdata[9],
		data
	);
	var layindexpos = CST_layerCount+13;
	for (var i = 1; i < laycount; i++) {
		var lay = new DrawLayer(this,{"w":this.canvassize[0],"h":this.canvassize[1]},false,true);
		this.layer.push(lay);
		//console.log("layindexpos="+projectdata[layindexpos+4]);
		data = projectdata[layindexpos+11].split(",");
		this.layer[i].load(
			projectdata[layindexpos+4],
			(projectdata[layindexpos+5] == "1" ? true : false),
			projectdata[layindexpos+6],
			projectdata[9],
			data
		);
		//console.log("data="+projectdata[layindexpos+11].substr(0,100));
		layindexpos += 12;
	}
	return true;
}
