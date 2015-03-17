## Overview: ##
A Google Scholar Universal Gadget which enables users to search for the total number of citations of author(s). It provides a total citation count, total number of cited publications and Jorge E. Hirsch's [H-Index](http://en.wikipedia.org/wiki/Hirsch_number).

**IMPORTANT**: _Please note that this tool is as accurate/inaccurate as Google Scholar itself. Thus it is important to check and refine the data that the gadget performs calculations on by clicking on the "view publications" link. If the returned page shows inaccurate results then the search terms in the gadget need to be refined until the returned page shows as accurate information as the user deems fit for his/her purpose. Peter Jacso published an [article](http://www.libraryjournal.com/article/CA6703850.html) in the Library Journal that describes many issues with tools that are based on Google Scholar. This article can provide a user of our gadget with a better understanding of many of the possible pitfalls that can be encountered when using our tool._


&lt;wiki:gadget url="http://citations-gadget.googlecode.com/svn/trunk/citGadget.xml" width="400" height="200"/&gt;


### Installation ###
[Read instructions](InstallInstructions.md) or simply add to your iGoogle by clicking here: [![](http://buttons.googlesyndication.com/fusion/add.gif)](http://fusion.google.com/add?moduleurl=http%3A//citations-gadget.googlecode.com/svn/trunk/citGadget.xml)

### Operation ###
This gadget queries Google Scholar in the same fashion as a web-browser. The returned results are initially analysed for the total amount of publications found. This information is subsequently used in order to retrieve all necessary pages of available publications. The gadget then fetches these pages (Google limits this to 10 pages) and parses the returned HTML data. Relevant citation data is extracted in order to calculate a total number of citations per given author as well as other statistics.

### Note: ###
Suitable Google Scholar API needs to be first released in order to get a more complete and accurate application. Google scholar limits the number of returned publications per search to 1000 (i.e. 10 pages if 100 publications are returned per page).

The position of the author is not taken into account.

Citation is calculated as long as the searched person is one of the named authors on the paper.

### Contact: ###
For comments, ideas or any queries please contact me at: **thefillm** _<.a.t.>_ **googlemail.com** , replacing _<.a.t.>_ with **@**.
Or have a look at our **Discussion group** and post a comment there.