var fs = require('fs'),
	path = require('path'),
	PDFParser = require("pdf2json/pdfparser"),
	url = require('url'),
	htmlToJson = require('html-to-json/lib/htmlToJson'),
	http = require('http');

var boundless = url.parse('http://www.aerohive.com/templates/app-utility-urls.json'),
	boundless_string = 'http://www.aerohive.com/templates/app-utility-urls.json';

http.get(boundless, function (res) {

	var jsonDoc = "";

	console.log(res);
	res.setEncoding('utf8');
	res.on('data', function (content) {

		jsonDoc += content;

		//fs.writeFile(__dirname + 'boundless.json', JSON.parse(content));
		/*var boundlessJSON = JSON.parse(content);
		console.log(boundlessJSON);*/
		/*
		setTimeout(function(){
			var bound = content.trim();
			console.log(bound + "\n\n");
		}, 1000);*/
		//console.log("\n\n" + "type of content: " + typeof content + "\n\n");

	});

	res.on('end', function() {
		var data = JSON.parse(jsonDoc);

		fs.writeFile(__dirname + '/input/bound.json', jsonDoc);
		//console.log(typeof data);
	});

}).on('error', function (err) {
	console.log(err);
});

/*

fs.readFile(boundless, 'utf8', function (err, content) {
	if (err) {
		console.log(err);
	}
	console.log(content);
});

*/