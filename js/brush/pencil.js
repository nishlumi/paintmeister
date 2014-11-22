/*
	親オブジェクト使用可能プロパティ・メソッド
	this.current <= parent.current
	this.parent.colorpicker.value <= parent.parent.colorpicker.value
*/
PenSet.Add({
    id: "pencil",
    name: {
        "ja": "鉛筆",
        "en": "Pencil",
        "eo": "Krajono"
    },
    element: null,
    parent: null,
    setFolder: "pen",
    defaults: [3, "#000000"],
    set: function (context, parentElement) {
        var current = {
            "mode": this.id,
            "pentype": PenType.normal,
            "size": this.defaults[0],
            "color": parentElement.colorpicker,
            "pressure": true,
            "complete": true,
            "delay" : 1,
            "delay_assist" : false
        };
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1.0;
        context.strokeStyle = parentElement.colorpicker;
        context.fillStyle = parentElement.colorpicker;
        context.lineWidth = current["size"];
        context.shadowColor = parentElement.colorpicker;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 2;
        context.lineCap = "round";

        return current;
    },
    prepare: function (event, context, pressure2) {
        var tempcontext = context;
        var temppressure = pressure2;
        //---Editable begin
        //---鉛筆の筆圧感度を下げる。（強くペンを当てないと濃く描けないようにする）
        temppressure = temppressure * 0.5;
        //---Editable end
        return {
            "pressure": temppressure,
            "context": tempcontext
        };
    },
    drawMain: function (context, startX, startY, offsetX, offsetY, event, parentElement) {
        context.lineWidth = parentElement.current["size"];
        context.beginPath();
        var hairpressure = parentElement.lastpressure ? parentElement.lastpressure : 1;
        if (hairpressure == 0) {
            hairpressure = 0.001;
        } else if (hairpressure == undefined) {
            hairpressure = 1;
        }
        var bakalp = context.globalAlpha;

        var StXarr = [];
        var StYarr = [];
        var Xarr = [];
        var Yarr = [];
        var CXarr = [];
        var CYarr = [];
        var alparr = [];
        var widarr = [];
        var shadowarr = [];
        var compoarr = [];
        var caparr = [];
        var cursize = parentElement.current["size"];
        var Xdir = -1, Ydir = -1;
        if (startX > offsetX) {
            Xdir = 1;
        } else if (startX == offsetX) {
            Xdir = 0;
        }
        if (startY > offsetY) {
            Ydir = 1;
        } else if (startY == offsetY) {
            Ydir = 0;
        }
        var ispointhist = false;
        var pointhist = [];
        if (parentElement["pointHistory"].length == 0) {
        	ispointhist = true;
        }else{
        	for (var i = 0; i < parentElement["pointHistory"].length; i++) {
        		pointhist.push(parentElement["pointHistory"][i]);
        	}
        	
        }
        //var sax = pointhistX + offsetX * Xdir;
        //var say = pointhistY + offsetY * Ydir;
        //5点目：中心（再度）ベースの線
        compoarr.push("source-over");
        StXarr.push(startX);// + ((cursize * 0.15) * Xdir)); //+ (cursize * 0.05));
        StYarr.push(startY);// + ((cursize * 0.15) * Ydir)); //- (cursize * 0.09));
        Xarr.push(offsetX);// + ((cursize * 0.15) * Xdir)); //+ (cursize * 0.05));
        Yarr.push(offsetY);// + ((cursize * 0.15) * Ydir)); // (cursize * 0.09));
        CXarr.push(pointhist);// + ((cursize * 0.15) * Xdir));
        CYarr.push(pointhist);// + ((cursize * 0.15) * Ydir));
        if (hairpressure > 0.3) {
            alparr.push(0.8 * hairpressure * 1);
            widarr.push(cursize * 0.9);
            shadowarr.push(2);
            caparr.push("butt");
        } else {
            alparr.push(0.5 * hairpressure * 1);
            widarr.push(cursize * 0.9);
            shadowarr.push(1);
            caparr.push("butt");
        }
        //6点目：中心（再々度）
        compoarr.push("source-over");
        StXarr.push(startX);// + ((cursize * 0.25) * Xdir)); //+ - (cursize * 0.06));
        StYarr.push(startY);// + ((cursize * 0.25) * Ydir)); //+ + (cursize * 0.085));
        Xarr.push(offsetX);// + ((cursize * 0.25) * Xdir)); //+ - (cursize * 0.06));
        Yarr.push(offsetY);// + ((cursize * 0.25) * Ydir)); //+ + (cursize * 0.085));
        CXarr.push(pointhist[0].x);// + ((cursize * 0.25) * Xdir));
        CYarr.push(pointhist[0].y);// + ((cursize * 0.25) * Ydir));
        if (hairpressure > 0.5) {
            alparr.push(0.9 * hairpressure * 1);
            widarr.push(cursize * 0.5);
            shadowarr.push(2);
            caparr.push("butt");
        } else {
            alparr.push(0.4 * hairpressure * 1);
            widarr.push(cursize * 0.5);
            shadowarr.push(2);
            caparr.push("butt");
        }
        //1点目：中心
        compoarr.push("source-over");
        StXarr.push(startX);
        StYarr.push(startY);
        Xarr.push(offsetX);
        Yarr.push(offsetY);
        CXarr.push(pointhist[0].x);
        CYarr.push(pointhist[0].y);
        if (hairpressure > 0.5) {
	        alparr.push(1 * (hairpressure * 2));
	        widarr.push(cursize * 0.9);
	        shadowarr.push(1);
	        caparr.push("butt");
    	}else{
	        alparr.push(1 * (hairpressure * 2));
	        widarr.push(cursize * 0.9);
	        shadowarr.push(1);
	        caparr.push("butt");
    	}
        
        for (var i = 0; i < StXarr.length; i++) {
            context.globalCompositeOperation = compoarr[i];
            context.globalAlpha = alparr[i];
            context.lineCap = caparr[i];
            context.lineJoin = "round";
            context.lineWidth = widarr[i];
            context.shadowBlur = shadowarr[i];
            //context.shadowOffsetX = cursize * 0.25 * Xdir;
            //context.shadowOffsetY = cursize * 0.25 * Ydir;
            //context.beginPath();
            //context.moveTo(StXarr[i], StYarr[i]);
            //context.lineTo(Xarr[i], Yarr[i]);
			if ((ispointhist)) {
				context.moveTo(StXarr[i], StYarr[i]);
				context.lineTo(Xarr[i], Yarr[i]);
			}else{
				context.moveTo(pointhist[0].x, pointhist[0].y);
				context.quadraticCurveTo(StXarr[i], StYarr[i], Xarr[i], Yarr[i]);
				
				//context.moveTo(pointhist[0].x, pointhist[0].y);
				//context.bezierCurveTo(pointhist[1].x, pointhist[1].y, StXarr[i], StYarr[i], Xarr[i], Yarr[i]);
				//context.quadraticCurveTo(pointhist[1].x, pointhist[1].y, StXarr[i], StYarr[i]);
				//context.quadraticCurveTo(StXarr[i], StYarr[i], Xarr[i], Yarr[i]);
				console.log("1～3=" +
					pointhist[0].x + "x" + pointhist[0].y + " -> " +
					StXarr[i] + "x" + StYarr[i] + " -> " +
					Xarr[i] + "x" + Yarr[i] + " ." 
				);
			}
            context.stroke();
        }
        
        //context.closePath();
        context.globalAlpha = bakalp;
    },
    initialize: function (parentelement, ownelement) {
        this.parent = parentelement;
        this.element = ownelement;
        //デフォルトは鉛筆なのでここでURL引数直接指定の判定（便宜上）
        //直接キャンバスを作成する処理
        Draw.direct_createbody();
    },

});