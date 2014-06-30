// 空白のテンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkId=232509
function alert(message) {
    var msg = new Windows.UI.Popups.MessageDialog(message);



    msg.commands.append(new Windows.UI.Popups.UICommand("閉じる", null, 1));
    msg.defaultCommandIndex = 1;
    msg.showAsync();//.then(callback);

}
function confirm(message,callback) {
    var msg = new Windows.UI.Popups.MessageDialog(message);



    msg.commands.append(new Windows.UI.Popups.UICommand("はい", callback, 1));
    msg.commands.append(new Windows.UI.Popups.UICommand("キャンセル", null, 2));
    msg.defaultCommandIndex = 2;
    msg.cancelCommandIndex = 2;
    msg.showAsync();//.then(callback);
    
}
function saveImage(data) {
    var curstate = Windows.UI.ViewManagement.ApplicationView.value;
    if (curstate === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
        !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
        return;
    }
    var svpick = new Windows.Storage.Pickers.FileSavePicker();
    svpick.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
    svpick.fileTypeChoices.insert("Image file", [".png"]);
    svpick.suggestedFileName = "New Image";

    svpick.pickSaveFileAsync().then(function (file) {
        if (file) {
            console.log(file);
            Windows.Storage.CachedFileManager.deferUpdates(file);
            var c = Draw.canvas.getContext("2d");
            c.clearRect(0, 0, Draw.canvassize[0], Draw.canvassize[1]);
            c.fillStyle = "#FFFFFF";
            c.fillRect(0, 0, Draw.canvassize[0], Draw.canvassize[1]);
            for (var obj in Draw.layer) {
                if (Draw.layer[obj].isvisible) {
                    c.globalAlpha = Draw.layer[obj].Alpha; //canvas.getContext("2d").globalAlpha;
                    c.globalCompositeOperation = Draw.layer[obj].CompositeOperation; //canvas.getContext("2d").globalCompositeOperation;
                    c.drawImage(Draw.layer[obj].canvas, 0, 0);
                }
            }

            var imgdata = c.getImageData(0, 0, Draw.canvassize[0], Draw.canvassize[1]);

            //var memsto = new Windows.Storage.Streams.InMemoryRandomAccessStream();
            //var datawriter = new Windows.Storage.Streams.DataWriter(memsto);
            var base64data = Draw.canvas.toDataURL("image/png").replace("data:image/png;base64,", "");
            //datawriter.writeBytes(imgdata.data);
            //datawriter.writeString();
            //var buffer = datawriter.detachBuffer();
            var buffer = Windows.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(base64data);
            //datawriter.close();
            
            console.log(imgdata);
            Windows.Storage.FileIO.writeBufferAsync(file, buffer).done(function () {
                Windows.Storage.CachedFileManager.completeUpdatesAsync(file);
            });
        } else {

        }
    });
}
function ElementTransform(element, value) {
    element.style.transform = value;
    element.style.msTransform = value;
}

(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: このアプリケーションは新しく起動しました。ここでアプリケーションを
                // 初期化します。
            } else {
                // TODO: このアプリケーションは中断状態から再度アクティブ化されました。
                // ここでアプリケーションの状態を復元します。
            }
            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: このアプリケーションは中断しようとしています。ここで中断中に
        // 維持する必要のある状態を保存します。中断中に自動的に保存され、
        // 復元される WinJS.Application.sessionState オブジェクトを使用
        // できます。アプリケーションを中断する前に
        // 非同期操作を完了する必要がある場合は、
        // args.setPromise() を呼び出してください。
    };
    
    document.addEventListener("keydown", function (event) {
        //console.log(event.keyCode);
        if (event.keyCode == "32") { //SPACE
            if (document.getElementById("initialsetup").style.display == "none") {
                document.getElementById("btn_menu").click();

                return event.preventDefault();
            }
        } else if (event.keyCode == "90" && event.ctrlKey) { //Ctrl + Z
            if (document.getElementById("initialsetup").style.display == "none") {
                Draw.undobtn.click();
                return;
            }
        } else if (event.keyCode == "83" && event.ctrlKey) { //Ctrl + S
            if (document.getElementById("initialsetup").style.display == "none") {
                Draw.checkstat.click();
                return;
            }
        }
        var relkey = ["81", "87"];
        //---手動筆圧イベント
        if (document.getElementById("chk_enable_handpres").checked) {
            if ((event.keyCode == "81") || (event.keyCode == "87")) {
                Draw.keyLikePres += virtual_pressure[event.keyCode];
                document.getElementById("pres_curline").value =
                    parseInt(document.getElementById("pres_curline").value) + virtual_pressure[event.keyCode];
            } else {
                Draw.keyLikePres = virtual_pressure[event.keyCode];
                document.getElementById("pres_curline").value = virtual_pressure[event.keyCode]
            }
            document.getElementById("presval").innerHTML = document.getElementById("pres_curline").value;
            Draw.pressedKey = event.keyCode;
        }
        document.getElementById("log3").innerHTML = "key=" + event.keyCode + " - pressure=" + virtual_pressure[event.keyCode] + event.ctrlKey;
    }, false);
    document.addEventListener("keyup", function (event) {
        Draw.keyLikePres = null;
        Draw.pressedKey = 0;
    }, false);
    Draw.initialize();
    ColorPalette.initialize();
    document.getElementById("btn_menu").addEventListener("click", function (event) {
        if (event.target.innerHTML.charCodeAt() == "9660") { //開く
            document.getElementById("menupanel").style.display = "block";
            event.target.innerHTML = "&#9650;";
            event.target.style.backgroundColor = "#91d780";
        } else { //閉じる
            document.getElementById("menupanel").style.display = "none";
            event.target.innerHTML = "&#9660;";
            event.target.style.backgroundColor = "#c4fab3";
            document.body.focus();
        }
    }, false);
    document.getElementById("canvas_width").max = Math.floor((window.innerWidth - 50) / 100) * 100;
    document.getElementById("lab_canwidth").innerHTML = document.getElementById("canvas_width").value;
    document.getElementById("canvas_height").max = Math.floor((window.innerHeight - 80) / 100) * 100;
    document.getElementById("lab_canheight").innerHTML = document.getElementById("canvas_height").value;
    //---キャンバス外からタッチしたまま入ったときのための描画制御
    var touchstart = 'touchstart';
    var touchend = 'touchend';
    if (window.PointerEvent) {
        touchstart = "pointerdown";
        touchend = "pointerup";
    } else if (window.navigator.msPointerEnabled) { // for Windows8 + IE10
        touchstart = 'MSPointerDown';
        touchend = 'MSPointerUp';
    }
    document.body.addEventListener(touchstart, function (event) {
        Draw.drawing = true;
    }, false);
    document.body.addEventListener(touchend, function (event) {
        Draw.drawing = false;
    }, false);
    touchstart = 'mousedown';
    touchend = 'mouseup';
    document.body.addEventListener(touchstart, function (event) {
        Draw.drawing = true;
    }, false);
    document.body.addEventListener(touchend, function (event) {
        Draw.drawing = false;
    }, false);

    console.log(window.innerWidth + "/" + window.innerHeight);

    app.start();
})();
