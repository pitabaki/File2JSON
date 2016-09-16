'use strict';

var fs = require('fs'),
	path = require('path'),
	PDFParser = require("pdf2json/pdfparser"),
	htmlToJson = require('html-to-json/lib/htmlToJson');

var newPath = path.join(__dirname, '/output/'),
	oldPath = __dirname;

var pdfParser = new PDFParser(this,1);
console.log(pdfParser);

console.log(oldPath);

/*
fs.readdir(oldPath, function (err,files) {

	if (err) {
		console.log(err);
	}

	files.forEach(function (fileName) {

		var htmCheck = /htm$/,
			file = path.join(oldPath,fileName);
		if ( htmCheck.test(fileName) ) {
			console.log(file);
			fs.readFile(file, 'utf8', function (err, data) {

				var homeURL = data,
					metaArray = [],
					metaContent = [];

				if (err) {
					console.log(err);
				}

				htmlToJson.parse(homeURL, function() {

					this.map('meta', function($m) {
						metaContent.push($m);
						metaArray.push($m.text().trim().replace(/\"/g, "'"));
						return $m.text();
					}); //pulls text from paragraph tags

				}).done(function (items) {
					console.log(metaContent);
				});
			});
		}	
	});
});*/