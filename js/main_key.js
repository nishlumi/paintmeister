Draw["appKeyEvent"] = function(code, ctrl, alt, shift) {
	if ((code == "32") || (code == "49") || (code == "97")){ //SPACE or 1
		if (document.getElementById("initialsetup").style.display == "none") {
			document.getElementById("btn_menu").click();
			
			//return event.preventDefault();
		}
	}else if ((code == "50") || (code == "98")) { // 2
		if (document.getElementById("initialsetup").style.display == "none") {
			document.getElementById("info_btn_canvassize").click();
			
			//return event.preventDefault();
		}
	}else if ((code == "51") || (code == "99")) { // 3
		if (document.getElementById("initialsetup").style.display == "none") {
			document.getElementById("info_layer").click();
			
			//return event.preventDefault();
		}
	}else if ((code == "52") || (code == "100")) { // 4
		if (document.getElementById("initialsetup").style.display == "none") {
			document.getElementById("info_pen_mode").click();
			
			//return event.preventDefault();
		}
	}else if (code == "90" && ctrl) { //Ctrl + Z
		if (document.getElementById("initialsetup").style.display == "none") {
			Draw.undobtn.click();
			return;
		}
	}else if (code == "89" && ctrl) { //Ctrl + Y
		if (document.getElementById("initialsetup").style.display == "none") {
			Draw.redobtn.click();
			return;
		}
	}else if (code == "83" && ctrl) { //Ctrl + S
		if (document.getElementById("initialsetup").style.display == "none") {
			Draw.checkstat.click();
			return;
		}
	}else if (code == "82") { // R
		if (document.getElementById("initialsetup").style.display == "none") {
			if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
				document.getElementById("sel_seltype_box").click();
				return;
			}
		}
	}else if (code == "84") { // T
		if (document.getElementById("initialsetup").style.display == "none") {
			if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
				document.getElementById("sel_seltype_free").click();
				return;
			}
		}
	}else if (code == "89") { // Y
		if (document.getElementById("initialsetup").style.display == "none") {
			if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
				document.getElementById("sel_seltype_move").click();
				return;
			}
		}
	}else if (code == "85") { // U
		if (document.getElementById("initialsetup").style.display == "none") {
			if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
				document.getElementById("sel_seltype_rotate").click();
				return;
			}
		}
	}else if (code == "73") { // I
		if (document.getElementById("initialsetup").style.display == "none") {
			if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
				document.getElementById("sel_seltype_tempdraw").click();
				return;
			}
		}
	}else if (code == "88" && ctrl) { //Ctrl + X
		if (document.getElementById("initialsetup").style.display == "none") {
			if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
				document.getElementById("sel_operationtype_cut").click();
				return;
			}
		}
	}else if (code == "67" && ctrl) { //Ctrl + C
		if (document.getElementById("initialsetup").style.display == "none") {
			if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
				document.getElementById("sel_operationtype_copy").click();
				return;
			}
		}
	}else if (code == "86" && ctrl) { //Ctrl + V
		if (document.getElementById("initialsetup").style.display == "none") {
			if (document.getElementById("btn_select").className == "sidebar_button switchbutton_on") {
				document.getElementById("sel_operationtype_paste").click();
				return;
			}
		}
	}else if (code == "48" && alt) { // Alt + 0
		document.getElementById("canvaspanel").style.transform = "scale(1.0)";
		document.getElementById("info_magni").innerText = "1.0";
		Draw.canvassize[0] = Draw.defaults.canvas.size[0];
		Draw.canvassize[1] = Draw.defaults.canvas.size[0];
		Draw.resizeCanvasMargin(window.innerWidth,window.innerHeight);
		Draw.init_scale = 1.0;
	}else if (code == "38" && alt) { // Alt + Up key
		Draw.scaleUp();
	}else if (code == "107" && alt) { //Alt + +
		Draw.scaleUp();
		return false;
	}else if (code == "40" && alt) { // Alt + Down key
		Draw.scaleDown();
	}else if (code == "109" && alt) { //Alt + -
		Draw.scaleDown();
		return false;
	}else if (code == "221" && alt) { // Alt + ]
		Draw.turnLayerUp();
	}else if (code == "219" && alt) { // Alt + [
		Draw.turnLayerDown();
	}else if (code == "124" && alt) { // Alt + F13
		Draw.rotateRight();
	}else if (code == "125" && alt) { // Alt + F14
		Draw.rotateLeft();
	}else if (code == "221") { // ]
		Draw.changePensizeUp();
	}else if (code == "219") { // [
		Draw.changePensizeDown();
	}
	var relkey = ["81","87"];
	//---手動筆圧イベント
	if (document.getElementById("chk_enable_handpres").className == "switchbutton_on") {
		if ((code == "81") || (code == "87")) { //--Q or W
			Draw.keyLikePres += virtual_pressure[code];
			document.getElementById("pres_curline").value = 
				parseInt(document.getElementById("pres_curline").value) + virtual_pressure[code];
		}else if (code == "69") { //--E
			Draw.keyLikePres = virtual_pressure[code];
			document.getElementById("pres_curline").value = virtual_pressure[code];
		}/*else{
			Draw.keyLikePres = virtual_pressure[code];
			document.getElementById("pres_curline").value = virtual_pressure[code]
		}*/
		document.getElementById("presval").textContent = document.getElementById("pres_curline").value;
	}

}