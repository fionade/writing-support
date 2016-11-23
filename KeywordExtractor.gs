/** 
 * Extracts keywords from a given text, returns them in a list with stem, variations,
 * tf-idf (one document only though), term. The attribute "repetition" does not work for one document (always 1).
 * The server uses the natural and pos nodejs packages.
 */
function extractKeywords(text) {
  var url = "http://ec2-52-88-26-22.us-west-2.compute.amazonaws.com:8080/keywords";
  
  var data = {
    "text" : text
  };
  
  var body = { "method": "post",
              "payload" : data
             };
  var result = UrlFetchApp.fetch(url, body).getContentText();
  var keywords = JSON.parse(result);
  
  return keywords;
}