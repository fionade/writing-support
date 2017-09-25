/**
 * Extracts keywords from a given text, returns them in a list with stem, variations,
 * sorted by repetition count
 * Uses adjusted code from the natural and pos nodejs packages.
 */
function extractKeywords(text) {
  var keywordExtractor = new KeywordExtraction.KeywordExtractor();
  return keywordExtractor.getNounKeywords(text);
}

function extractKeywordsFromParagraph() {
  var paragraph = getCurrentText();

  return extractKeywords(paragraph);
}

function getKeywordsFromList(keywordList) {

  var h = [];
  var keywords = [];

  for (var j = 0; j < keywordList.length; j++) {
    // TODO define maximum
    if (keywords.length >= 3) {
      break;
    }

    keywords.push(keywordList[j].term);
  }

  return keywords;
}

function getSynonyms(keyword) {
  /*var wordnikURL = "http://api.wordnik.com:80/v4/word.json/";
  var suffix = "/relatedWords?useCanonical=true&relationshipTypes=synonym&limitPerRelationshipType=3&api_key=039bc1da405e0cc69c0070931940d1b2c679bc1f280a178ac";

  var response = UrlFetchApp.fetch(wordnikURL + keyword + suffix);*/
  var url = "http://ec2-35-156-137-49.eu-central-1.compute.amazonaws.com:8080/getSynonyms/";
  var response = UrlFetchApp.fetch(url + keyword);

  response = JSON.parse(response);
  if (response.length > 0) {
    return response;
  }
  else {
    // special case plural s
    if (keyword.charAt(keyword.length - 1) == "s") {
      var response = UrlFetchApp.fetch(url + keyword.slice(0, keyword.length - 1));
      response = JSON.parse(response);
      if (response.length > 0) {
        return response;
      }
    }
  }
  return null;
}
