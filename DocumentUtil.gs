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


function getCurrentText() {
  var paragraph = getCurrentParagraph();
  // we don't want to select too little text - there can be no recommendations otherwise
  if (!paragraph || paragraph.length < 30) {
    var selectedText = getSelectedText();
    if (selectedText != null) {
      paragraph = selectedText[0];
    }
    else {
      paragraph = DocumentApp.getActiveDocument().getBody().getText();
    }
  }

  CacheService.getDocumentCache().put("documentText", DocumentApp.getActiveDocument().getBody().getText());

  return paragraph;
}

function checkIfTextChanged() {
  var text = CacheService.getDocumentCache().get("documentText");
  if (text && text == DocumentApp.getActiveDocument().getBody().getText()) {
    return false;
  }
  CacheService.getDocumentCache().put("documentText", DocumentApp.getActiveDocument().getBody().getText());
  return true;
}

function checkIfCurrentTextChanged() {
  var text = CacheService.getDocumentCache().get("currentText");
  if (text && text == getCurrentText()) {
    return false;
  }
  CacheService.getDocumentCache().put("currentText", getCurrentText());
  return true;
}

function checkIfCursorChanged() {
  var cursor = CacheService.getDocumentCache().get("cursor");
  var position = getCursorPosition();
  if (cursor == position) {
    return false;
  }
  CacheService.getDocumentCache().put("cursor", position);
  return true;
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

function getTextAroundCursor() {
  //var position = getCursorPosition();

  //var text = DocumentApp.getActiveDocument().getBody().getText();
  var cursor = DocumentApp.getActiveDocument().getCursor();
  if (cursor) {
    var text = cursor.getElement().asText().getText();
    var position = cursor.getOffset();

    if (position == 1) {
      position = text.length;
    }

    var movingPosition = position;
    var word = "";

    // TODO if starting position is not in a word

    var letter = text.charAt(movingPosition--);

    // Cursor currently at a non-word character
    // Shift starting position
    while (/\s|[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/.test(letter)) {
      letter = text.charAt(movingPosition--);
      position -= 1;
    }

    movingPosition += 2;
    while (!/\s|[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/.test(letter) && movingPosition <= text.length) {
      word += letter;
      letter = text.charAt(movingPosition++)
    }

    var stopWordFound = true;
    movingPosition = position - 1;
    letter = text.charAt(movingPosition--);
    while (stopWordFound && movingPosition > 0) {
      while (!/\s|[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/.test(letter)) {
        word = letter + word;
        letter = text.charAt(movingPosition--);
      }

      // for non stop words and connectors only
      if ((getConnectors(word) || stopwords.indexOf(word.toLowerCase()) < 0) && word.length > 1) {
        stopWordFound = false;
        // TODO: inflection?
      }
      else {
        word = "";
        letter = text.charAt(movingPosition--);
      }
    }

    return word;

  }

  if (position) {

  }

  else {
    // do something else
  }

}

function tintKeywords(keywords, textColour) {

  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();

  // TODO: how to deal with user-induced colouring and links?!!

  for (var i = 0; i < keywords.length; i++) {
    var variations = keywords[i].variations;
    Object.keys(variations).forEach(function (key) {
      var regex = new RegExp("\\b(" + key + ").*?\\b","gi");

      var match;
      while (match = regex.exec(body.getText())) {
        body.editAsText().setForegroundColor(match.index, match.index + match[0].length - 1, textColour);
      }
    });
  }
}

function highlightKeywords(keywords, highlightColour) {
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();

  // TODO: how to deal with user-induced colouring and links?!!

  for (var i = 0; i < keywords.length; i++) {
    var variations = keywords[i].variations;
    Object.keys(variations).forEach(function (key) {
      var regex = new RegExp("\\b(" + key + ").*?\\b","gi");

      var match;
      while (match = regex.exec(body.getText())) {
        body.editAsText().setBackgroundColor(match.index, match.index + match[0].length - 1, highlightColour);
      }
    });
  }
}

function highlightOneTerm(term, highlightColour) {
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();

  var regex = new RegExp("\\b(" + term + ").*?\\b","gi");

  var match;
  while (match = regex.exec(body.getText())) {
    body.editAsText().setBackgroundColor(match.index, match.index + match[0].length - 1, highlightColour);
  }
}

function testTintKeywords() {
  tintKeywords(["deep", "feature", "data"], "#880000");
}
