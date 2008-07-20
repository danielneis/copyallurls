
function openurls_open(){
	try{
		var oField 	= document.getElementById('longurl-field');
        var tabcounter = 0;
        var aBrowsers 	= opener.gBrowser.browsers;
        //var oOpenIn     = document.getElementById('open-list').selectedItem;
		var sUrl	= oField.value;
                
                myRe=myRe=/((https?):\/\/((?:(?:(?:(?:(?:[a-zA-Z0-9][-a-zA-Z0-9]*)?[a-zA-Z0-9])[.])*(?:[a-zA-Z][-a-zA-Z0-9]*[a-zA-Z0-9]|[a-zA-Z])[.]?)|(?:[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+)))(?::((?:[0-9]*)))?(\/(((?:(?:(?:(?:[a-zA-Z0-9\-_.!~*'():@&=+$,]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*)(?:;(?:(?:[a-zA-Z0-9\-_.!~*'():@&=+$,]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*))*)(?:\/(?:(?:(?:[a-zA-Z0-9\-_.!~*'():@&=+$,]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*)(?:;(?:(?:[a-zA-Z0-9\-_.!~*'():@&=+$,]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*))*))*))(?:[?]((?:(?:[;\/?:@&=+$,a-zA-Z0-9\-_.!~*'()]+|(?:%[a-fA-F0-9][a-fA-F0-9]))*)))?))?)/ig;
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
                            opener.gBrowser.loadURI(newUrl);
                        }
                        else{
                            // no it is not empty
                            opener.gBrowser.selectedTab = opener.gBrowser.addTab(newUrl);
                        }
                    }
                    else
                        opener.gBrowser.selectedTab = opener.gBrowser.addTab(newUrl);
                    
                    myArray = myRe.exec(sUrl);
                }
		
	} catch(err) { alert("An unknown error occurred.\n"+ err); return false; }
	
	return true;
}

function openurls_keypress(oField){

	if(openurls_trim(oField.value) == ""){
		document.getElementById('openUrlsDialog').getButton('accept').disabled = true;
	}
	else{
		document.getElementById('openUrlsDialog').getButton('accept').disabled = false;
	}
}

function openurls_trim(str){
	str	= str.replace(new RegExp("^[\\s\\n\\r]*", "g"), "");
	str	= str.replace(new RegExp("[\\s\\n\\r]*$", "g"), "");
	
	return str;
}
