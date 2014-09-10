/*
	親オブジェクト使用可能プロパティ・メソッド
	parent.current - 現在選択中のブラシ情報
		mode - 現在のブラシの識別子
		size - 現在のブラシのデフォルトの太さ
		color - 現在のブラシの色
		pressure - 筆圧を使うかどうか
		complete - 描画の自動補正処理を使うかどうか
	parent.colorpicker.value - カラーピッカーの値（参照のみ）
	parent.sizebar.value - ブラシの太さの値（参照のみ）
	parent.lastpressure - 最後に取得された筆圧感度
	parent.parent.canvassize[width,height] - キャンバスの大きさ
*/
PenSet.Add({
	id : "testbru",
	name : "V字格子ペン",
	element : null,
	parent : null,
	setFolder : "special",
	defaults : [12,"#000000"],
	/*
		画面からブラシを選択された時の処理
		必要な引数：
		parameter 1 - 現在のレイヤーのCanvasのコンテキスト
		parameter 2 - 親オブジェクトから受け渡される必要なデータ(Object)
			colorpicker - カラーピッカーの値（色情報）
			sizer - ブラシの太さの値（数値）
		必要な戻り値：以下のプロパティを持つObject
			mode - 現在のブラシの識別子
			size - 現在のブラシのデフォルトの太さ
			color - 現在のブラシの色
			pressure - 筆圧を使うかどうか
			complete - 描画の自動補正処理を使うかどうか

	*/
	set : function (context,parentElement) {
		var current = {
			"mode":this.id,
			"pentype" : PenType.normal,
			"size":this.defaults[0],
			"color":this.parent.colorpicker.value,
			"pressure":true,
			"complete":true
		};
		context.globalCompositeOperation = "source-over";
		context.globalAlpha = 1.0;
		context.strokeStyle = parentElement.colorpicker; 
		context.lineWidth = current["size"];
		context.shadowColor = parentElement.colorpicker;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 2;
		context.lineCap = "round";
		return current;
	},
	/*
		touchmove, pointermove, mousemove中に発生するブラシ描画の前処理
		必要な引数：
		parameter 1 - イベントオブジェクト
		parameter 2 - 現在のレイヤーのCanvasのコンテキスト
		parameter 3 - (自動補正処理あり時）補正された筆圧感度
		             （touch,pointer,mouseのleave, end時）筆圧 * 0.0001の値
		             （上記以外）null
	*/
	prepare : function (event, context, pressure2){
		//---Editable begin
		//---Editable end
	},
	/*
		touchmove, pointermove, mousemove中に発生するブラシ描画の前処理
		必要な引数：
		parameter 1 - 現在のレイヤーのCanvasのコンテキスト(Canvas.context)
		parameter 2 - ポインターの開始位置X(Number)
		parameter 3 - ポインターの開始位置Y(Number)
		parameter 4 - ポインターの終了位置X(Number)
		parameter 5 - ポインターの終了位置Y(Number)
		parameter 6 - イベントオブジェクト(PointerEvent(Polyfillあり))
		parameter 7 - 親オブジェクトから受け渡される必要なデータ(Object)
			canvas{width:****, height:****} - キャンバスの幅と高さ
			lastpressure - 補正された最終的な筆圧感度
			current - 現在選択中のペンの情報（set()で設定したparent.currentの内容）
	*/
	drawMain : function(context,startX,startY,offsetX,offsetY,event,parentElement){
		//---Editable begin
		context.lineWidth = parentElement.current["size"];
		var hairpressure = parentElement.lastpressure  ? parentElement.lastpressure : 1 ;
		if (hairpressure == 0) {
			hairpressure = 0.001;
		}else if (hairpressure == undefined) {
			hairpressure = 1;
		}
		var bakalp = context.globalAlpha;

		var StXarr = [];
		var StYarr = [];
		var Xarr = [];
		var Yarr = [];
		var alparr = [];
		var widarr = [];
		var shadowarr = [];
		var compoarr = [];
		var caparr = [];
		var keisu = -1;
		if (event.shiftKey) keisu = 1;
		compoarr.push("source-over");
		StXarr.push(startX + ((parentElement.current["size"]*2)*keisu));
		StYarr.push(startY - (parentElement.current["size"]*2));
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(1 * hairpressure * 2);
		widarr.push(1);
		shadowarr.push(1);
		caparr.push("butt");
		/*compoarr.push("source-over");
		StXarr.push(startX + ((parent.current["size"]*3)*keisu));
		StYarr.push(startY);
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(1 * hairpressure * 2);
		widarr.push(1);
		shadowarr.push(1);
		caparr.push("round");*/
		compoarr.push("source-over");
		StXarr.push(startX + ((parentElement.current["size"]*2)*keisu));
		StYarr.push(startY + (parentElement.current["size"]*2));
		Xarr.push(offsetX);
		Yarr.push(offsetY);
		alparr.push(1 * hairpressure * 2);
		widarr.push(1);
		shadowarr.push(1);
		caparr.push("butt");
		
		for (var i = 0; i < StXarr.length; i++) {
			context.globalCompositeOperation = compoarr[i];
			context.globalAlpha = alparr[i];
			context.lineCap = caparr[i];
			context.lineWidth = widarr[i];
			context.shadowBlur = shadowarr[i];
			context.beginPath();
			context.moveTo(StXarr[i], StYarr[i]);
			context.lineTo(Xarr[i], Yarr[i]);
			context.stroke();
		}
		context.globalAlpha = bakalp;
		//---Editable end
	},
	/*
		当ブラシオブジェクト初期化処理
		必要な引数：
		parameter 1 - 親オブジェクト(PenSetオブジェクト)
		parameter 2 - 当ブラシオブジェクトが紐づく画面要素(<li>)
	*/
	initialize : function(parentelement,ownelement){
		this.parent = parentelement;
		this.element = ownelement;
		//---Editable begin
		//---Editable end
	},
	
});