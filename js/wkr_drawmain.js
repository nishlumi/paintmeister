/*
	evt.data format
	{
		appversion : "",
		canvassize : [0, 0],
		imagedata : {
			length : 0,
		},
		layer : [
			{title:"", isvisible:true, Alpha:0, data:Array()}
		]
	}
*/
onmessage = function (evt){
	var Draw = evt.data;
	
	var rawdatas = [];
	var projectdata = [];
	var fnldata = "";
	//---Header
	projectdata.push("paintm");					//:0
	projectdata.push(Draw.appversion);			//:1
	projectdata.push("0");						//:2
	projectdata.push("4");						//:3
	projectdata.push(Draw.canvassize[0]);		//:4
	projectdata.push(Draw.canvassize[1]);		//:5
	projectdata.push("1");						//:6
	//projectdata.push("3");						//:7
	projectdata.push(Draw.thumb);				//:7
	//Color Mode Data Block
	projectdata.push("768");					//:8
	//Image Resource Block
	projectdata.push(Draw.imagedata.length);	//:9
	//Image Data
	projectdata.push(Draw.layer.length);		//:10
	for (var obj in Draw.layer) {
		var r = "";
		//var con = Draw.layer[obj].canvas.getContext("2d");
		//var imgd = con.getImageData(0,0,Draw.canvassize[0],Draw.canvassize[1]);
		var lay = Draw.layer[obj];
		var nulcnt = 0;
		//Image Data (each Layer)
		projectdata.push(0);
		projectdata.push(0);
		projectdata.push(Draw.canvassize[1]);
		projectdata.push(Draw.canvassize[0]);
		projectdata.push(lay.title);
		projectdata.push(lay.isvisible ? "1" : "0");
		projectdata.push(lay.Alpha);
		projectdata.push(" ");projectdata.push(" ");projectdata.push(" ");projectdata.push(" ");
		for (var i = 0; i < lay.data.length; i++) {
			
			if (lay.data[i] == 0) {
				if (nulcnt == 0) {
					//最初の0のみ保存
					r += lay.data[i];
				}
				nulcnt++;
			}else{
				if (nulcnt > 0) {
					r += "#" + nulcnt + ",";
					nulcnt = 0;
				}
				r += parseInt(lay.data[i]).toString(16) + ",";
			}
		}
		projectdata.push(r);
	}
	postMessage(projectdata.join("\t"));
};