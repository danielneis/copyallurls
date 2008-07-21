
const gcopyallurls_Version		= "0.8.0";
const gcopyallurls_DownloadSite	= "http://www.plasser.net/code/xul/";

var oDialog		 	= null;
var oLongUrlField 	= null;
var oTabBox		 	= null;
var oSavedTree	 	= null;
var oSavedTreeItems	= null;
	
var sFormMethod			= "POST";
var sFormSubmit			= "http://tinyurl.com/create.php";
var sFormArgument		= "url";
//var sFormSubmit			= "http://urlx.org/api.php";
//var sFormArgument		= "x";

var stinyurlsRegExp		= new Array();
    stinyurlsRegExp[0]	= "<input\\s*type\\s*=\\s*('|\")?hidden('|\")?\\s*name\\s*=\\s*('|\")?tinyurl('|\")?\\s*value\\s*=\\s*('|\")?(http:\\/\\/tinyurl\\.com\\/[^\"'\\s>]*)('|\")?\\s*\\/?\\s*>";
    stinyurlsRegExp[1]	= "<blockquote>http:\\/\\/tinyurl.com\\/([^\\s<]*)</blockquote>";

function getPlatform() {
	
	var platformStr =  Components.classes["@mozilla.org/network/protocol;1?name=http"].getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

	var platform = null;
	if (platformStr.indexOf("Win") != -1) {
	  platform = "windows";
	} else if (platformStr.indexOf("Mac") != -1) {
	  platform = "mac";
	} else if (platformStr.indexOf("Linux") != -1) {
	  platform = "linux";
	}
	
	return platform;
}

function getLineFeed() {
	var platform = getPlatform();

        if (platform == 'windows') {
                return "\r\n";
        }
	
	if (platform == 'linux') {
                return "\n";
        }
	
	if (platform == 'mac') {
                return "\n";
        }
	
	return "\r\n";
}
     
function compareTempTitle(a, b) {
   if (a.title.toLowerCase() < b.title.toLowerCase())
      return -1
   if (a.title.toLowerCase() > b.title.toLowerCase())
      return 1
   // a must be equal to b
   return 0
}

function compareTempUrl(a, b) {
   if (a.url.toLowerCase() < b.url.toLowerCase())
      return -1
   if (a.url.toLowerCase() > b.url.toLowerCase())
      return 1
   // a must be equal to b
   return 0
}

function Temp(title,url,tab) {
   this.title=title;
   this.url=url;
   this.tab=tab;
}

function getUrlsSorted(aBrowsers,oPrefs) {
    var title = ""
    var url = ""
    var taburls = [];

    for(var i = 0; i < aBrowsers.length; i++){
        var webNav = aBrowsers[i].webNavigation;
        var tabHistory = aBrowsers[i].sessionHistory;
        
        if(oPrefs.prefHasUserValue("copyallurls.addhistory") &&  oPrefs.getBoolPref("copyallurls.addhistory")){
            //alert(tabHistory.index + "/" + tabHistory.count);
            // enumerate history entries
            for (var h = 0; h < tabHistory.count; h++) {
                histEntry = tabHistory.getEntryAtIndex(h,false)
                histEntryURI = histEntry.URI.spec;
                histEntryTitle = histEntry.title;
                //alert(histEntryTitle);
                var url = histEntryURI;
                try {
                    title = histEntryTitle  || url;
                } catch (e) {
                 title = url;
                }
                auxTemp = new Temp(title,url,i);
                taburls.push(auxTemp);
                }
        }
        else
        {        
            var url = webNav.currentURI.spec;
            try {
                title = webNav.document.title  || url;
            } catch (e) {
                title = url;
            }
            auxTemp = new Temp(title,url);
            taburls.push(auxTemp);
        }
    }

    if(oPrefs.prefHasUserValue("copyallurls.exceptionlist")){
            var list = oPrefs.getCharPref("copyallurls.exceptionlist").split(" ");
            var llength = list.length;
            var tlength = taburls.length;
            var filteredurls = [];
            for (var j = 0; j < tlength; j++) {
                filteredurls.push(taburls[j]);
                for (var k = 0; k < llength; k++) {
                    if (taburls[j].url == list[k]) {
                        filteredurls.pop();
                        break;
                    }
                }
            }
            taburls = filteredurls;
    }

    if(oPrefs.prefHasUserValue("copyallurls.sortorder") &&  oPrefs.getCharPref("copyallurls.sortorder") == "title"){
        taburls.sort(compareTempTitle)
    }
    if(oPrefs.prefHasUserValue("copyallurls.sortorder") &&  oPrefs.getCharPref("copyallurls.sortorder") == "domain"){
        taburls.sort(compareTempUrl)
    }
    
    return taburls;
}

function copyallurls_markup(mystring,title,url,tabno){
    var d = new Date();
    //utcdate = d.toUTCString();
    utcdate = d.toLocaleString();
    unixtime = d.getTime();
    return mystring.replace(/\$title/gi,title).replace(/\$url/gi,url).replace(/\$tab/gi,tabno).replace(/\$date/gi,utcdate).replace(/\$time/gi,unixtime);
    // tab# and current date
}

function copyallurls_copy(){

        try{
                var aBrowsers 	= gBrowser.browsers;
                var str = ""
                var title = ""
                var url = ""
                var taburls = [];
                var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");            
		var LF = getLineFeed();
                
		var titleBeforeUrl = oPrefs.prefHasUserValue("copyallurls.title") &&  oPrefs.getBoolPref("copyallurls.title");
		var noTitle = oPrefs.prefHasUserValue("copyallurls.notitle") &&  oPrefs.getBoolPref("copyallurls.notitle");
		var createTinyUrl = oPrefs.prefHasUserValue("copyallurls.tinyurl") &&  oPrefs.getBoolPref("copyallurls.tinyurl");
		var doLinebreaks = oPrefs.prefHasUserValue("copyallurls.linebreak") &&  oPrefs.getBoolPref("copyallurls.linebreak");
		
		var titlemarkup = oPrefs.prefHasUserValue("copyallurls.titlemarkup") &&  oPrefs.getCharPref("copyallurls.titlemarkup");
		if (!titlemarkup) titlemarkup = "$title";
		var urlmarkup = oPrefs.prefHasUserValue("copyallurls.urlmarkup") &&  oPrefs.getCharPref("copyallurls.urlmarkup");
		if (!urlmarkup) urlmarkup = "$url";
		
		if (doLinebreaks) {
			var EB = LF + LF;
		}
		else {
			var EB = LF;
		}
		
                taburls = getUrlsSorted(aBrowsers,oPrefs);
                
                for(var i = 0; i < taburls.length; i++){
                    title = taburls[i].title;
                    url = taburls[i].url;
                    tab = taburls[i].tab;
                    if(createTinyUrl){
                        if(oPrefs.prefHasUserValue("copyallurls.length")) {
                            var maxlen = oPrefs.getIntPref("copyallurls.length");
                        }
                        else {
                            var maxlen = 76;
                        }
                        if(url.length > maxlen){
                            //Too long!
                            url = tinyurls_create(url)
                        }
                    }
                    if(titleBeforeUrl){
			if (!noTitle) {
				str += titlemarkup;
				str += LF;
			}
                        str += urlmarkup;
                        str += EB;
                    }
                    else{
                        str += urlmarkup;
			if (!noTitle) {
				str += LF + titlemarkup;
			}
			str += EB;
                    }
                    str = copyallurls_markup(str,title,url,tab);
                }
                
		if(str != null && str.length > 0){
			var oClipBoard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
				oClipBoard.copyString(str);
		}
				
	}catch(err) { alert("An unknown error occurred\n"+ err) }
}

// Returns tinyurls from sUrl (by Jeremy Gillick)
function urlx_create(sUrl){
	try{
		
		//Make Request	
		var oRequest	= new XMLHttpRequest();
			oRequest.open(sFormMethod, sFormSubmit, false);
			oRequest.setRequestHeader("User-Agent", navigator.userAgent);
			oRequest.setRequestHeader("Accept", "text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,video/x-mng,image/png,image/jpeg,image/gif;q=0.2,*/*;q=0.1");
			oRequest.setRequestHeader("Accept-Language", navigator.language);
			oRequest.setRequestHeader("Accept-Charset", "ISO-8859-1,utf-8;q=0.7,*;q=0.7");
			oRequest.setRequestHeader("Keep-Alive", "300");
			oRequest.setRequestHeader("Connection", "keep-alive");
			oRequest.setRequestHeader("Referer", "http://urlx.org/");
			oRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        	oRequest.send(sFormArgument +"="+ escape(sUrl));
		
		var sResponse = oRequest.responseText;
		
		if (sResponse != null) {
			var stinyurls = sResponse;
		}
		else {
			var stinyurls = sUrl;
		}
		
		return stinyurls;
		
	}catch(err){ throw err; }
}

// Returns tinyurls from sUrl (by Jeremy Gillick)
function tinyurls_create(sUrl){
	try{
		
		//Make Request	
		var oRequest	= new XMLHttpRequest();
			oRequest.open(sFormMethod, sFormSubmit, false);
			oRequest.setRequestHeader("User-Agent", navigator.userAgent);
			oRequest.setRequestHeader("Accept", "text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,video/x-mng,image/png,image/jpeg,image/gif;q=0.2,*/*;q=0.1");
			oRequest.setRequestHeader("Accept-Language", navigator.language);
			oRequest.setRequestHeader("Accept-Charset", "ISO-8859-1,utf-8;q=0.7,*;q=0.7");
			oRequest.setRequestHeader("Keep-Alive", "300");
			oRequest.setRequestHeader("Connection", "keep-alive");
			oRequest.setRequestHeader("Referer", "http://tinyurl.com/");
			oRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        	oRequest.send(sFormArgument +"="+ escape(sUrl));
		
		//Parse Response
		var sResponse = oRequest.responseText;
		
		//Find tiny url
		var stinyurls = null;
		
			//First Pass
			var oRegExp = new RegExp(stinyurlsRegExp[0], "i");
			var aFound	= oRegExp.exec(sResponse);
			if(aFound != null && aFound.length > 0)
				stinyurls = aFound[6];
			
			//Second Pass
			if(stinyurls == null){
				oRegExp = new RegExp(stinyurlsRegExp[1], "i");
				aFound	= oRegExp.exec(sResponse);
				if(aFound != null && aFound.length > 0)
					stinyurls = aFound[1];
			}
		
		//Send no-worky alert
		/* if(stinyurls == null){
			try{
				oRequest = new XMLHttpRequest();
				oRequest.open("POST", "http://www.plasser.net/code/cul/tinyurls/noworky.php", true);
				oRequest.setRequestHeader("Keep-Alive", "300");
				oRequest.setRequestHeader("Connection", "keep-alive");
				oRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	        	oRequest.send("url="+ escape(sUrl) +"&version="+ escape(gtinyurls_Version) +"&exp1="+ escape(stinyurlsRegExp[0]) +"&exp2="+ escape(stinyurlsRegExp[1]) +"&action="+ escape(sFormSubmit) +"&content="+ escape(sResponse));
			}catch(err){ }
		} */
		
		return stinyurls;
		
	}catch(err){ throw err; }
}

//Copies str to clipboard
function copyallurls_copyText(str){
	try{
		
		//Copy
		var oClipboard 	= Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
	  		oClipboard.copyString(str);
			
	}catch(err){ throw err }
}


function copyallurls_paste() {
	var clip = Components.classes["@mozilla.org/widget/clipboard;1"]. getService(Components.interfaces.nsIClipboard);
	if (!clip) return false;
	var trans = Components.classes["@mozilla.org/widget/transferable;1"]. createInstance(Components.interfaces.nsITransferable);
	if (!trans) return false;
	trans.addDataFlavor("text/unicode");

	clip.getData(trans,clip.kGlobalClipboard);
	var str = new Object();
	var strLength = new Object();
	trans.getTransferData("text/unicode",str,strLength);

	if (str) str = str.value.QueryInterface(Components.interfaces.nsISupportsString);
	if (str) pastetext = str.data.substring(0,strLength.value / 2);
	
	try{
		var tabcounter = 0;
		var aBrowsers = gBrowser.browsers;
		var sUrl	= pastetext;
                
		// the following regex is extracting urls from any text
		myRe=/((https?):\/\/((?:(?:(?:(?:(?:[a-zA-Z0-9][-a-zA-Z0-9]*)?[a-zA-Z0-9])[.])*(?:[a-zA-Z][-a-zA-Z0-9]*[a-zA-Z0-9]|[a-zA-Z])[.]?)|(?:[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+)))(?::((?:[0-9]*)))?(\/(((?:(?:(?:(?:[a-zA-Z0-9\-_.!~*'():@&=+$,]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*)(?:;(?:(?:[a-zA-Z0-9\-_.!~*'():@&=+$,]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*))*)(?:\/(?:(?:(?:[a-zA-Z0-9\-_.!~*'():@&=+$,]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*)(?:;(?:(?:[a-zA-Z0-9\-_.!~*'():@&=+$,]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*))*))*))(?:[?]((?:(?:[;\/?:@&=+$,a-zA-Z0-9\-_.!~*'()]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*)))?))?)/ig;
                myArray = myRe.exec(sUrl);
                while (myArray) {
                    newUrl = String(myArray[0]);
                    
                    // if current tab does not have any open url we can use it as first tab
                    if (tabcounter == 0){
                        tabcounter++;
                        webNav = aBrowsers[aBrowsers.length-1].webNavigation;
                        url = webNav.currentURI.spec;
                        if (url == 'about:blank') {
                            // yes it is empty
                            gBrowser.loadURI(newUrl);
                        }
                        else{
                            // no it is not empty
                            gBrowser.selectedTab = gBrowser.addTab(newUrl);
                        }
                    }
                    else
                        gBrowser.selectedTab = gBrowser.addTab(newUrl);
                    
                    myArray = myRe.exec(sUrl);
                }
		
	} catch(err) { alert("An unknown error occurred.\n"+ err); return false; }
	
	return true;
	
}

function copyallurls_add_exception() {

    var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
    oPrefs.setCharPref("copyallurls.exceptionlist", oPrefs.getCharPref("copyallurls.exceptionlist") + " " + gBrowser.currentURI.spec);
}
