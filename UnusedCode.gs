///** Gets selected text, parses a corresponding a wikipedia page
//* and appends its content as paragraphs to the doc */
//function lookUp() {
//  var selectedText = getSelectedText();
//  
//  var content = getWikipediaContent(selectedText);
////    var content = getSearch(selectedText);
//
//  addParagraphsToDoc(content);
//  
//}
//
//
///** Looks up content for a keyword and adds it to the doc */
//function getSearch(keyword) {
//  var encodedKeyword = encodeURI(keyword);
//  var html = UrlFetchApp.fetch('https://www.google.com/#q=' + encodedKeyword).getContentText();
//  
//  var doc = XmlService.parse(html);
//  var html = doc.getRootElement();
//  
//  var content = getElementsByClassName(html, 'rc');
//  return content;
//}
//
//
//function addParagraphsToDoc(content) {
//  
//  var document = DocumentApp.getActiveDocument();
//  var body = document.getBody();
//    for (var i = content.length - 1; i >= 0; i--) {
//    body.appendParagraph(content[i].getValue());
//  }
//}


//  var cursor = DocumentApp.getActiveDocument().getCursor();
//  if (cursor) {
//    var words = cursor.getElement().asText().getText().split(' ');
//    for (var word in words) {
//      if (word.length > 0 && word != " ") {
//        return getWiktionaryContent(words[1]);
//      }
//    }
//    
//    var paragraph = element.getParent().asParagraph();
//    
//    var text = paragraph.getText();
//    var words = text.split("\w");


//var ServerCommunicator = (function () {
//
//	function ServerCommunicator(vals) {
//		//TODO GET SERVER ADDRESS
//      this.serverUrl = "http://moregrasp-devel.know-center.tugraz.at/nodegdr"
//	}
//        
//	var sendAjaxRequest = function (data, _thisAfter, callbackAfter) {
//      
//      var options = {
//        "payload" : data,
//        "muteHttpExceptions" : true
//      }
//      
//
//      var response = UrlFetchApp.fetch(this.serverUrl, options).getContentText();
//      response = JSON.parse(response);
//      
//      for (var key in response){
//        Logger.log(key);
//      }
//      
//      
//		$.ajax({
//			type : "GET",
//			// set the destination for the query
//			url : this.serverUrl + '?callback=?',
//
//		});
//	}
//
//	var Sender = {
//
//		getCollection : function (collectionID, _thisAfter, callbackAfter) {
//			data = {
//				operation : "getCollection",
//				collectionID : collectionID
//			};
//			sendAjaxRequest.call(this, data, _thisAfter, callbackAfter);
//		},
//		init : function (_thisAfter, callbackAfter) {
//			data = {
//				operation : "init"
//			};
//			sendAjaxRequest.call(this, data, _thisAfter, callbackAfter);
//
//		},
//		loadCollection : function (collectionID, _thisAfter, callbackAfter) {
//			//console.log("ServerCommunicator loadCollection");
//			data = {
//				operation : "loadCollection",
//				collectionID : collectionID
//			};
//			sendAjaxRequest.call(this, data, _thisAfter, callbackAfter);
//		},
//		searchAndLoadData : function (keywords, _thisAfter, callbackAfter) {
//			console.log("ServerCommunicator searchAndLoadData");
//			data = {
//				operation : "searchAndLoadData",
//				keywords : keywords
//			};
//			sendAjaxRequest.call(this, data, _thisAfter, callbackAfter);
//		},
//		getDataset : function (datasetName, _thisAfter, callbackAfter) {
//		//	console.log("ServerCommunicator getDataset");
//			data = {
//				operation : "getDataset",
//				datasetName : datasetName
//			};
//			sendAjaxRequest.call(this, data, _thisAfter, callbackAfter);
//		},
//		onChange : function (rMode, rWeight, selectedKeywords, _thisAfter, callbackAfter) {
//			//console.log("ServerCommunicator on change " + JSON.stringify(selectedKeywords));
//			
//			var h = [];
//			for(var i = 0; i < selectedKeywords.length; i++){
//				var object = {
//					repeated : selectedKeywords[i].keyword.repeated,
//					variations : selectedKeywords[i].keyword.variations,
//					index : selectedKeywords[i].keyword.index,
//					colorCategory : selectedKeywords[i].keyword.colorCategory,
//					dataLength : selectedKeywords[i].dataLength,
//					color : selectedKeywords[i].color,
//					weight : selectedKeywords[i].weight
//				}
//				h.push(object);
//			}
//			data = {
//				operation : "onChange",
//				selectedKeywords : h,
//				rWeight : rWeight,
//				rMode : rMode
//			};
//			sendAjaxRequest.call(this, data, _thisAfter, callbackAfter);
//		},
//		getDocumentInfo : function (parameters) {
//			//console.log("ServerCommunicator on change");
//
//			data = {
//				operation : "getDocumentInfo",
//				documentId : parameters.documentId
//			};
//			sendAjaxRequest.call(this, data, parameters.scope, parameters.callback);
//		},
//		addPdfToProject : function (parameters) {
//			data = {
//				operation : "addPdfToProject",
//				documentId : parameters.documentId,
//				projectId : parameters.projectId
//			}
//			//	 console.log("THE FUNCTION: " + parameters.callback);
//			
//			sendAjaxRequest.call(this, data, parameters.scope, parameters.callback);
//			
//		},
//		generateBibtex : function (parameters) {
//			data = {
//				operation : 'generateBibtex',
//				documentIds : parameters.docIds
//			}
//			sendAjaxRequest.call(this, data, parameters.scope, parameters.callback);
//		},
//		showMore : function(parameters){
//			data = {
//				operation : 'showMore'
//			}
//			sendAjaxRequest.call(this, data,  parameters.scope, parameters.callback);
//		}
//	}
//
//	var Receiver = {}
//
//	ServerCommunicator.prototype = {
//		getCollection : Sender.getCollection,
//		init : Sender.init,
//		loadCollection : Sender.loadCollection,
//		onChange : Sender.onChange,
//		searchAndLoadData : Sender.searchAndLoadData,
//		getDocumentInfo : Sender.getDocumentInfo,
//		addPdfToProject : Sender.addPdfToProject,
//		generateBibtex : Sender.generateBibtex,
//		getDataset : Sender.getDataset,
//		showMore : Sender.showMore
//	};
//
//	return ServerCommunicator;
//})();

// doesn't work anymore because the keyword has to be formatted properly
//function lookUpURank(keyword) {
//  var urank = new URank();
//  return urank.getURankRating([keyword]);
//}