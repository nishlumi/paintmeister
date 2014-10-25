//Utillities function and objects
var curLocale = {
	messages : null,
	name : "",
	fullName : ""
};
/*
	Translational function
	param 1 [String] Resource name
	[param 2] [Array ] Replace string
*/
function _T(){
	//console.log(arguments);
	var res = arguments[0];
	var params = [];
	if (arguments.length > 1) {
		params = arguments[1];
	}
	var retstr = "";
	//console.log(res);
	if ((navigator.userAgent.indexOf("Chrome") > -1) && (chrome.fileSystem)) {
		//---ChromeApps
		retstr = chrome.i18n.getMessage(res);
	}else if (("WinJS" in window)){
		//---Windows store app
		retstr = WinJS.Resources.getString(res).value;
	}else{
		//---web app
		//console.log(res);
		if (res in curLocale.messages) {
			retstr = curLocale.messages[res].message;
		}else{
			retstr = "";
		}
	}
	//置換文字列がある場合はそれらを置き換え(%1～%9)
	var pcnt = params.length;
	if (pcnt > 9) pcnt = 9;
	for (var i = 0; i < pcnt; i++) {
		var repstr = "%"+(i+1);
		retstr = retstr.replace(repstr,params[i]);
	}
	return retstr;
}
//only webapp (if app, remove below function)
function setupLocale(params){
	var def = $.Deferred();
	//only webapp, setup locale
	if ((navigator.userAgent.indexOf("Chrome") > -1) && (chrome.fileSystem)) {
		curLocale.name = String(chrome.i18n.getUILanguage()).split("-")[0];
		curLocale.fullName = chrome.i18n.getUILanguage();
		return def.resolve(true);
	}else if (("WinJS" in window)){
		//---Windows store app
		curLocale.name = String(Windows.Globalization.ApplicationLanguages.languages[0]).split("-")[0];
		curLocale.fullName = Windows.Globalization.ApplicationLanguages.languages[0];
		return def.resolve(true);
	}
	//URL引数から lng=* を取得
	var p_lng = (params["lng"] ? params["lng"] : "");
	
	var arr = String(navigator.language).split("-");
	var curloc = arr[0];
	if (p_lng == "") {
		curLocale.name = curloc;
		curLocale.fullName = navigator.language;
	}else{
		curLocale.name = p_lng;
		curLocale.fullName = p_lng;
	}
	$.ajax("_locales/" + curLocale.name + "/messages.json",
	{
		type : "get",
		dataType : "json",
		success : function(data, status, jqXHR){
			console.log("success is");
			console.log(data);
			curLocale.messages = data;
			def.resolve(true);
		},
		error : function ( jqXHR, textStatus, errorThrown ) {
			console.log("error is ");
			console.log(textStatus);
			console.log(errorThrown);
			curLocale.messages = {};
			def.reject(false);
		}
	});

	return def;
}
