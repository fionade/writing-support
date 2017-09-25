function addTopicToCache(topic) {
  // TODO: change to save and store on server
  var cache = CacheService.getUserCache();
  var cachedTopics = cache.get("topics");

  if (cachedTopics) {
    cachedTopics = JSON.parse(cachedTopics);
    if (cachedTopics.indexOf(topic) == -1) {
      cachedTopics.push(topic);
      cache.put("topics", JSON.stringify(cachedTopics));
    }
  }
  else {
    cachedTopics = [topic];
    cache.put("topics", JSON.stringify(cachedTopics));
  }

}

function removeTopicFromCache(topic) {
  var cache = CacheService.getUserCache();
  var cachedTopics = cache.get("topics");

  if (cachedTopics) {
    cachedTopics = JSON.parse(cachedTopics);
    var index = cachedTopics.indexOf(topic)
    if (index != -1) {
      cachedTopics.splice(index, 1);
      cache.put("topics", JSON.stringify(cachedTopics));
    }
  }
}

function getTopicsFromCache() {
  var cache = CacheService.getUserCache();
  var cachedTopics = cache.get("topics");

  if (cachedTopics) {
    cachedTopics = JSON.parse(cachedTopics);
    return cachedTopics;
  }
  return null;
}

function getParagraphStructure() {

  var paragraphs = DocumentApp.getActiveDocument().getBody().getParagraphs();

  var documentText = DocumentApp.getActiveDocument().getBody().getText();

  // Title, subtitle, heading 1 - 5, Normal. Enum
  // lower level > child. same level > sibling. upper level > next parent

  var data = {
    "text" : documentText,
    "offset" : 0
  };

  var rootNode = new Node(data, 0, null);
  var tree = new Tree(rootNode);

  var previousLevel = 0;
  var lastInsertedNode = rootNode;

  paragraphs.forEach(function(d){
    var currentLevel = getParagraphLevel(d.getHeading());
    var data = {
      "text" : d.getText(),
      "offset" : 0
    }

    data.offset = documentText.indexOf(data.text);

    var node = null;

    if (previousLevel < currentLevel) {
      // Current paragraph is a subparagraph of the previous one
      node = new Node(data, currentLevel, lastInsertedNode);
    }
    else if (previousLevel == currentLevel) {
      node = new Node(data, currentLevel, lastInsertedNode.parent);
    }
    else {
      var potentialParent = lastInsertedNode;
      while (potentialParent.parent != null && potentialParent.parent.level > currentLevel) {
        potentialParent = potentialParent.parent;
      }
      node = new Node(data, currentLevel, potentialParent);
    }

    tree.addNode(node);
    lastInsertedNode = node;
    previousLevel = currentLevel;

  });

  return tree;
}

function getParagraphsPerLevel() {

  var paragraphs = DocumentApp.getActiveDocument().getBody().getParagraphs();
  var documentText = DocumentApp.getActiveDocument().getBody().getText();

  var levels = [[], [], [], [], [], [], [], [], []];

  for (var i = 0; i < paragraphs.length; i++) {
    var d = paragraphs[i];
    var text = d.getText();

    if (text.length > 0) {
      var currentLevel = getParagraphLevel(d.getHeading());
      var data = {
        "text" : text,
        "startOffset" : documentText.indexOf(text),
      };

      data.endOffset = data.startOffset + data.text.length;

      if (i == paragraphs.length - 1) {
        data.endOffset = documentText.length - 1;
      }
      else {
        var forwardIndex = i + 1;
        while (forwardIndex < paragraphs.length && getParagraphLevel(paragraphs[forwardIndex].getHeading()) > currentLevel) {
          if (paragraphs[forwardIndex].getText().length > 0) {
            data.endOffset = documentText.indexOf(paragraphs[forwardIndex].getText()) + paragraphs[forwardIndex].getText().length;
          }
          forwardIndex++;
        }
      }

      levels[currentLevel - 1].push(data);
    }

  }

  var axisTickValues = ["Document", "Subtitle", "Heading 1", "Heading 2", "Heading 3", "Heading 4", "Heading 5", "Heading 6", "Paragraph"];
  var toRemoveIndex = levels.length - 2;
  while(toRemoveIndex >= 0 && levels[toRemoveIndex].length < 1) {
    levels.splice(toRemoveIndex, 1);
    axisTickValues.splice(toRemoveIndex, 1);
    toRemoveIndex--;
  }

  // also remove subtitle level if not used
  if (levels[1] && levels[1].length < 1) {
    levels.splice(1, 1);
    axisTickValues.splice(1, 1);
  }

  // manually adding all the text to level 0 if there is no document title
  if (levels[0].length == 0) {
    levels[0].push({
      text : documentText,
      startOffset : 0,
      endOffset : documentText.length
    });
  }

  return {
    paragraphs: levels,
    labels: axisTickValues
  };

}

function getParagraphLevel(paragraphHeading) {

  if (paragraphHeading == DocumentApp.ParagraphHeading.TITLE) {
    return 1;
  }
  else if (paragraphHeading == DocumentApp.ParagraphHeading.SUBTITLE) {
    return 2;
  }
  else if (paragraphHeading == DocumentApp.ParagraphHeading.HEADING1) {
    return 3;
  }
  else if (paragraphHeading == DocumentApp.ParagraphHeading.HEADING2) {
    return 4;
  }
  else if (paragraphHeading == DocumentApp.ParagraphHeading.HEADING3) {
    return 5;
  }
  else if (paragraphHeading == DocumentApp.ParagraphHeading.HEADING4) {
    return 6;
  }
  else if (paragraphHeading == DocumentApp.ParagraphHeading.HEADING5) {
    return 7;
  }
  else if (paragraphHeading == DocumentApp.ParagraphHeading.HEADING6) {
    return 8;
  }
  else if (paragraphHeading == DocumentApp.ParagraphHeading.NORMAL) {
    return 9;
  }
  return 10;
}

function Node(data, level, parent) {
  this.data = data;
  this.level = level;
  this.parent = parent;
  this.children = [];
}

function Tree(rootNode) {
  this.root = rootNode;
}

Tree.prototype.addNode = function(node) {
  node.parent.children.push(node);
}

/*add tags as soon as they are in the text

Detect paragraphs, sections + topics

possibility for user to add/remove own keywords


orientation for heading levels
how nested is the text? bar graph

two views: topics per paragraph, section structure*/
