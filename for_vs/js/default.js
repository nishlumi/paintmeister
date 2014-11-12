// 空白のテンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkId=232509
var onKeyope = true;
function alert(message) {
    var msg = new Windows.UI.Popups.MessageDialog(message);



    msg.commands.append(new Windows.UI.Popups.UICommand(_T("cons_close"), null, 1));
    msg.defaultCommandIndex = 1;
    try {
        
        msg.showAsync();
    } catch (e) {
        console.log(e);
    }

}
function confirm(message,callback,callthen) {
    var msg = new Windows.UI.Popups.MessageDialog(message);



    msg.commands.append(new Windows.UI.Popups.UICommand(_T("cons_yes"), null, 1));
    msg.commands.append(new Windows.UI.Popups.UICommand(_T("cons_cancel"), null, 2));
    msg.defaultCommandIndex = 2;
    msg.cancelCommandIndex = 2;
    var ret = msg.showAsync();//.then(callback);
    ret.then(function (data) {
        console.log(data);
        if (data.id == 1) {
            if (!callback()) {
                if (callthen) callthen();
            }
        }
    });
    
}
function prompt(message, callthen) {
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
function loadProjectFile(files) {
    var curstate = Windows.UI.ViewManagement.ApplicationView.value;
    if (curstate === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
        !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
        return;
    }
    var openpick = new Windows.Storage.Pickers.FileOpenPicker();
    openpick.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
    openpick.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
    openpick.fileTypeFilter.replaceAll([".pmpf"]);
    openpick.pickSingleFileAsync().then(function (file) {
        console.log(file);
        if (file) {
            console.log(file);
            var reader = new FileReader();
            reader.onloadstart = function (e) {
                document.getElementById("progressicon").className = "get-animestart";
                Draw.progresspanel.style.display = "block";
            }
            reader.onload = function (e) {
                if (Draw.loadProject(reader.result)) {
                    document.getElementById("basepanel").style.display = "block";
                    document.getElementById("openedProjName").innerText = " - " + file.name;
                    Draw.filename = file.name;
                    Draw.progresspanel.style.display = "none";
                    document.getElementById("progressicon").className = "";
                } else {
                    //alert("有効なPaintMeisterプロジェクトファイルではありません！");
                    alert(_T("loadProjectFile_msg2"));
                }
            }
            reader.onerror = function (e) {
                //alert("有効なPaintMeisterプロジェクトファイルではありません！");
                alert(_T("loadProjectFile_msg2"));
            }
            reader.readAsText(file);

        } else {
            Draw.progresspanel.style.display = "none";
            document.getElementById("progressicon").className = "";
        }
    }, function (file) {
        Draw.progresspanel.style.display = "none";
        document.getElementById("progressicon").className = "";
    })

}
function saveProject(data) {
    var curstate = Windows.UI.ViewManagement.ApplicationView.value;
    if (curstate === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
        !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
        return;
    }
    var svpick = new Windows.Storage.Pickers.FileSavePicker();
    svpick.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
    svpick.fileTypeChoices.insert("PaintMeister Project file", [".pmpf"]);
    if (Draw.filename == "") {
        svpick.suggestedFileName = "New Project";
    } else {
        svpick.suggestedFileName = Draw.filename;
    }


    svpick.pickSaveFileAsync().then(function (file) {
        if (file) {
            document.getElementById("openedProjName").innerText = " - " + file.name;
            Draw.filename = file.name;
            Windows.Storage.FileIO.writeTextAsync(file, data);
            Draw.progresspanel.style.display = "none";
            document.getElementById("progressicon").className = "";
        } else {
            Draw.progresspanel.style.display = "none";
            document.getElementById("progressicon").className = "";
        }
    });
}
function ElementTransform(element, value) {
    element.style.msTransform = value;
    element.style.transform = value;
}
var AppStorage = {
    apptype : "",
    isEnable: function () {
        if (Windows.Storage.ApplicationData.current.localSettings) {
            return true;
        } else {
            return false;
        }
    },
    get: function (key, defaults) {
        var a = Windows.Storage.ApplicationData.current.localSettings.values[key];
        if (!a) a = defaults;
        return a;
    },
    set: function (key, value) {
        Windows.Storage.ApplicationData.current.localSettings.values[key] = value;
    },
    remove: function (key) {
        Windows.Storage.ApplicationData.current.localSettings.values.remove(key);
    },
    initialize: function (callback) {
        this.apptype = "storeapp"
        callback();
    },
    save : function(){

    }
};

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
    //---ここから共通処理貼り付け
    //---ここからストアアプリも共通
    document.addEventListener("keydown", function (event) {
        if (!onKeyope) return false;
        console.log(event.keyCode);
        if ((event.keyCode == "32") || (event.keyCode == "49") || (event.keyCode == "97")) { //SPACE or 1
            if (document.getElementById("initialsetup").style.display == "none") {
                document.getElementById("btn_menu").click();

                //return event.preventDefault();
            }
        } else if ((event.keyCode == "50") || (event.keyCode == "98")) { // 2
            if (document.getElementById("initialsetup").style.display == "none") {
                document.getElementById("info_btn_canvassize").click();

                //return event.preventDefault();
            }
        } else if ((event.keyCode == "51") || (event.keyCode == "99")) { // 3
            if (document.getElementById("initialsetup").style.display == "none") {
                document.getElementById("info_layer").click();

                //return event.preventDefault();
            }
        } else if ((event.keyCode == "52") || (event.keyCode == "100")) { // 4
            if (document.getElementById("initialsetup").style.display == "none") {
                document.getElementById("info_pen_mode").click();

                //return event.preventDefault();
            }
        } else if (event.keyCode == "90" && event.ctrlKey) { //Ctrl + Z
            if (document.getElementById("initialsetup").style.display == "none") {
                Draw.undobtn.click();
                return;
            }
        } else if (event.keyCode == "89" && event.ctrlKey) { //Ctrl + Z
            if (document.getElementById("initialsetup").style.display == "none") {
                Draw.redobtn.click();
                return;
            }
        } else if (event.keyCode == "83" && event.ctrlKey) { //Ctrl + S
            if (document.getElementById("initialsetup").style.display == "none") {
                Draw.checkstat.click();
                return;
            }
        } else if (event.keyCode == "82") { // R
            if (document.getElementById("initialsetup").style.display == "none") {
                if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
                    document.getElementById("sel_seltype_box").click();
                    return;
                }
            }
        } else if (event.keyCode == "84") { // T
            if (document.getElementById("initialsetup").style.display == "none") {
                if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
                    document.getElementById("sel_seltype_free").click();
                    return;
                }
            }
        } else if (event.keyCode == "89") { // Y
            if (document.getElementById("initialsetup").style.display == "none") {
                if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
                    document.getElementById("sel_seltype_move").click();
                    return;
                }
            }
        } else if (event.keyCode == "88" && event.ctrlKey) { //Ctrl + X
            if (document.getElementById("initialsetup").style.display == "none") {
                if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
                    document.getElementById("sel_operationtype_cut").click();
                    return;
                }
            }
        } else if (event.keyCode == "67" && event.ctrlKey) { //Ctrl + C
            if (document.getElementById("initialsetup").style.display == "none") {
                if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
                    document.getElementById("sel_operationtype_copy").click();
                    return;
                }
            }
        } else if (event.keyCode == "86" && event.ctrlKey) { //Ctrl + V
            if (document.getElementById("initialsetup").style.display == "none") {
                if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
                    document.getElementById("sel_operationtype_paste").click();
                    return;
                }
            }
        } else if (event.keyCode == "48" && event.altKey) { // Alt + 0
            document.getElementById("canvaspanel").style.transform = "scale(1.0)";
            document.getElementById("info_magni").innerText = "1.0";
            Draw.canvassize[0] = Draw.defaults.canvas.size[0];
            Draw.canvassize[1] = Draw.defaults.canvas.size[0];
            Draw.resizeCanvasMargin(window.innerWidth, window.innerHeight);
            Draw.init_scale = 1.0;
        } else if (event.keyCode == "38" && event.altKey) { // Alt + Up key
            Draw.scaleUp();
        } else if (event.keyCode == "40" && event.altKey) { // Alt + Down key
            Draw.scaleDown();
        }
        var relkey = ["81", "87"];
        //---手動筆圧イベント
        if (document.getElementById("chk_enable_handpres").className == "switchbutton_on") {
            if ((event.keyCode == "81") || (event.keyCode == "87")) { //--Q or W
                Draw.keyLikePres += virtual_pressure[event.keyCode];
                document.getElementById("pres_curline").value =
                    parseInt(document.getElementById("pres_curline").value) + virtual_pressure[event.keyCode];
            } else {
                Draw.keyLikePres = virtual_pressure[event.keyCode];
                document.getElementById("pres_curline").value = virtual_pressure[event.keyCode]
            }
            document.getElementById("presval").textContent = document.getElementById("pres_curline").value;
        }
        Draw.pressedKey = event.keyCode;
        document.getElementById("log3").innerHTML = "key=" + event.keyCode + " - pressure=" + virtual_pressure[event.keyCode] + event.ctrlKey;
    }, false);
    document.addEventListener("keyup", function (event) {
        Draw.keyLikePres = null;
        Draw.pressedKey = 0;
    }, false);
    Draw.parseURL();
    setupLocale(Draw.urlparams)
    .then(function (flag) {
        var def = $.Deferred();
        Draw.setupLocale();
        def.resolve(true);
        return def;
    })
    .then(function (flag) {
        var def = $.Deferred();
        AppStorage.initialize(function () {
            document.getElementById("canvas_width").max = Math.floor((window.innerWidth - 100) / 100) * 100;
            document.getElementById("lab_canwidth").innerHTML = document.getElementById("canvas_width").value;
            document.getElementById("canvas_height").max = Math.floor((window.innerHeight) / 100) * 100;
            document.getElementById("lab_canheight").innerHTML = document.getElementById("canvas_height").value;
            document.getElementById("chk_limit_canvas").addEventListener("change", function (event) {
                if (event.target.checked) {
                    document.getElementById("canvas_width").max = Math.floor((window.innerWidth - 100) / 100) * 100;
                    document.getElementById("canvas_height").max = Math.floor((window.innerHeight) / 100) * 100;
                } else {
                    document.getElementById("canvas_width").max = 2160;
                    document.getElementById("canvas_height").max = 1440;
                }
            }, false);
            Draw.initialize();
            ColorPalette.initialize();
            $("#pickerpanel").hide();
            $("#colorpicker").on("click", function (event) {
                $("#pickerpanel").show();
            });
            //---プログレスパネルの準備
            document.getElementById("progresspanel").style.left = (Math.floor((window.innerWidth - 300) / 100) * 50) + "px";
            document.getElementById("progresspanel").style.top = (Math.floor((window.innerHeight - 50) / 100) * 50) + "px";
            //---キャンバス外からタッチしたまま入ったときのための描画制御
            var touchstart = 'touchstart';
            var touchend = 'touchend';
            var touchleave = 'touchleave';
            if (window.PointerEvent) {
                touchstart = "pointerdown";
                touchend = "pointerup";
                touchleave = 'pointerleave';
            } else if (window.navigator.msPointerEnabled) { // for Windows8 + IE10
                touchstart = 'MSPointerDown';
                touchend = 'MSPointerUp';
                touchleave = 'MSPointerLeave';
            }
            document.body.addEventListener(touchstart, function (event) {
                //Draw.drawing = true;

            }, false);
            document.body.addEventListener(touchend, function (event) {
                if (!Draw.focusing) {
                    Draw.drawing = false;
                }
            }, false);
            $("#colorpicker").on(touchstart, function (event) {
                $("#pickerpanel").show();
            });
            $("#pickerpanel").on(touchleave, function (event) {
                $("#pickerpanel").hide();
                event.preventDefault();
            });

            touchstart = 'mousedown';
            touchend = 'mouseup';
            touchleave = 'mouseleave';
            document.body.oncontextmenu = function (event) {
                return false;
            }
            document.body.addEventListener(touchstart, function (event) {
                //Draw.drawing = true;
            }, false);
            document.body.addEventListener(touchend, function (event) {
                console.log("document.body touchend");
                if (!Draw.focusing)
                    Draw.drawing = false;
            }, false);
            window.addEventListener("resize", function (event) {
                console.log("width=" + event.target.innerWidth);
                console.log("height=" + event.target.innerHeight);
                document.getElementById("canvas_width").max = Math.floor((window.innerWidth - 100) / 100) * 100;
                document.getElementById("lab_canwidth").innerHTML = document.getElementById("canvas_width").value;
                document.getElementById("canvas_height").max = Math.floor((window.innerHeight) / 100) * 100;
                document.getElementById("lab_canheight").innerHTML = document.getElementById("canvas_height").value;
                Draw.resizeCanvasMargin(event.target.innerWidth, event.target.innerHeight);
            }, false);
            $("#colorpicker").on(touchstart, function (event) {
                $("#pickerpanel").show();
            });
            $("#pickerpanel").on(touchleave, function (event) {
                $("#pickerpanel").hide();
                event.preventDefault();
            });
            def.resolve(true);
        });
        return def;
    })
    .then(function (flag) {
        var def = $.Deferred();
        //システムブラシ読み込み
        var sysbru_pen = ["colorchangepen",
                        "simplepen", "pencil", "fudepen", "calligraphy", "neonpen", "testplugin",
                        "airbrush", "oilpaint", "oilpaintv", "waterpaint", "directpaint"];//,"testplugin2","testplugin3"
        for (var i = 0; i < sysbru_pen.length; i++) {
            var sc = document.createElement("script");
            sc.src = "js/brush/" + sysbru_pen[i] + ".js";
            document.body.appendChild(sc);
            def.resolve(true);
        }
        return def;
    })
    console.log(window.innerWidth + "/" + window.innerHeight);

    app.start();
})();
