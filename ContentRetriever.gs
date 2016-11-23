/**********************
* Content Retrieval
**********************/

/** Looks up wikipedia content for a keyword */
function getWikipediaContent(keyword) {
  
  var url = "http://en.wikipedia.org/w/api.php?action=query&titles=" + keyword + "&prop=extracts&format=json";
  
  var content = UrlFetchApp.fetch(url).getContentText();
  var data = JSON.parse(content);
  
  var page = data.query.pages[Object‌.keys(data.query.pages)[0]];
  var extract = page.extract;
  var title = page.title;
  
  return [extract];
}

function getWiktionaryContent(keyword) {
  var html = UrlFetchApp.fetch('http://en.wiktionary.org/wiki/' + keyword).getContentText();
  
  var doc = XmlService.parse(html);
  var html = doc.getRootElement();
  
  var content = getElementById(html, 'Etymology');
  return content[3].getValue();
}


var URank = function() {
  
  // login for uRank
  var payload =
       {
        "username" : "gdrtestuser",
        "password" : "gdrtestuserpw",
        "type" : "post",
      };
  
  var loginOptions =
      {
        "method"  : "POST",
        "payload" : payload,   
        "followRedirects" : true,
        "muteHttpExceptions": true
      };
  this.login = UrlFetchApp.fetch("http://moregrasp-devel.know-center.tugraz.at/gdr/php_modules/general/user_management/login.php", loginOptions);
  cookie = this.login.getAllHeaders()['Set-Cookie'];
  this.header = {'Cookie':cookie};
  var init = UrlFetchApp.fetch("http://moregrasp-devel.know-center.tugraz.at/nodegdr?operation=init");
  
  this.options = {"headers" : this.header};
  this.dataset = UrlFetchApp.fetch("http://moregrasp-devel.know-center.tugraz.at/nodegdr?operation=getDataset&datasetName=deep learning", this.options);
  
  this.allKeywords = JSON.parse(JSON.parse(this.dataset.getContentText())).message.data.keywords;
}

/** uRank */
URank.prototype.getURankRating = function(keywordList) {

  var h = [];
  var keywords = [];
  
  for (var j = 0; j < keywordList.length; j++) {
    // TODO define maximum
    if (h.length >= 3) {
      break;
    }
    
    var keyword = keywordList[j].stem;
    for (var i = 0; i < this.allKeywords.length; i++) {
      var current = this.allKeywords[i];
      if (current.stem == keyword) {
        var object = {
          repeated : current.repeated,
          variations : current.variations,
          index : current.index,
          colorCategory : null,
          dataLength : JSON.parse(JSON.parse(this.dataset.getContentText())).message.data.length,
          color : null,
          weight : 1
        }
        
        h.push(object);
        keywords.push(current.term);
        
        break;
      }
    }
  }
  
  var ranking = UrlFetchApp.fetch("http://moregrasp-devel.know-center.tugraz.at/nodegdr?operation=onChange&selectedKeywords="+ encodeURIComponent(JSON.stringify(h))+"&rWeight="+ encodeURIComponent(JSON.stringify({cb : 1,	t : 1, u : 1}))+"&rMode=overallScore", this.options);
  //RANKED:
  var ranked = JSON.parse(JSON.parse(ranking.getContentText()));
  
  return {
    "keywords": keywords,
    "ranking": formatURank(ranked.message.data.rankingModelObject.ranking, 5)
  };
  
  //Logger.log(allKeywords);
  // var test=allKeywords[0]; //HERE SEARCH FOR THE RIGHT KEYWORD, for testing I just used the first one (if you want to remove all keywords, send an empty request to the server)

};

function uRankFromParagraph() {
  var urank = new URank();
  var paragraph = getCurrentParagraph();
  if (!paragraph) {
    // TODO test
    var selectedText = getSelectedText();
    if (selectedText != null) {
      paragraph = selectedText[0];
    }
    else {
      paragraph = DocumentApp.getActiveDocument().getBody().getText(); 
    }
  }
  
  var keywords = extractKeywords(paragraph);
  
  // get a ranking for the top 3 keywords
  var ranking = urank.getURankRating(keywords);
  
  // tint the keywords in text
  tintKeywords(ranking.keywords, "#009900");
  
  return ranking;
}

function formatURank(rankedList, maxIndex) {
  var results = "";
  for (var i = 0; i < Math.min(rankedList.length, maxIndex); i++) {
    var title = rankedList[i].url;
    var url = rankedList[i].url;
    
    results += "<h3>";
    if (rankedList[i].url != "") {
      results += "<a href=\"" + rankedList[i].url + "\">";
    }
    results +=  rankedList[i].title;
    if (rankedList[i].url != "") {
      results += "</a>";
    }
    
    var authors = rankedList[i].creator.replace(/;/g, ", ");
    
    results += "</h3><p>" + authors.substring(0, authors.length - 2) + "</p><p>" + rankedList[i].abstract + "...</p>";
  }
  return results;
}

/**********************
* XML helper functions
**********************/

/** XML helper function for retrieving elements by class name */
function getElementsByClassName(element, classToFind) {  
  var data = [];
  var descendants = element.getDescendants();
  descendants.push(element);  
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if(elt != null) {
      var classes = elt.getAttribute('class');
      if(classes != null) {
        classes = classes.getValue();
        if(classes == classToFind) data.push(elt);
        else {
          classes = classes.split(' ');
          for(j in classes) {
            if(classes[j] == classToFind) {
              data.push(elt);
              break;
            }
          }
        }
      }
    }
  }
  return data;
}

/** XML helper function for retrieving elements by id */
function getElementById(element, idToFind) {  
  var descendants = element.getDescendants();  
  for(i in descendants) {
    var elt = descendants[i].asElement();
    if( elt !=null) {
      var id = elt.getAttribute('id');
      if( id !=null && id.getValue()== idToFind) return elt;    
    }
  }
}

/** XML helper function for retrieving elements by tag name */
function getElementsByTagName(element, tagName) {  
  var data = [];
  var descendants = element.getDescendants();  
  for(i in descendants) {
    var elt = descendants[i].asElement();     
    if( elt !=null && elt.getName()== tagName) data.push(elt);      
  }
  return data;
}

function identifyAndLookUp() {
  var selection = getSelectedText();
  if (selection) {
    return {
      "title" : selection,
      "content" : getWikipediaContent(selection)
    };
  }
}