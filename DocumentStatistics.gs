function testDocumentStats() {
  getDocumentStatistics(true);
}

function clearCache() {
  var cache = CacheService.getDocumentCache();
  cache.remove("document-statistics");
}

function getDocumentStatistics(visible) {
  
  // create a document statistics object if there isn't any yet
  // actually recreated for each access from the sidebar, as a new conneciton is established
  if (!documentStatistics) {
    var documentStatistics = new DocumentStatistics();
  }
  
  documentStatistics.updateStatistics(visible);
  
  // TODO
  // do stuff with the statistics
  // guesswork?
  
  return documentStatistics.items;
  
}

function showActivity(visible) {
  var html = HtmlService.createHtmlOutputFromFile('ActivityDialog.html')
      .setWidth(700)
      .setHeight(600);
  DocumentApp.getUi().showModalDialog(html, "Activity");
}


/** Prototype to track what's happening with the document.
 *  Records document length, cursorPosition, headingStyles
 *  which can be saved at different moments in time
 */
var DocumentStatistics = function() {
  
  this.doc = DocumentApp.getActiveDocument();
  this.items = [];
  
};

DocumentStatistics.prototype.updateStatistics = function(visible) {
  
  // get the character count of the document
  var length = this.doc.getBody().getText().length;
  
  // get the current cursor position
  var cursorOffset = getCursorPosition();
  
   // get selection if cursor is not set
  if (!cursorOffset) {
    var selection = DocumentApp.getActiveDocument().getSelection();
    if (selection) {
      var elements = selection.getRangeElements();
      var selectionRange = [];
      if (elements.length > 0) {
        selectionRange = [elements[0].getStartOffset(), elements[elements.length - 1].getEndOffsetInclusive()];
      }
    }
  }
  
  // count different heading types
  var headingStyles = {};
  var paragraphs = this.doc.getBody().getParagraphs();
  for (var i = 0; i < paragraphs.length; i++) {
    var paragraph = paragraphs[i];
    var headingStyle = paragraph.getHeading();
    if (headingStyles[headingStyle]) {
      headingStyles[headingStyle] += 1;
    }
    else {
      headingStyles[headingStyle] = 1;
    }
  }
  
  // save the items in cache
  var cache = CacheService.getDocumentCache();
  var cachedItems = JSON.parse(cache.get("document-statistics"));
  var cacheString = "";
  var newItem = new DocumentStatisticsItem(new Date().getTime(), length, headingStyles, cursorOffset, selectionRange, visible)
  if (cachedItems) {
    cachedItems.push(newItem);
    this.items = cachedItems;
  }
  else {
    this.items.push(newItem);
  }
  // TODO: deal with full cache
//  if (cache.get("isFull") == "true") {
//    this.items.shift();
//  }
  var cacheString = JSON.stringify(this.items);
  if (cacheString.length >= 100000) {
    // cache.put("isFull", true);
    // remove previous items if the cache item is too large
    for (var i = 0; i < 20; i++) {
      this.items.shift();
    } 
    cacheString = JSON.stringify(this.items);
  }
  cache.put("document-statistics", cacheString);
  sendActivityToServer(newItem);
}

var DocumentStatisticsItem = function(time, length, headingStyles, cursorOffset, selection, visible) {
  this.time = time;
  this.length = length;
  this.headingStyles = headingStyles;
  this.cursorOffset = cursorOffset;
  this.selection = selection;
  this.visible = visible
}

function getRevisions() {
  var fileId = DocumentApp.getActiveDocument().getId();
  var revisions = Drive.Revisions.list(fileId);
  if (revisions.items && revisions.items.length > 0) {
    Logger.log(revisions.items[0]);
//    for (var i = 0; i < revisions.items.length; i++) {
//      var revision = revisions.items[i];
//      var date = new Date(revision.modifiedDate);
//      Logger.log(revision);
//      Logger.log('Date: %s, File size (bytes): %s', date.toLocaleString(),
//          revision.fileSize);
//    }
  } else {
    Logger.log('No revisions found.');
  }
}

/** 
 * Sends an activity tracking object to be stored in a database on the server
 */
function sendActivityToServer(activity) {
  
  // TODO: global server url variable
  var url = "http://ec2-52-88-26-22.us-west-2.compute.amazonaws.com:8080/activity";
  var documentId = DocumentApp.getActiveDocument().getId();
  // TODO only if authorised
  // var userId = Session.getActiveUser().getEmail();
  activity['documentId'] = documentId;      
  
  var data = {
    "activity" : activity
  };
  
  var body = { "method": "post",
              "payload" : JSON.stringify(data)
             };
  var result = UrlFetchApp.fetch(url, body).getContentText();
  Logger.log(result);
}