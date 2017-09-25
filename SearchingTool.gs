function getRelatedContent() {

  var baseUrl = "http://ec2-35-156-137-49.eu-central-1.compute.amazonaws.com:8080/getMatches";

  var keywords = extractKeywordsFromParagraph();

  var keywordList = [];
  var readableKeywords = [];
  for (var i = 0; i < Math.min(keywords.length, 4); i++) {
    while (keywords[i].term == "ERROR") {
      keywords.splice(i, 1);
    }
    keywordList.push(keywords[i].stem);
    readableKeywords.push(keywords[i].term);
  }

  if (keywordList.length == 0) {
    var topics = getTopicsFromCache();
    if (topics) {
      topics.forEach(function(d) {
        var word = {term : d};
        keywords.push(word);
        keywordList.push(d);
        readableKeywords.push(d);
      });
    }
  }

  if (keywordList.length > 0) {
    var data = {
      "keywords" : keywordList
    };

    var body = { "method": "post",
                "payload" : JSON.stringify(data)
               };
    var result = UrlFetchApp.fetch(baseUrl, body).getContentText();
    var relatedDocuments = JSON.parse(result);

    return {
      "keywords": readableKeywords,
      "ranking": formatRelatedContent(relatedDocuments, keywords.slice(0, 4))
    };
  }

  return {};

}

function formatRelatedContent(rankedList, keywords) {
  var results = "";

  var cachedBookmarks = getBookmarks();

  // Don't display more than 8 results
  var trimmedResult = rankedList.splice(8);

  rankedList.forEach(function(d){
    var title = colourResultKeywords(d.metadata.title, keywords);
    var url = d.metadata.url;
    var abstract = colourResultKeywords(d.metadata.abstract, keywords);
    abstract = abstract.substr(0, 200);// + "<span class='abstract-hidden-part'>" + abstract.substr(150, abstract.length) + "</span>";

    //var abstract = "abstract";
    var authors = d.metadata.authors;

    results += "<div class='result-item'><h3 class='result-header'>";
    if (url != "") {
      results += "<a href='" + url + "'>";
    }
    results +=  title;
    if (url != "") {
      results += "</a>";
    }

    var titleId = d.metadata.title.replace(/[^a-zA-Z]+/g, "_");
    if (cachedBookmarks && cachedBookmarks[titleId]) {
      results += "</h3><p class='authors'>" + authors + "</p><p class='abstract'>" + abstract + "...</p><div class='bookmark material-icons' title='bookmark' id='" + titleId + "'>star</div></div>";
    }
    else {
      results += "</h3><p class='authors'>" + authors + "</p><p class='abstract'>" + abstract + "...</p><div class='bookmark material-icons' title='bookmark' id='" + titleId + "'>star_border</div></div>";
    }

  });


  return results;
}

function saveBookmarks(title, content) {
  var cache = CacheService.getUserCache()
  var cachedBookmarks = cache.get("bookmarks");

  if (cachedBookmarks) {
    cachedBookmarks = JSON.parse(cachedBookmarks);
  }
  else {
    cachedBookmarks = {};
  }

  cachedBookmarks[title] = content;

  cache.put("bookmarks", JSON.stringify(cachedBookmarks));
}

function removeBookmark(title) {
  var cache = CacheService.getUserCache()
  var cachedBookmarks = cache.get("bookmarks");
  cachedBookmarks = JSON.parse(cachedBookmarks);
  delete cachedBookmarks[title];

  cache.put("bookmarks", JSON.stringify(cachedBookmarks));
}

function getBookmarks(title) {

  var cachedBookmarks = CacheService.getUserCache().get("bookmarks");
  if (cachedBookmarks) {
    cachedBookmarks = JSON.parse(cachedBookmarks);

    if (title) {
      return cachedBookmarks[title];
    }
    else {
      return cachedBookmarks;
    }
  }
}
