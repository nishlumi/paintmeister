(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("default.html", {
        ready: function (element, options) {
            document.getElementById("cmdNew")
                .addEventListener("click", doClickNew, false);
            document.getElementById("cmdClear")
                .addEventListener("click", doClickClear, false);
            document.getElementById("cmdSave")
                .addEventListener("click", doClickSave, false);
            document.getElementById("cmdUndo")
                .addEventListener("click", doClickUndo, false);
            WinJS.log && WinJS.log("To show the bar, swipe up from " +
                "the bottom of the screen, right-click, or " +
                "press Windows Logo + z. To dismiss the bar, " +
                "tap in the application, swipe, right-click, " +
                "or press Windows Logo + z again.", "sample", "status");
        },
    });

    // Command button functions
    function doClickNew() {
        var msg = "キャンバスの設定をリセットし、最初の画面へ戻ります。よろしいですか？";
        confirm(msg,
            Draw.returnTopMenu
        );
    }

    function doClickUndo() {
        Draw.undobtn.click();
    }
    function doClickClear() {
        Draw.clearbtn.click();
    }

    function doClickSave() {
        saveImage();
    }

    WinJS.log = function (message) {
        
    };
})();
