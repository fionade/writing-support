/** Gets the selected text in the active document */
function getSelectedText() {
  var selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    var text = [];
    var elements = selection.getSelectedElements();
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].isPartial()) {
        var element = elements[i].getElement().asText();
        var startIndex = elements[i].getStartOffset();
        var endIndex = elements[i].getEndOffsetInclusive();

        text.push(element.getText().substring(startIndex, endIndex + 1));
      } else {
        var element = elements[i].getElement();
        // Only translate elements that can be edited as text; skip images and
        // other non-text elements.
        if (element.editAsText) {
          var elementText = element.asText().getText();
          // This check is necessary to exclude images, which return a blank
          // text element.
          if (elementText != '') {
            text.push(elementText);
          }
        }
      }
    }
    if (text.length == 0) {
      throw 'Please select some text.';
    }
    return text;
  } else {
    return null;
  }
}


function addParagraphsToDoc(content) {
  
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();
    for (var i = content.length - 1; i >= 0; i--) {
    body.appendParagraph(content[i].getValue());
  }
}

function getCurrentParagraph() {
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (cursor) {
    return cursor.getElement().asText().getText();
  }
}

function getCursorPosition() {
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (cursor) {
    return cursor.getOffset();
  }
}

function tintKeywords(keywords, textColour) {

  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();
  
  // TODO: how to deal with user-induced colouring and links?!!
  body.editAsText().setForegroundColor("#000000");
  
  keywords = ["deep", "data", "feature"];
  
  // fake case insensitivity
  var iterations = keywords.length;
  for (i = 0; i < iterations; i++) {
    keywords.push(keywords[i].charAt(0).toUpperCase() + keywords[i].slice(1));
  }
 
  for (i = 0; i < keywords.length; i++) {
    var currentWord = keywords[i];
    // colour the keywords
    // link them as well?
    
    var searchResult = body.findText(currentWord);
    
    while (searchResult != null) {
      var text = searchResult.getElement().asText();
      var textString = text.getText();
      var start = searchResult.getStartOffset();
      var end = searchResult.getEndOffsetInclusive();
      text.setForegroundColor(Math.max(0, start - 1), Math.min(end + 1, body.getText().length - 1), textColour);
      
      // search for next match
      searchResult = body.findText(currentWord, searchResult);
    }
    
  }
}

function testTintKeywords() {
  tintKeywords(["deep", "feature", "data"], "#880000");
}