/* --------------------------------*/
/* Created by Jan Feyereisl - 2007 */
/* --------------------------------*/
// LIMITATIONS:
// This gadget calls Google Scholar in the same fashion as a web-browser would
// Suitable Scholar API needs to be first released in order to get a more useful and accurate code
// The gadget looks at the first 100 results returned by Scholar and caculates
// citations from those by simple string tokenization and the resulting int addition.
// The position of the author is not taken into account.
// Citation is calculated as long as the searched person is one of the named authors on the paper.

// !ISSUE! - When pressing the 'enter' key - wrong operation is performed
// !ISSUE! - Assumes that the number of citations per paper does not exceed 9999
// !ISSUE! - Only 100 papers can be returned per page and the citation calculation
//	     is only done on citations in the first returned page!!
// When using or - the operation has to be in capital letters if in "other" search term box

// HTML variable to generate html code to be printed out
var html = "";

// Global variable to hold the total number of returned results by Google
var totalResults = null;

// Variable which determines the number of returned paper records
var ret_results = 100;

// Global search variables
var author = "";
var other = "";

// Needs to be declared global otherwise it doesnt get recognized by the setTimeout() method
var citePages = new Array();
var publications = 0;
var pages = 0;
var done = false;
var gAuthor = "";
var gOther = "";

// -----------------------
function queryScholar(form){

    // Display loading icon first
    document.getElementById("loading").style.display="inline";
    
	// HTML variable to generate html code to be printed out
	html = "";

    // Clear global variables for subsequent use
    citePages = new Array();
    publications = 0;
    pages = 0;
    done = false;
    totalResults = null;
    ret_results = 100;
    author = "";
    other = "";
    gAuthor = "";
    gOther = "";
	
	// Variable holding the name of the author to be searched
    author = form.inputbox.value;	
	// Variable which stores other search terms besides the author's name
	other = form.other_inputbox.value;
	
	// Convert search string into the correct Google search format 
	// (e.g. add "+" in-between search terms in order for Boolean operations to work)
  	gAuthor = author.replace(/ /gi, "+");
    gOther = other.replace(/ /gi, "+");
  	// End of global variables declaration
  	
  	// Fetch Information about total number of results returned by Google
  	getTotalResultsInfo(gAuthor, gOther);
}

// ----------------------
// Function to fetch vital information for retreiving full citations from multiple pages
// ----------------------
function getTotalResultsInfo(gAuthor, gOther){    
	
    // Generate correct http request
  	var url_to_get = "http://scholar.google.com/scholar?as_q="+gOther+"&num="+ret_results+"&as_sauthors="+gAuthor;
  	
    _IG_FetchContent(url_to_get, function(responseText){
        if (responseText == null){
            _gel("sContent").innerHTML = "<i>Invalid data.</i>";
            alert("There is no data.");
    	    return;
        }

        // Variables used to find the correct location of the total number of returned results
        var pre = 'of about <b>';
        //var post1 = "</b>\\.   \\(<b>";
		var post = /<\\b>\. \(<b>/;
		//post = post1.toString();
        
        // Locate the place where the total results value is positioned
        var resultPositionPre = responseText.search(pre) + pre.length;
        var resultPositionPost = responseText.search(post);
        var resultLength = resultPositionPost - resultPositionPre;
        
        // Extract the total number of results returned
        var tResults = responseText.substr(resultPositionPre, resultLength);
        
        // Remove the comma representing thousands - it prevents js to treat the string as a number       
        while(tResults.search(',') != -1){
            tResults = tResults.substr(0, tResults.search(',')) + tResults.substr(tResults.search(',')+1, tResults.length);
        }
                        
        // Calculate how many pages we need to fetch
        if(tResults > 100){
            pages = (tResults)/ret_results;        
            
            // Temporary counter as an array indexer
            var counter = 0;
            
            // Fetch all fetchable pages (i.e. fetch 'pages' pages[Google's limit] or 10 pages)
            if(pages < 10){
                for(var i = 0; i < pages; i++)
	            {
	                start = i * 100;
                    var url_to_get = "http://scholar.google.com/scholar?as_q="+gOther+"&num="+ret_results+"&as_sauthors="+gAuthor+"&start="+start;
      	
                    _IG_FetchContent(url_to_get, function(responseText1){
                        if (responseText == null){
                            _gel("sContent").innerHTML = "<i>Invalid data.</i>";
                            alert("There is no data.");
    	                    return;
                        }
	                    citePages[counter++] = getCitationCount(responseText1);
	                    return;
	                });
	            }
	            done = true;
            }else{
                for(var i = 0; i < 10; i++)
	            {
	                start = i * 100;
	                var url_to_get = "http://scholar.google.com/scholar?as_q="+gOther+"&num="+ret_results+"&as_sauthors="+gAuthor+"&start="+start;
      	
                    _IG_FetchContent(url_to_get, function(responseText2){
                        if (responseText == null){
                            _gel("sContent").innerHTML = "<i>Invalid data.</i>";
                            alert("There is no data.");
    	                    return;
                        }                        
                        citePages[counter++] = getCitationCount(responseText2);                       
	                    return;
	               });
	            }
	            done = true;
	        }	    

            // Repeatedly wait until we receive all the results from the fetched pages
	        setTimeout("wait()", 3000);
	        
	    }else{
	        var url_to_get = "http://scholar.google.com/scholar?as_q="+gOther+"&num="+ret_results+"&as_sauthors="+gAuthor;
      	
            _IG_FetchContent(url_to_get, function(responseText3){
                if (responseText == null){
                    _gel("sContent").innerHTML = "<i>Invalid data.</i>";
                    alert("There is no data.");
                    return;
                }                        
                citePages[0] = getCitationCount(responseText3);
                totalCites();
                return;
           });
	    } // End of checking if more than 100 results are returned if(tResults > 100)
    });
}

function wait(){
    if(done != true){
        // TODO - TEST THIS IF IT EVER OCCURS
        //alert("Waiting...: " + citePages.length);
        setTimeout("wait()", 3000);
    }else{
        // alert("Done: " + citePages.length);
        totalCites();
    }
    return;
}

function totalCites(){
    // Calculate the total number of citations from all fetched pages
    var total_citations = 0;
    
    for(var i = 0; i < citePages.length; i++){
        var citeArray = citePages[i];	        
	    for(var j = 0; j < citeArray.length; j++){
	        // The multiplication by one is a hack to convert the string type into a numerical type
	        total_citations += citeArray[j]*1;
        }
    }
    
    // Print out the result to the screen
    html += "<div class='stats'>Statistics:</div><br />";
    html += "Citations for '<div class='sTerm'>" + author + "</div>' : <div class='citno'>" + total_citations + "</div><br />";
    html += "Cited Publications: <div class='citno'>" + publications + "</div><br />";
    html += "H-Index: <div class='citno'>" + h_index() + "</div><br />";
    html += "<a class='link' href='http://scholar.google.com/scholar?as_q=" + gOther + "&as_sauthors=" + gAuthor + "' target='_blank'>view publications&nbsp</a><br />";
    html += "</div>";
    
    // Output html in div.
    _gel("sContent").innerHTML = html;
    
    // Hide loading icon first
    document.getElementById("loading").style.display="none";
    
    // Display the results box
    document.getElementById("sContent").style.display="block";
    
    // Resize the frame
    _IG_AdjustIFrameHeight();

}

function h_index(){
    var hArray = new Array();
    var x = 0;
    for(var i = 0; i < citePages.length; i++){
        var citeArray = citePages[i];	        
	    for(var j = 0; j < citeArray.length; j++){
	        // The multiplication by one is a hack to convert the string type into a numerical type
	        hArray[x++] = citeArray[j]*1;
        }
    }
    hArray.sort(sortNumber);
    //alert(hArray);
    for(var i = 0; i < hArray.length; i++){
        if(i > hArray[i]){
            return hArray[i-1];
        }
    }
}

function sortNumber(a,b)
{
    return b - a
}

// ----------------------
// Function to tokenize returned HTML response and sum up the Author's citation count
// ----------------------
function getCitationCount(responseText){
	if (responseText == null){
		_gel("sContent").innerHTML = "<i>Invalid data.</i>";
                alert("There is no data.");
    		return;
            }
	
	var cite_exists = 1;
	var cite_str_len = 14;
	var len_of_Cite_by_str = 9;
	var citeArray = new Array();
	for(var i = 0; cite_exists > 0; i++) 
	{
		cite_exists = responseText.search('Cited by');
		if(cite_exists == -1){
			//alert("No more citations for given Author!");
			//return;
		}else{
			var tmp_string = responseText.substr(cite_exists, cite_str_len);
			var end = (tmp_string.indexOf("<")-len_of_Cite_by_str);
			citeArray[i] = tmp_string.substr(len_of_Cite_by_str, end);
			publications++;
			responseText = responseText.substr(cite_exists+cite_str_len, responseText.length);
		}
	}
	return citeArray;
}
// ------------------------

function searchKeyUp(evt, form)
{
     // If it’s Mozilla/FF use evt; else use window.event
     //evt = evt ? evt : event;

     var keyCode = evt.keyCode;

     // figure out which key code goes with which key
     // alert(evt.keyCode);

     if(evt.keyCode == 13)
	 //if(evt.keyIdentifier == "Enter")
     {
          // do this if it IS the enter key
          queryScholar(form);
     }
     else
     {
          // do this if it is NOT the enter key
     }
}
