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
totalResults = "";

// Variable which determines the number of returned paper records
var ret_results = 100;

// -----------------------
function queryScholar(form){

	// HTML variable to generate html code to be printed out
	html = "";

	// Variable holding the name of the author to be searched
    var author = form.inputbox.value;	
	// Variable which stores other search terms besides the author's name
	var other = form.other_inputbox.value;
	
	// Convert search string into the correct Google search format 
	// (e.g. add "+" in-between search terms in order for Boolean operations to work)
  	var gAuthor = author.replace(/ /gi, "+");
  	var gOther = other.replace(/ /gi, "+");
  	// End of global variables declaration
  	
  	// Fetch Information about total number of results returned by Google
  	getTotalResultsInfo(gAuthor, gOther);
    
    // Calculate how many pages we need to fetch
    var pages = totalResults/ret_results
    
    html += "TEST"; 
    html += "<br>" + totalResults;
    html += "<br>" + pages;
    
    for(var i = 0; i < pages; i++)
	{
	    html += "Page-"; 
	    //getCitationCount();
	}
    
    
    html += "</div>";
    // Output html in div.
    _gel("sContent").innerHTML = html;
    
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
        var resultPositionPre = responseText.search(pre);
        var resultPositionPost = responseText.search(post);
        
        // Extract the total number of results returned
        totalResults = responseText.substr(resultPositionPre + pre.length, resultPositionPost-(resultPositionPre + pre.length));
        
        
        
        return;
    });
}

// ----------------------
// Function to tokenize returned HTML response and sum up the Author's citation count
// ----------------------
function getCitationCount(responseText, author){
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
	var total_citations = 0;
	for(var j = 0; j<citeArray.length; j++){
		// The multiplication by one is a hack to 
		// convert the string type into a numerical type
		total_citations += citeArray[j]*1;
	}
	html += "The total number of citations by " + author + " is: ";
	html += "<div class='citno'>" + total_citations + "</div>";
	return;
}
// ------------------------
