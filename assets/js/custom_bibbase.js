//  Scripts for filtering bibbase publication list (from Floris' website) 
  // the following function calls updatePubList() whenever the user searches, selects a category, or resets the pubForm
  //
  $(document).ready(function() {
    // whenever a selection element changes, update the pubList 
    $('select').change(function() {
      updatePubList();
    });
    // whenever the reset button is clicked, reset the selection elements and update pubList
    $('#pubFormReset').click(function() {
      document.getElementById("publicationForm").reset();
      updatePubList();
    });
    // whenever text is entered in the search box, update pubList
    $('#searchPubs').keyup(function() {
      updatePubList();
    });
  });

  // the following function updates the pubList based on the currently selected options
  //
  function updatePubList() {
    // collect an array of keywords to be matched, start with an empty array
    var keywordArray = [];
    // add keywords in the search field
    keywordArray.push($('#searchPubs').val());
    console.log(keywordArray);
    // add keywords from the selection elements
    $("select").each(function(index,selector) { 
      keywordArray.push($(selector).val());
    });
    // make all bibbase papers invisible
    $(".bibbase_paper").each(function(index,bibPaper) { 
      $(bibPaper).attr("visible", "n");
    });
    // make bibbase papers visible if they match a keyword in each element of the keywordArray
    // in more detail: for all bibPapers of class bibbase_paper
    $(".bibbase_paper").each(function(index,bibPaper) {          
      // declare a variable match and set it to 0
      var match = 0;
      // then for all keywordStrings in keywordArray
      $(keywordArray).each(function(index, keywordString) {
        // set match to 0
        match = 0;
        // split the keywordString into an array of separate keywords, and then for all keywords in the array:
        keywordString.split(/\s*\/\s*/).forEach(function(keyword) {
          // get rid of white spaces
          keyword = keyword.trim();
          // and if there is a match with the bibPaper
          if ($(bibPaper).text().toLowerCase().includes(keyword.toLowerCase())) { 
            // set match to 1
            match = 1;
          }
        });
        // if match equals 0 after going through a keywordString of the keywordArray, break out of the .each loop
        if (match==0) {
          return false;
        }
      });
      // if after looping through all keywordStrings match equals 1, make the bibPaper visible
      if (match==1) {
        $(bibPaper).attr("visible","y"); 
      }
    });
    // make all bibbase groups invisible
    $(".bibbase_group_whole").each(function(index, group) {
      $(group).attr("visible", "n"); 
    });
    // make bibbase groups visible only when they contain papers that are visible
    $(".bibbase_group_whole").each(function(index, group) {
      $(group).find(".bibbase_paper").each(function(index, paper) {
        if ($(paper).attr("visible")!="n") { 
          $(group).attr("visible", "y"); 
        }
      });
    });
  }

  // The following code counts and displays the number of publications of each category
  //
  $(document).ready(function() {
    // collect all pubSelect elements
    var selectElements = document.getElementsByClassName("pubSelect");
    // for all pubSelect elements
    for (var i = 0; i < selectElements.length; i++) {
      // collection all option elements
      var optionElements = selectElements[i].options;
      // for all option elements
      for (var j = 0; j < optionElements.length; j++) {
        var opt = optionElements[j];
        var num = countPubs(opt.value);
        if (opt.value != "") {
          opt.innerHTML = opt.innerHTML + ' (' + num + ')';
        }
      }
    }
  });

  // The following function counts the number of publications matching a given keywordString
  //
  function countPubs(keywordString) {
    // initialize counter to 0
    var counter = 0;
    // construct a keyword array from the input string
    var keywordArray = keywordString.split(/\s*\/\s*/);
    // collect papers
    var papers = document.getElementsByClassName("bibbase_paper");
    // for every paper
    console.log(papers.length);
    console.log($(".bibbase_paper").length);
    for (var i = 0; i < papers.length; i++) {
      // for every keyword in the keywordArray
      for (var j = 0; j < keywordArray.length; j++) {
        //and if there is a match with the paper
        if (papers[i].textContent.toLowerCase().includes(keywordArray[j].trim().toLowerCase())) { 
          // add 1 to counter and stop looping through the keyword array to avoid multiple counts of a single paper
          counter = counter + 1;
          break;
        }
      }
    }
    return counter;  // for some reason that I don't understand each bibbase_paper appears twice, so we have to divide by 2 here
  }