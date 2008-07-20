
function copyallurls_initOptions(){
	try{
		var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
		            
		if(oPrefs.prefHasUserValue("copyallurls.notitle"))
                    document.getElementById("copyallurls.notitle").checked = oPrefs.getBoolPref("copyallurls.notitle");
                else
                    document.getElementById("copyallurls.notitle").checked = false;
		
                if(oPrefs.prefHasUserValue("copyallurls.title"))
                    document.getElementById("copyallurls.title").checked = oPrefs.getBoolPref("copyallurls.title");
                else
                    document.getElementById("copyallurls.title").checked = false;
 		
                if(oPrefs.prefHasUserValue("copyallurls.linebreak"))
                    document.getElementById("copyallurls.linebreak").checked = oPrefs.getBoolPref("copyallurls.linebreak");
                else
                    document.getElementById("copyallurls.linebreak").checked = true;
                    
                if(oPrefs.prefHasUserValue("copyallurls.addhistory"))
                    document.getElementById("copyallurls.addhistory").checked = oPrefs.getBoolPref("copyallurls.addhistory");
                else
                    document.getElementById("copyallurls.addhistory").checked = true;
		    
                if(oPrefs.prefHasUserValue("copyallurls.tinyurl"))
                    document.getElementById("copyallurls.tinyurl").checked = oPrefs.getBoolPref("copyallurls.tinyurl");
                else
                    document.getElementById("copyallurls.tinyurl").checked = false;
                    
                if(oPrefs.prefHasUserValue("copyallurls.length"))
                    document.getElementById("copyallurls.length").value = oPrefs.getIntPref("copyallurls.length");
                    
                if(oPrefs.prefHasUserValue("copyallurls.sortorder"))
		    document.getElementById("copyallurls.sortorder").value = oPrefs.getCharPref("copyallurls.sortorder");
		    
		    if(oPrefs.prefHasUserValue("copyallurls.markupsel"))
    		    document.getElementById("copyallurls.markupsel").value = oPrefs.getCharPref("copyallurls.markupsel");
    		if(oPrefs.prefHasUserValue("copyallurls.titlemarkup"))
    		    document.getElementById("copyallurls.titlemarkup").value = oPrefs.getCharPref("copyallurls.titlemarkup");
    		if(oPrefs.prefHasUserValue("copyallurls.urlmarkup"))
    		    document.getElementById("copyallurls.urlmarkup").value = oPrefs.getCharPref("copyallurls.urlmarkup");
		    
		    // copyallurls.markup
		    if(oPrefs.prefHasUserValue("copyallurls.markup")){
                document.getElementById("copyallurls.markup").checked = oPrefs.getBoolPref("copyallurls.markup");
                
                if(oPrefs.getBoolPref("copyallurls.markup")) {
                    document.getElementById("copyallurls.titlemarkup").disabled = false;
                    document.getElementById("copyallurls.urlmarkup").disabled = false;
                }
                else
                {
                    document.getElementById("copyallurls.titlemarkup").disabled = true;
                    document.getElementById("copyallurls.urlmarkup").disabled = true;
                }
            }
            else {
                document.getElementById("copyallurls.markup").checked = true;
            }
            // CheckboxStateChange
            //document.getElementById("copyallurls.markup").addEventListener("CheckboxStateChange", copyallurls_switchMarkup, false);
		    
					
	}catch(err){ alert("An unknown error occurred\n"+ err); }
}

function copyallurls_saveOptions(){

	try{
		//Save
		var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
	   
		oPrefs.setBoolPref("copyallurls.notitle", document.getElementById("copyallurls.notitle").checked);
		
                oPrefs.setBoolPref("copyallurls.title", document.getElementById("copyallurls.title").checked);
		
		oPrefs.setBoolPref("copyallurls.linebreak", document.getElementById("copyallurls.linebreak").checked);
		oPrefs.setBoolPref("copyallurls.addhistory", document.getElementById("copyallurls.addhistory").checked);
                
                oPrefs.setBoolPref("copyallurls.tinyurl", document.getElementById("copyallurls.tinyurl").checked);

                oPrefs.setIntPref("copyallurls.length", document.getElementById("copyallurls.length").value);

                oPrefs.setCharPref("copyallurls.sortorder", document.getElementById("copyallurls.sortorder").value);
                
                oPrefs.setBoolPref("copyallurls.markup", document.getElementById("copyallurls.markup").checked);
                oPrefs.setCharPref("copyallurls.markupsel", document.getElementById("copyallurls.markupsel").value);
                oPrefs.setCharPref("copyallurls.titlemarkup", document.getElementById("copyallurls.titlemarkup").value);
                oPrefs.setCharPref("copyallurls.urlmarkup", document.getElementById("copyallurls.urlmarkup").value);
		
	}catch(err){ alert("An unknown error occurred\n"+ err); }
	
	return true;	
}

function copyallurls_switchMarkup(){

    if(document.getElementById("copyallurls.markup").checked) {
                    document.getElementById("copyallurls.titlemarkup").disabled = false;
                    document.getElementById("copyallurls.urlmarkup").disabled = false;
    }
    else
    {
                    document.getElementById("copyallurls.titlemarkup").disabled = true;
                    document.getElementById("copyallurls.urlmarkup").disabled = true;
    }
}

function copyallurls_selectMarkup(){
    var selm = document.getElementById("copyallurls.markupsel").value;
    var urlm = document.getElementById("copyallurls.urlmarkup");
    var titlem = document.getElementById("copyallurls.titlemarkup");
    
    var predefTitleMarkup = { "plain": "$title", "html": "<h4><a href=\"$url\">$title</a></h4>", "rest": "`$title: <$url>`_", "stx": "\"$title\":$url", "markdown": "[$title]($url \"$title\")", "wikimedia": "[$url $title]", "sixdgrs": "[$url|$title]" };
    var predefUrlMarkup = { "plain": "$url", "html": "<a href=\"$url\">$url</a><br />", "rest": "`$url: <$url>`_", "stx": "\"$url\":$url", "markdown": "[$url]($url \"$title\")", "wikimedia": "[$url $url]", "sixdgrs": "[$url|$url]" };
        
    titlem.value = predefTitleMarkup[selm];
    urlm.value = predefUrlMarkup[selm];
    
}
