/* --------------------------------*/
/* Created by Jan Feyereisl - 2006 */
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
citePages = new Array();
var pages = 0;

var done = false;

// -----------------------
function queryScholar(form){

	// HTML variable to generate html code to be printed out
	html = "";

	// Variable holding the name of the author to be searched
    author = form.inputbox.value;	
	// Variable which stores other search terms besides the author's name
	other = form.other_inputbox.value;
	
	// Convert search string into the correct Google search format 
	// (e.g. add "+" in-between search terms in order for Boolean operations to work)
  	var gAuthor = author.replace(/ /gi, "+");
  	var gOther = other.replace(/ /gi, "+");
  	// End of global variables declaration
  	
  	// Fetch Information about total number of results returned by Google
  	getTotalResultsInfo(gAuthor, gOther);         
    
    /*
	_IG_FetchContent(url_to_get, function(responseText){
	    getTotalResultsInfo(responseText);
		getCitationCount(responseText, author);

		// This needs to be in here in order to make the result show immediately!
		// This code inserts the dynamically generated html content and displays it
		html += "</div>";
                // Output html in div.
    	        _gel("sContent").innerHTML = html;
            	return;
	});
	*/
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
        var post = '</b> for <b>';
        
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
        }
        
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
	                citePages[i] = getCitationCount(responseText1);
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
	                citePages[i] = getCitationCount(responseText2);
	           });
	        }
	        done = true;
	    }	    

	    setTimeout("wait()", 3000);
	    
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
	    html += "The total number of citations by " + author + " is: ";
	    html += "<div class='citno'>" + total_citations + "</div>";	    
	    html += "</div>";
        
        // Output html in div.
        _gel("sContent").innerHTML = html;
    
    });
}

function wait(){
    if(done != true){
        alert("Waiting...: " + citePages.length);
        setTimeout("wait()", 3000);
    }else{
        alert("Done: " + citePages.length);
    }
    return;
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
			responseText = responseText.substr(cite_exists+cite_str_len, responseText.length);
		}
	}

	// Sum up all citations
//	var total_citations = 0;
//	for(var j = 0; j<citeArray.length; j++){
		// The multiplication by one is a hack to 
		// convert the string type into a numerical type
//		total_citations += citeArray[j]*1;
//	}
	//html += "The total number of citations by " + author + " is: ";
	//html += "<div class='citno'>" + total_citations + "</div>";
	return citeArray;
}
// ------------------------
