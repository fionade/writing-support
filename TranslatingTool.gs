function getTermsInContext() {
  var baseUrl = "http://ec2-35-156-137-49.eu-central-1.compute.amazonaws.com:8080/getContext/";
  var word = getTextAroundCursor();
  if (word) {

    var item = getConnectors(word)
    if (item != false) {
      // we have a connector
      return ["connector", item.alternatives, item.keyword];
    }

    else {
      var keywords = [ {stem: word, variations: {}}];
      keywords[0].variations[word] = 1;

      var context = UrlFetchApp.fetch(baseUrl + word);

      if (context != null && context != "null") {
        var resultObject = JSON.parse(context);
        context = formatContextResults(resultObject);

        var synonyms = getSynonyms(word);

        return ["keyword", context, synonyms, word];
      }
    }

    return [];
  }
}

function getContextFromWordnik() {
  var baseUrl = "http://api.wordnik.com:80/v4/word.json/";
  var apiPath = "/examples?includeDuplicates=false&useCanonical=false&skip=0&limit=5&api_key=039bc1da405e0cc69c0070931940d1b2c679bc1f280a178ac";

  var word = getTextAroundCursor();
  if (word) {
    var keywords = [ {stem: word, variations: {}}];
    keywords[0].variations[word] = 1;

    var result = UrlFetchApp.fetch(baseUrl + word + apiPath);

    var resultString = JSON.parse(result);

    return formatHighlightResult(resultString.examples, keywords);
  }

//  var keywords = extractKeywordsFromParagraph();
//
//  if (keywords && keywords.length > 0) {
//    var keyword = keywords[0].term;
//    var html = UrlFetchApp.fetch("http://sentence.yourdictionary.com/" + keyword).getContentText();
//    var html = UrlFetchApp.fetch('http://www.linguee.com/english-german/search?source=auto&query=' + keyword).getContentText();
//
//    var doc = Xml.parse(html, true);
//    var bodyHtml = doc.html.body.toXmlString();
//    doc = XmlService.parse(bodyHtml);
//    var content = getElementsByClassName(root, 'wrap');

    // search for occurrences in the writer's text


//    var result = UrlFetchApp.fetch(baseUrl + keyword + apiPath);
//
//    var resultString = JSON.parse(result);
//
//    return formatHighlightResult(resultString.examples, keywords[0]);
//  }

}

function formatHighlightResult(results, keyword) {
  var formatted = "";

  for (var element in results) {
    formatted += "<div class='result-item'><p>";
    formatted += colourResultKeywords(results[element].text, [keyword]);
    formatted += "</p></div>";
  }

  return formatted;

}

function formatContextResults(results) {
  var formatted = "";

  if (results) {
    for(var i = 0; i < results.leftParts.length; i++) {
      formatted += "<div class='result-item'><p>...";

      // split the left parts in 2: the words to always be displayed and those on hover only
      formatted += results.leftParts[i].join(" ");
      formatted += " <span class='keyword-highlight'>" + results.variations[i] + "</span> ";
      formatted += results.rightParts[i].join(" ");
      formatted += "...</p></div>";
  }

  return formatted;
  }
}
