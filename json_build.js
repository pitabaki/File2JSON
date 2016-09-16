/*
********************

Generate JSON files from HTML/PDF documents
(For Algolia upload)

********************
*/

'use strict';

var fs = require('fs'),
	path = require('path'),
	PDFParser = require("pdf2json/pdfparser"),
	url = require('url'),
	htmlToJson = require('html-to-json/lib/htmlToJson');

var	newPath = path.join(__dirname,'/algolia_json/'), //temp relative (local). Change to permanent URL
	oldPath = path.join(__dirname); //Variable for root path

var pdfFinalArray = [],
	htmlFinalArray = [],
	articles = /(\s+)(and|it|the|a|an|to|are|if|in|we|you|me|is|he|his|she|that|with|of)(\s+)/gi, // to remove from paragraphs after main paragraph has been captured
	nonRoman = /[^\u0000-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF]/g;

/*
Main Process initiates watch ()
*/

function mainProcess(pathy) {

	/*

	Read local directory

	*/

	fs.readdir(pathy/* Directory Name */, function(err,files) {

		if (err) {
			console.log(err);
		}

		
		files.forEach(function(fileName) {
			var file = path.join(pathy,fileName);
			//console.log(typeof pathy);
			jsonProcess(file,fileName);

		});
	});

	/*

	File System Watch looks for changes in directories listed above.

	*/


	//var fileJSON = path.join(newPath, fileName.replace(/\..*/gi,".json"));

	/*
	fs.watch(oldPath, { persistent: true, interval: 5007 }, function(eventType, fileName) {
		console.log(`event type is ${eventType}`);

		//var file = path.join(oldPath ,fileName);

		fs.exists(file, function (exists) {
			if (exists === true) {
				jsonProcess(fileName);
			} else {
				fs.unlink(file, function (err) {
					if (err) {
						console.log(err);
					}
				});
			}
		});
	});*/
}

function jsonProcess(file,specFile) {

			if (specFile === undefined) {
				return false;
			}

			var regexpHTTP = /^http/,
			regexpHTTPS = /^https/;

			var stats = fs.statSync(file),
				regexpPDF = /pdf$/,
				regexpJS = /js$/,
				regexpHTML = /html$/,
				regexpHTM = /htm$/,
				regexpJSON = /json$/;

			//Define additional key/values here. These will apply regardless of filetype
			var birth = "\"birthTime\"\:\"" + stats.birthtime + "\"\,",
				pathway = "\"url\"\:\"" + file + "\"\,",
				imgPath = "\"img\"\:\"" + file + "\"\,",
				fileId = "\"name\"\:\"" + specFile.replace(/\..+/g, "") + "\"\,",
				categorical = "\"categories\"\:\"\"\,",
				recordOrganizer = "\"record_organizer\"\:\"" + Math.round(Math.random() * 1000000000) + "\"\,",
				docSummary = "\"summary\"\:\"";

			var fileInfo = [recordOrganizer,birth,pathway,imgPath,fileId,categorical]; //Add key/values here

			if (regexpPDF.test(specFile) === true) { //process for PDFs

				var typeOf = "\"type\"\:\"" + "PDF" + "\"\,"; //typeOf takes on the property PDF

				fileInfo.push(typeOf);

				fs.readFile(file, function(err,data) {

					if (err) {
						console.log(err);
					}

					var	pdfParser = new PDFParser(this,1);
					var rawJSONName = specFile.replace(".pdf",".json"),
						rawTextName = specFile.replace(".pdf",".txt"),
						pdfArray = "[{",
						headerArray = [], //push all field types to this array to concatenate
						arrayText= ""; //can't leave undefined otherwise it writes undefined


				    pdfParser.on("pdfParser_dataError", function(errData) {
				    	console.log(errData.parserError);
				    });

				    
				    pdfParser.on("pdfParser_dataReady", function(pdfData) {
				    	var pdfText = JSON.stringify(pdfParser.getRawTextContent()),
				    		pdfHeaders = JSON.stringify(pdfParser.getAllFieldsTypes()),
				    		pdfRawData = JSON.stringify(pdfData),
				    		tempArray = [];


				    	fs.writeFile(newPath + 'pdfTest.json', pdfRawData); // Remove with footer issues has been fixed

				    	var heads = JSON.parse(pdfHeaders);

				    	for (var key in heads) {
				    		headerArray.push(heads[key].id.replace(/_/gi," ") + ", "); //pushes header id (if applicable)
				    	}

				    	headerArray = headerArray.join(""); //concatenates headerArray into a single string

				    	pdfText = pdfCharLimit(pdfText, 400, 6000); //limit characters


				    	//Loop through array of meta information (defined before if/else)
				    	fileInfo.forEach(function(val){
				    		arrayText += val;
				    	});

				    	for (var i = 0; i < pdfText.length; i++) {

				    		if (i + 1 !== pdfText.length) {

				    			tempArray.push("{" + arrayText + "\"headings\":\"" + headerArray + "\"," + "\"content\": \"" + pdfText[i].replace(/--/, "") + "\"},"); //creates string containing array variables and pdfText)

				    		} else {

				    			tempArray.push("{" + arrayText + "\"headings\":\"" + headerArray + "\"," + "\"content\": \"" + pdfText[i].replace(/--/, "") + "\"}"); //creates string containing array variables and pdfText)

				    		}
				    	}

				    	pdfFinalArray.push(tempArray.join(""));

				    });

				    pdfParser.loadPDF(file);

				}); //End ReadFile

			} else if ((regexpHTML.test(specFile) === true) || (regexpHTM.test(specFile) === true)) {

				var typeOf = "\"type\"\:\"" + "HTML" + "\"\,"; //typeOf takes on the property PDF

				fileInfo.push(typeOf);

				function dataObj(name, data) {
					this.name = name;
					this.data = data;
				}

				var homeURL;
				//var homeUrl = url.parse("http://docs.aerohive.com/330000/docs/help/english/ng/Content/learning-whats-new.htm"),

				//HTML Arrays
				var textArray = [],
					hrefArray = [],
					headingsArray = [],
					paraArray = [],
					comboArray = [];

				var rawJSONName = specFile.replace(/html$|htm$/gi, 'json');

				if (homeURL === undefined) { //if the url is local

					var updateReg = /update.htm$/gi;

					fs.readFile(file, 'utf8', function(err, data) {

						if (err) {
							console.log(err);
						}

						homeURL = data;

						htmlToJson.parse(homeURL, function() {

							this.map('p', function($p) {
								paraArray.push($p.text().trim().replace(/\"/g, "'"));
								return $p.text();
							}); //pulls text from paragraph tags

							this.map('h1,h2,h3,h4,h5,h6', function($hx) {
								headingsArray.push($hx.text().trim().replace(/\"/gi, "'"));
								return $hx.text();
							}); //pulls text from headers and anchors tags

						}).done(function (items) {

							//console.log(recordOrganizer);

							/*
							paraArray = paraArray.join(" ");
							headingsArray = headingsArray.join(" ");
							*/

							var count = 0,
								textLimit = 400;

							if (paraArray.length > headingsArray.length) {

								for (var n = 0; n < paraArray.length; n++) {

									
									if (paraArray[n].length >= 100 && count === 0) {
										docSummary += exCharRemoval(paraArray[n]).trunc(400,true); 
										docSummary += "\"\,";
										console.log(docSummary);
										fileInfo.push(docSummary);
										count++;
									}



									if (headingsArray[n] !== undefined) { //Check if headings is empty. If it's not, keep content unchanged

										var paragraphs = new dataObj('paraArray', paraArray[n]),
											headings = new dataObj('headingsArray', headingsArray[n]),
											arrayText = "";

										//Loops through meta data (defined above)
										fileInfo.forEach(function(val){
								    		arrayText += val;
								    	});

										if (n > 0) { // take care of that pesky comma
											//push to comboArray (later gets stringified then printed as object)
											comboArray.push(",{" + arrayText + objectBuildLocal(headings) + "," + htmlCharLimit(objectBuildLocal(paragraphs), textLimit, false) + "}");
										} else {
											//push to comboArray (later gets stringified then printed as object)
											comboArray.push("{" + arrayText + objectBuildLocal(headings) + "," + htmlCharLimit(objectBuildLocal(paragraphs), textLimit, false) + "}");	
										}


									} else { //if headings is undefined, assign an empty string to it
										var paragraphs = new dataObj('paraArray', paraArray[n]),
											headings = new dataObj('headingsArray', ''),
											arrayText = "";

										//Loops through meta data (defined above)
										fileInfo.forEach(function(val){
								    		arrayText += val;
								    	});

										comboArray.push(",{" + arrayText + objectBuildLocal(headings) + "," + htmlCharLimit(objectBuildLocal(paragraphs), textLimit, false) + "}");
									}
								}
							} else if (paraArray.length <= headingsArray.length && paraArray.length + headingsArray.length !== 0) {

								for (var n = 0; n < headingsArray.length; n++) {

									if (paraArray[n] !== undefined) { //Check if headings is empty. If it's not, keep content unchanged

										var paragraphs = new dataObj('paraArray', paraArray[n]),
											headings = new dataObj('headingsArray', headingsArray[n]),
											arrayText = "";

										//Loops through meta data (defined above)
										fileInfo.forEach(function(val){
								    		arrayText += val;
								    	});

										if (n > 0) { // take care of that pesky comma
											//push to comboArray (later gets stringified then printed as object)
											comboArray.push(",{" + arrayText + objectBuildLocal(headings) + "," + htmlCharLimit(objectBuildLocal(paragraphs), textLimit, false) + "}");
										} else {
											//push to comboArray (later gets stringified then printed as object)
											comboArray.push("{" + arrayText + objectBuildLocal(headings) + "," + htmlCharLimit(objectBuildLocal(paragraphs), textLimit, false) + "}");	
										}


									} else { //if headings is undefined, assign an empty string to it
										var paragraphs = new dataObj('paraArray', ''),
											headings = new dataObj('headingsArray', headingsArray[n]),
											arrayText = "";

										//Loops through meta data (defined above)
										fileInfo.forEach(function(val){
								    		arrayText += val;
								    	});

										comboArray.push(",{" + arrayText + objectBuildLocal(headings) + "," + htmlCharLimit(objectBuildLocal(paragraphs), textLimit, false) + "}");
									}
								}
							}
							
							
							htmlFinalArray.push(comboArray.join("")); //Global empty array for storing final JSON array

							comboArray = "[" + comboArray.join("") + "]";
							//comboArray = htmlCharLimit(comboArray, 8000, false);
							//fs.writeFile(newPath + rawJSONName, comboArray); //Writes JSON file

						}, function (err) {
							console.log(err);
						});
	
					});

					return false;

				} else {

					return false;

				}

				/*
				var parseLinks = htmlToJson.createParser(['a[href]', {
					'text': function ($a) {
						textArray.push($a.text().trim());
						return $a.text().trim();
					},
					'href': function ($a) {
						return url.resolve(homeUrl, $a.attr('href'));
					},
					'paragraph' : function () {
						return this.get('href').then(function (href) {
							var parsedUrl = url.parse(href);

							if (parsedUrl.protocol === 'http:' && parsedUrl.hostname === homeUrl.hostname) {
								paraArray.push(parseParagraphs.request(href));
								return parseParagraphs.request(href);
							} else {
								return null;
							}
						});
					},
					'headings': function () {
						return this.get('href').then(function (href) {
							var parsedUrl = url.parse(href);

							// Only bother Prolific's server for this example
							if (parsedUrl.protocol === 'http:' && parsedUrl.hostname === homeUrl.hostname) {
								headingsArray.push(parseHeadings.request(href));
								return parseHeadings.request(href);
							} else {
								return null;
							}
						});
					}
				}]);

				var parseParagraphs = htmlToJson.createParser(['p,a', function ($p) {
				  return $p.text().trim();
				}]);

				var parseHeadings = htmlToJson.createParser(['h1,h2,h3,h4,h5,h6', function ($hx) {
				  return $hx.text().trim();
				}]);

				parseLinks.request(url.format(homeUrl)).done(function (links) {
					finalJSONBuild();
					fs.writeFile(newPath + rawJSONName, comboArray); //Writes JSON file
				}, function (err) {
				  console.log(err);
				}); */

			} // end if/else test(html)
}

setTimeout(function() {

	finalPrint(htmlFinalArray, 'htmlArray.json'); //function to generate html json file
	finalPrint(pdfFinalArray, 'pdfArray.json'); //function to generate pdf json file
	
}, 5000);

function finalPrint(array, filename) {
	var tempArray = [];

	for (var y = 0; y < array.length; y++) { // For-loop adds comma to the beginning of every string after the first one
		if (y === 0 && array[y].length !== 0) {
			tempArray.push(array[y]);
		} else if (y > 0 && array[y].length !== 0) {
			tempArray.push("," + array[y]);
		}
	}

	array = "[" + tempArray.join("") + "]";

	if (array[1] === ",") {
		array = array.replace(/,/, "");
	}
	//comboArray = htmlCharLimit(comboArray, 8000, false);
	fs.writeFile(newPath + filename, array); //Writes JSON file
}

/*

Call pdfCharLimit to limit any html text. Variable passed must be a string

*/

function pdfCharLimit(text, length, secondLength) {
	var pdfCharArray = [],
		startLength = text.length;

	while (text.length > 0) { // loop through entire document

		if (text.length === startLength) { //

			var tempText = text.trunc(length, true).replace(/\"/, "");
			pdfCharArray.push(tempText);
			text = text.replace(text.trunc(length, true), "");

		} else { //called for every subsequent grouping of text
			var tempText = text.trunc(secondLength, true);
			text = text.replace(text.trunc(secondLength, true), "");

			for (var n = 0; n < 2; n++) {
				var tempString = "";
				tempString = tempText.replace(articles, " "); //Removes articles and other extraneous characters
				tempString = tempString.replace(nonRoman, ""); //Removes non-Roman characters (Kanji inherited from formatting)
				tempText = tempString;
			}
			pdfCharArray.push(tempText.replace(/\"/, "'"));
		}
	}

	return pdfCharArray;

}
/*

Call htmlCharLimit to limit any html text. Variable passed must be a string

*/

function htmlCharLimit(text, length, end) {
	if (end === true) {
		var endChar = "\"]}",
			endCharAlt = "]}";

		text = text.trunc(length,true);

		var lastCharNum = text.length - 1;
		var lastChar = text[lastCharNum];
		if (lastChar === "\"") {
			text += endCharAlt;
		} else {
			text += endChar;
		}
		//text += endChar;		
	} else if (end === false) {
		text = text.trunc(length,true);
		var lastCharNum = text.length - 1;
		var lastChar = text[lastCharNum];
		if (lastChar !== "\"") {
			text += "\"";
		}
	}
	return text;
}


/*

Function to create object arrays out of html content

*/

function objectBuildURL(array) { //Preps header and paragraph content for remote HTML files
	'use strict';
	var comboArray = [];
	comboArray = JSON.stringify(array.data);
	comboArray = comboArray.replace(/\"isRejected\"\:false\,/gi, ""); //Removes unnecessary 'isRejected' key

	comboArray = comboArray.replace(/\"isFulfilled\"\:true\,/gi, ""); //Removes unnecessary 'isFulfilled' key

	comboArray = comboArray.replace(/\[\{ | \}\] | \]\}/g, ""); //Remove JSON punctuation, since this will be replaced

	if (array.name === "headingsArray") { // Applies 'headings' key to parsed headings (defined as h1,h2,h3,etc tags)
		comboArray = comboArray.replace(/fulfillmentValue/gi, "headings");

	} else { //Applies 'content' tag to all other content (p tags, pretty much)
		comboArray = comboArray.replace(/fulfillmentValue/gi, "content");
	}
	return comboArray;
}

function objectBuildLocal(array) { //Preps header and paragraph content for local html files
	'use strict';
	var comboArray = [];
	if (array.name === "headingsArray") {
		comboArray.push("\"headings\"\:");
	} else if (array.name === "paraArray") {
		comboArray.push("\"content\"\:");
	}
	var temp = array.data;

	temp = exCharRemoval(temp);

	comboArray.push("\"" + temp + "\"");
	return comboArray.join("");
}

/*

Function removes extraneous characters

*/

function exCharRemoval(stringy) {
	for (var n = 0; n < 2; n++) {
		stringy = stringy.replace(/([~\`\^\*\[\]\\';,\/{}|\\":<>])/g, "");
		stringy = stringy.replace(/(\r\n|\n|\r|\s+)/gi, " ").trim();	
	}
	return stringy;
}

/*

Function checks string for valid characters within a string

*/

function isValid(stringy){
	return !/[\~\`\!\#\$\%\^\&\*\+\=\-\[\]\\\'\;\,\/{}|\\":<>\?]/g.test(stringy);
}

/*

Function limits character count

*/

String.prototype.trunc = function( n, useWordBoundary ) {
	var isTooLong = this.length > n,
		s_ = isTooLong ? this.substr(0,n-1) : this;

	s_ = (useWordBoundary && isTooLong) ? s_.substr(0,s_.lastIndexOf(' ')) : s_;

	return  isTooLong ? s_ : s_;
};

/*

Function assembles final JSON object for HTML files

*/

function finalJSONBuild() {
	paraArray = paraArray[0]; //remove paragraph duplicates if any exist
	headingsArray = headingsArray[0]; //remove heading duplicates if any exist

	var paragraphs = new dataObj('paraArray', paraArray),
		headings = new dataObj('headingsArray', headingsArray);

	comboArray.push(objectBuildURL(headings) + "," + objectBuildURL(paragraphs));
	comboArray = comboArray.join(""); //Combines headings and paragraphs together
	comboArray = htmlCharLimit(comboArray, 8000, true); //Call on comboArray because headings are more important than paragraphs
	comboArray = comboArray.replace(/\}\,\{/g,",");
}

/*

Function clears specified directory of contents, or creates directory then loads data into it

*/

function folderCleanse(path,direcPath) { //For single folder processes

	if (fs.existsSync(path)) { //Checks to see path passed exists (`output` in this case)

	  	var folderLength = fs.readdirSync(path).length; //Checks how many items are in that directory

	  	if (folderLength > 0) {

	  		fs.readdirSync(path).forEach(function(file) {
		    	var curPath = path + file;
		    	fs.unlinkSync(curPath);
	    	});
	    	setTimeout(function() {
	    		mainProcess(direcPath); //Runs main program after destination folder is emptied
	    	}, 500);

	  	} else {

	  		mainProcess(direcPath); //Runs main program if destination folder is empty

	  	}

	} else {

		fs.mkdir(newPath, function(){
			mainProcess(direcPath);
		});

	}
    //fs.rmdirSync(path); //reinstate if you're looking to delete the folder
}

/*

Function reads directory.json file and spits out directory listing

*/

function jsonDirectory(file) { //parse JSON based directory

	var pathy = fs.readFileSync(file,'utf8');
	var jsonContent = JSON.parse(pathy);

	jsonContent.forEach(function(paths){
		mainProcess(paths.path);
	});
}

/*

Function checks if output directory exists. If not, output directory will be created

*/

function outputCheck(file) {
	if (fs.existsSync(newPath)) {
		jsonDirectory(file); //reads json file after assessing output directory exists
	} else {
		fs.mkdir(newPath, function(){
			jsonDirectory(file); //reads json file after creating output directory
		})
	}
}

outputCheck('directory_listing.json');

return false;