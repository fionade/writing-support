function getKeyConcepts() {

  // retrieve the entire text
  // return most frequent keywords

  var text = DocumentApp.getActiveDocument().getBody().getText();

  var result = extractKeywords(text);

  // TODO identify keywords in proximity - maybe they are composed terms? e.g. deep learning

  var terms = [];

  for (var i = 0; i < Math.min(6, result.length); i++) {
    terms.push({term: result[i].term, variations: result[i].variations});
  }

  return terms;

}

function getTextMetrics() {

  var url = baseUrl + "getTextMeasures/";

  var text = DocumentApp.getActiveDocument().getBody().getText();

  var metrics = {};

  var data = {
    "text" : text
  };

  var body = { "method": "post",
              "payload" : JSON.stringify(data)
             };
  var result = UrlFetchApp.fetch(url, body).getContentText();
  metrics = JSON.parse(result);

  // get synonyms

  if (metrics && metrics.mostFrequentWords) {
    metrics.mostFrequentWords.forEach(function(d) {
      d.synonyms = getSynonyms(d.term);
    });
  }

  if (metrics && metrics.frequentConjunctions) {
    metrics.frequentConjunctions.forEach(function(d) {
      d.synonyms = getSynonyms(d.term);
    });
  }

// now in the query below
//  metrics.wordCount = text.length;
//  var metrics = {
//    fleschKincaidScore : Math.round(getFleschKincaid(text) * 100) / 100
//  };

  return metrics;
}

function getFleschKincaid() {
  text = DocumentApp.getActiveDocument().getBody().getText();

  var tokenizer = new LanguageToolkit.Tokenizer();
  var tokens = tokenizer.tokenize(text);
  var sentences = text.match(/\(?[^\.\?\!]+[\.!\?]\)?/g).length;
  var words = tokens.length;
  var syllable = new LanguageToolkit.Syllable();
  var syllables = syllable.getSyllableCount(tokens);

  var fleschKincaidScore;
  if (!syllables || !sentences || !words) {
    fleschKincaidScore = NaN;
  }
  else {
    fleschKincaidScore = (0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59;
  }

  return Math.round(fleschKincaidScore * 100) / 100;
}

// alternative synonyms
// Thesaurus service provided by words.bighugelabs.com

// yMo8f4ezlbYEsYTTvNbS
// var s = document.createElement("script");
//s.src = "http://thesaurus.altervista.org/thesaurus/v1?word=peace&language=en_US&output=json&key=test_only&callback=process"; // NOTE: replace test_only with your own KEY
//document.getElementsByTagName("head")[0].appendChild(s);
//
//function process(result) {
//  output = "";
//  for (key in result.response) {
//    list = result.response[key].list;
//    output += list.synonyms+"<br>";
//  }
//  if (output)
//    document.getElementById("synonyms").innerHTML = output;
//}
