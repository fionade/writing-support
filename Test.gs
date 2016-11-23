function testExtractKeywords() {
 extractKeywords("My dog has fleas."); 
}

function testExtractKeywordsFromParagraph() {
  extractKeywords(getCurrentParagraph()); 
}

function testGetURankResult() {
  //getURankRating("Visualization");
  
  var urank = new URank();
  urank.getURankRating("learn");
}

function testGetURankResultFromParagraph() {
  var urank = new URank();
  var keywords = extractKeywords(getCurrentParagraph());
  
  // get a ranking for the top 3 keywords
  var result = urank.getURankRating(keywords.slice(0,3));
  Logger.log(result);
}

function testGetComments() {
  var commentList = Drive.Comments.list(DocumentApp.getActiveDocument().getId());
  Logger.log(commentList);
}

function testGetRevisionHistory() {
  var revisionHistory = Drive.Revisions.list(DocumentApp.getActiveDocument().getId());
  Logger.log(revisionHistory);
}

function testDocumentStatistics() {
  var stats = new DocumentStatistics();
  stats.updateStatistics();
  Logger.log(stats);
}

function testTintKeywords() {
  tintKeywords(["and"], "#ff0000");
}
