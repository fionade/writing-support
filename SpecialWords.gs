var stopwords = [
    'about', 'after', 'all', 'also', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be',
    'been', 'before', 'being', 'between', 'both', 'by', 'came', 'can',
    'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had',
    'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'if', 'in', 'into',
    'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must',
    'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over',
    'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than',
    'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those',
    'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were',
    'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '1',
    '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'];

var connectors = [
  ["however", "but", "in contrast", "nevertheless", "nonetheless", "yet", "on the other hand", "on the contrary", "instead", "all the same"],
  ["therefore", "as a result", "consequently", "as a consequence", "hence", "thus", "because"],
  ["likewise", "similarly", "correspondingly", "in the same way", "also"],
  ["also", "furthermore", "in addition", "moreover", "besides", "for another thing", "and"],
  ["most importantly", "primarily", "above all", "most significantly", "in particular", "particularly", "specifically", "for example", "for instance"],
  ["in fact", "indeed", "actually", "as a matter of fact"],
  ["in conclusion", "in summary", "to sum up", "all in all", "generally speaking"]
];

function getConnectors(word) {
  // first round: direct matches
  for (var i = 0; i < connectors.length; i++) {
    if (connectors[i].indexOf(word) != -1) {
      var array = connectors[i].slice();
      array.splice(connectors[i].indexOf(word), 1);
      return {
        keyword: word,
        alternatives: array
      };
    }
  }

  // second round: connectors that end with the given word
  for (var i = 0; i < connectors.length; i++) {
    for (var j = 0; j < connectors[i].length; j++) {
      var array = connectors[i].slice();
      // Shouldn't be a part of the word
      if (connectors[i][j].indexOf(" " + word) != -1) {
        array.splice(j, 1);
        return {
          keyword: connectors[i][j],
          alternatives: array
        };
      }
    }
  }

  return false;
}
