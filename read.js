'use strict';

var fs = require('fs'),
	path = require('path'),
	PDFParser = require("pdf2json/PDFParser"),
	url = require('url'),
	htmlToJson = require('html-to-json/lib/htmlToJson'),
	count = 0;

var	newPath = __dirname + '/output/';

String.prototype.trunc = function( n, useWordBoundary ){
	var isTooLong = this.length > n,
	s_ = isTooLong ? this.substr(0,n-1) : this;
	s_ = (useWordBoundary && isTooLong) ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
	return  isTooLong ? s_ : s_;
};

function mainProcess(){
	fs.readdir('../node_pdf_test/test'/* Directory Name */, function(err,files) {

		if (err) {
			console.log(err);
		}

		files.forEach(function(fileName) {
			
			
			var file = path.join(__dirname,'../node_pdf_test/test/' /* Directory Name */ ,fileName),
				newPath = path.join(__dirname,'../node_pdf_test/output/');
			var stats = fs.statSync(file),
				regexpPDF = /pdf$/,
				regexpJS = /js$/,
				regexpHTML = /html$/,
				regexpHTM = /htm$/,
				regexpJSON = /json$/;

			if (regexpPDF.test(fileName) === true) {

				fs.readFile(fileName, function(err,data) {

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
				    	pdfText = characterLimit(pdfText);
				    	pdfText = "{\"paragraph\":[" + pdfText;
				    	//console.log(pdfText);
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
				var homeUrl = url.parse("http://www.kumadev.com"),
					textArray = [],
					hrefArray = [],
					headingsArray = [],
					paraArray = [],
					comboArray = [];

				var rawJSONName = "website.json",
					finalCheck = /Final Deliverables/;

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

				/*
				Array.prototype.removeExcess = function( obj ){

				};

				String.prototype.trunc = function( n, useWordBoundary ){
					var isTooLong = this.length > n,
					s_ = isTooLong ? this.substr(0,n-1) : this;
					s_ = (useWordBoundary && isTooLong) ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
					return  isTooLong ? s_ : s_;
				};*/

				
				function dataObj(name, data){
					this.name = name;
					this.data = data;
				}
				console.log("Where am I");
				parseLinks.request(url.format(homeUrl)).done(function (links) {
					paraArray = paraArray[0]; //remove paragraph duplicates if any exist
					headingsArray = headingsArray[0]; //remove heading duplicates if any exist

					var paragraphs = new dataObj('paraArray', paraArray),
						headings = new dataObj('headingsArray', headingsArray);

					comboArray.push(objectBuild(headings));
					comboArray.push(",");
					comboArray.push(objectBuild(paragraphs));
					comboArray = comboArray.join(""); //Combines headings and paragraphs together
					comboArray = characterLimit(comboArray);
					comboArray = comboArray.replace(/\}\,\{/g,",");

					fs.writeFile(newPath + rawJSONName, comboArray); //Writes JSON file
				}, function (err) {
				  console.log(err);
				});

			}

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
	    		mainProcess();
	    	}, 500);
	  	} else {
	  		mainProcess();
	  	}
	}
    //fs.rmdirSync(path); //reinstate if you're looking to delete the folder
};


/*

Call characterLimit to limit any text. Variable passed must be a string

*/

function characterLimit(text) {
	var endChar = "\"]}";
	text = text.trunc(8000,true);
	text += endChar;
	return text;
}


/*

Function to create object arrays out of html content

*/

function objectBuild(array) {
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

folderCleanse(newPath); //Call folder cleanse and main process

return false;


/*
fs.readFile('ask.js','UTF-8', function(err, contents) {

	if (err) {
		console.log(err);
	}
	console.log(contents);

});*/