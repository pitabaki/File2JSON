'use strict';

var fs = require('fs'),
	path = require('path'),
	PDFParser = require("pdf2json/PDFParser"),
	url = require('url'),
	htmlToJson = require('html-to-json/lib/htmlToJson'),
	count = 0;

var	newPath = path.join(__dirname,'/output/'), //temp relative (local). Change to permanent URL
	oldPath = __dirname + '/input/'; //Variable for root path

//oldPath = url.parse('http://www.kumadev.com/');

var exec = require('child_process').exec;

exec("ssh berkidot@peterberkidesign.com 'ls public_html/peterberkidesign/'",
  function (error, stdout, stderr) {
    console.log('remote files: ' + stdout);
	folderCleanse(newPath); //Call folder cleanse and main process
    //mainProcess();
}); //Because of connection time delay, functions beyond return false are read and processable

return false;

//console.log(oldPath);
//console.log(__dirname + oldPath);
//return false;

function mainProcess(){

	/*

	Call characterLimit to limit any text. Variable passed must be a string

	*/

	function characterLimit(text, length, end) {
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
		comboArray = comboArray.replace(/Click for More Information/gi,"");
		comboArray = comboArray.replace(/\"isRejected\"\:false\,/gi, ""); //Removes unnecessary 'isRejected' key
		comboArray = comboArray.replace(/\"isFulfilled\"\:true\,/gi, ""); //Removes unnecessary 'isFulfilled' key
		comboArray = comboArray.replace(/\[\{ | \}\] | \]\}/g, ""); //Remove JSON punctuation, since this will be replaced
		if ( array.name === "headingsArray") { // Applies 'headings' key to parsed headings (defined as h1,h2,h3,etc tags)
			comboArray = comboArray.replace(/fulfillmentValue/gi, "headings");
		//console.log(comboArray);
		} else { //Applies 'content' tag to all other content (p tags, pretty much)
			comboArray = comboArray.replace(/fulfillmentValue/gi, "content");
		}
		return comboArray;
	}

	function objectBuildLocal(array) { //Preps header and paragraph content for local html files
		'use strict';
		var comboArray = [];
		if(array.name === "headingsArray"){
			comboArray.push("\"headings\"\:");
		} else if (array.name === "paraArray") {
			comboArray.push("\"content\"\:");
		}
		var temp = array.data;
		temp = temp.replace(/(\r\n|\n|\r|\s+)/gi, " ").trim();
		comboArray.push("\"" + temp + "\"");
		return comboArray.join("");
	}

	/*

	Function limits character count

	*/

	String.prototype.trunc = function( n, useWordBoundary ){
		var isTooLong = this.length > n,
		s_ = isTooLong ? this.substr(0,n-1) : this;
		s_ = (useWordBoundary && isTooLong) ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
		return  isTooLong ? s_ : s_;
	};

	/*

	Read local directory

	*/

	fs.readdir(oldPath/* Directory Name */, function(err,files) {

		if (err) {
			console.log(err);
		}

		files.forEach(function(fileName) {
			

			var regexpHTTP = /^http/,
			regexpHTTPS = /^https/;

			if (regexpHTTP.test(oldPath) !== true && regexpHTTPS.test(oldPath) !== true) {
				var file = path.join(oldPath /* Directory Name */ ,fileName);
			} else {
				var file = path.join(oldPath,fileName);
			}

			

			var stats = fs.statSync(file),
				regexpPDF = /pdf$/,
				regexpJS = /js$/,
				regexpHTML = /html$/,
				regexpHTM = /htm$/,
				regexpJSON = /json$/;

			/*if (regexpHTTP.test(oldPath) !== true && regexpHTTPS.test(oldPath) !== true) {
				
			} else {
				var file = path.join(oldPath,fileName);
			}*/
			console.log(file);

			var birth = "\"birthTime\"\:\"" + stats.birthtime + "\"\,",
				pathway = "\"url\"\:\"" + file + "\"\,";

			if (regexpPDF.test(fileName) === true) { //process for PDFs

				fs.readFile(file, function(err,data) {

					if (err) {
						console.log(err);
					}

					var	pdfParser = new PDFParser(this,1);
					var rawJSONName = fileName.replace(".pdf",""),
						rawTextName = fileName.replace(".pdf",".txt"),
						pdfArray = "[{";


				    pdfParser.on("pdfParser_dataError", function(errData) {
				    	console.log(errData.parserError);
				    });

				    
				    pdfParser.on("pdfParser_dataReady", function(pdfData) {
				    	var pdfText = JSON.stringify(pdfParser.getRawTextContent());
				    	pdfText = characterLimit(pdfText, 8000, true);
				    	pdfText = "{" + pathway + birth + "\"content\":[" + pdfText; //creates string containing url, birth time, and content
				    	//fs.writeFile(newPath + rawJSONName + "_test.json", JSON.stringify(pdfParser.getAllFieldsTypes()));
				        fs.writeFile(newPath + rawJSONName + ".json", pdfText);
				    });

				    pdfParser.loadPDF(file);

				});
			} else if ((regexpJS.test(fileName) === true) || (regexpJSON.test(fileName) === true)) {

				fs.readFile(fileName, function(err,data) {

					if (err) {
						console.log(err);
					}

					//console.log(__dirname);

					fs.writeFile(newPath + fileName, data, 'utf8');

				});
			} else if ((regexpHTML.test(fileName) === true) || (regexpHTM.test(fileName) === true)) {
				//return false;
				//var homeUrl = url.parse("http://docs.aerohive.com/330000/docs/help/english/ng/Content/learning-whats-new.htm"),
				var textArray = [],
					hrefArray = [],
					headingsArray = [],
					paraArray = [],
					comboArray = [];

				var rawJSONName = fileName.replace(regexpHTML, 'json');

				var homeURL;

				if (typeof homeURL === "undefined") { //if the url is local

					var content = fs.readFile(file, 'utf8', function(err, data){
						if (err) {
							console.log(err);
						}

						homeURL = data;
						//console.log(data);


						htmlToJson.parse(homeURL, function(){
							this.map('p,a', function($p){
								paraArray.push($p.text().trim());
								return $p.text();
							});
							this.map('h1,h2,h3,h4,h5,h6', function($hx){
								headingsArray.push($hx.text().trim());
								return $hx.text();
							});
						}).done(function (items) {
							paraArray = paraArray.join(" ");
							headingsArray = headingsArray.join(" ");

							function dataObj(name, data){
								this.name = name;
								this.data = data;
							}

							var paragraphs = new dataObj('paraArray', paraArray),
								headings = new dataObj('headingsArray', headingsArray);
							comboArray.push("{" + pathway + birth + objectBuildLocal(headings) + "," + objectBuildLocal(paragraphs) + "}");
							comboArray = comboArray.join("");
							comboArray = characterLimit(comboArray, 8000, false);
							console.log(comboArray);
							fs.writeFile(newPath + rawJSONName, comboArray); //Writes JSON file

						}, function (err) {
							console.log(err);
						});

						//paraArray.push(homeURL);

						
						
					});
					return false;
				}

				var parseLinks = htmlToJson.createParser(['a[href]', {
					'text': function ($a) {
						textArray.push($a.text().trim());
						return $a.text().trim();
					},
					'href': function ($a) {
						return url.resolve(homeUrl, $a.attr('href'));
					},
					'paragraph' : function (){
						return this.get('href').then(function (href) {
							var parsedUrl = url.parse(href);

							if ( parsedUrl.protocol === 'http:' && parsedUrl.hostname === homeUrl.hostname) {
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
				
				function dataObj(name, data){
					this.name = name;
					this.data = data;
				}

				parseLinks.request(url.format(homeUrl)).done(function (links) {
					finalJSONBuild();
					fs.writeFile(newPath + rawJSONName, comboArray); //Writes JSON file
				}, function (err) {
				  console.log(err);
				});

				function finalJSONBuild(){
					paraArray = paraArray[0]; //remove paragraph duplicates if any exist
					headingsArray = headingsArray[0]; //remove heading duplicates if any exist

					var paragraphs = new dataObj('paraArray', paraArray),
						headings = new dataObj('headingsArray', headingsArray);

					comboArray.push(objectBuildURL(headings));
					comboArray.push(",");
					comboArray.push(objectBuildURL(paragraphs));
					comboArray = comboArray.join(""); //Combines headings and paragraphs together
					comboArray = characterLimit(comboArray, 8000, true); //Call on comboArray because headings are more important than paragraphs
					comboArray = comboArray.replace(/\}\,\{/g,",");
				}

			}// end if/else test(html)

		});
	});
}

function folderCleanse(path) {

	if( fs.existsSync(path) ) {

	  	var folderLength = fs.readdirSync(path).length;

	  	if (folderLength > 0){

	  		fs.readdirSync(path).forEach(function(file) {
		    	var curPath = path + file;
		    	fs.unlinkSync(curPath);
	    	});
	    	setTimeout(function(){
	    		mainProcess(); //Runs main program after destination folder is emptied
	    	}, 500);
	  	} else {
	  		mainProcess(); //Runs main program if destination folder is empty
	  	}
	}
    //fs.rmdirSync(path); //reinstate if you're looking to delete the folder
};

return false;


/*
fs.readFile('ask.js','UTF-8', function(err, contents) {

	if (err) {
		console.log(err);
	}
	console.log(contents);

});*/