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

function getEEXCESSRecommendations() {

  var keywordList = extractKeywordsFromParagraph();

  // https://github.com/EEXCESS/gdocs-plugin/
  // https://github.com/EEXCESS/eexcess/wiki/Getting-Started-Guide-for-Client-Developers

  var serverURL = "https://eexcess-dev.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/recommend";
  var partnerList = "";
  var origin = {
      "clientType": "Writing Support Client",
      "clientVersion": "0.1",
      "module": "Sidebar",
      "userID": DocumentApp.getActiveDocument().getId()
   }

  // POST payload
  var data = {
    "numResults": 5, // TODO not hard-coded
    //"partnerList": [],
    "contextKeywords": [],
    "origin": origin
  };

  // Fill the context array
  var keywords = getKeywordsFromList(keywordList);
  for (i in getKeywordsFromList(keywordList)) {
    data["contextKeywords"].push({"text": keywordList[i].term});
  }

  // Options object, that specifies the method, content type and payload of the HTTPRequest
  var options = {
    "method": "POST",
    "contentType": "application/json",
    "headers": {
      "Accept": "application/json"
    },
    "payload": JSON.stringify(data)
  };

  try {
    var response = UrlFetchApp.fetch(serverURL, options);

    return {
    "keywords": keywords,
    "ranking": formatEEXCESS(response)
  };
  } catch (err) {
    Logger.log(err);
  }

}


function formatEEXCESS(response) {
  // https://github.com/EEXCESS/eexcess/wiki/Request-and-Response-format

  var text = JSON.parse(response.getContentText());
  var resultList = text.result;

  var results = "";
  for (var i = 0; i < Math.min(resultList.length, 5); i++) {
    var title = resultList[i].title;
    var url = resultList[i].documentBadge.uri;

    results += "<h3 class='result-title'>";
    if (url != "") {
      results += "<a href=\"" + url + "\">";
    }
    results += title;
    if (resultList[i].url != "") {
      results += "</a>";
    }

    //var authors = rankedList[i].creator.replace(/;/g, ", ");

    results += "</h3><p class='result-description'>" + resultList[i].description +"</p>";
  }
  return results;
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

  var trunkatedResult = formatURank(ranked.message.data.rankingModelObject.ranking, 5, h);

  // tint the keywords in text
  DocumentApp.getActiveDocument().getBody().editAsText().setForegroundColor("#000000");
  tintKeywords(h, "#357ae8");

  return {
    "keywords": keywords,
    "ranking": trunkatedResult
  };

  //Logger.log(allKeywords);
  // var test=allKeywords[0]; //HERE SEARCH FOR THE RIGHT KEYWORD, for testing I just used the first one (if you want to remove all keywords, send an empty request to the server)

};

function uRankFromParagraph() {
  var keywords = extractKeywordsFromParagraph();

  // get a ranking for the top 3 keywords
  var urank = new URank();
  var ranking = urank.getURankRating(keywords);

  return ranking;
}

function formatURank(rankedList, maxIndex, keywords) {
  var results = "";
  for (var i = 0; i < Math.min(rankedList.length, maxIndex); i++) {
    var title = colourResultKeywords(rankedList[i].title, keywords);
    var url = rankedList[i].url;
    var abstract = colourResultKeywords(rankedList[i].abstract, keywords);
    var authors = rankedList[i].creator.replace(/;/g, ", ");

    results += "<div class='result-item'><h3 class='result-header'>";
    if (url != "") {
      results += "<a href=\"" + url + "\">";
    }
    results +=  title;
    if (url != "") {
      results += "</a>";
    }

    results += "</h3><p class='authors'>" + authors.substring(0, authors.length - 2) + "</p><p class='abstract'>" + abstract + "...</p></div>";
  }
  return results;
}

function colourResultKeywords(string, keywords) {

  for (var i = 0; i < keywords.length; i++) {
    var variations = keywords[i].variations;
    if (!variations) {
      variations = [keywords[i].term];
    }
    Object.keys(variations).forEach(function (key) {
      var regex = new RegExp("\\b(" + key + ")\\b","gi");
      string = string.replace(regex, '<span class="keyword-highlight">$1</span>');
    });
  }
  return string;
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
