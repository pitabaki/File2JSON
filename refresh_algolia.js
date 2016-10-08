/*
********************

Clear and build database

********************
*/

'use strict';

var fs = require('fs'),
	path = require('path');

var algoliasearch = require('algoliasearch');

var ghost = 'pdfDocuments';

var client = algoliasearch('', '');
var index = client.initIndex(ghost);
var pdfDocs = require('./algolia_json/pdfArray.json');

client.deleteIndex(ghost, function (err) {
	if (err) {
		console.log(err);
	}

	console.log(ghost + " has been successfully cleared!");
});

setTimeout(function(){

	index.addObjects(pdfDocs, function (err, content) {
		if (err) {
			console.log(err);
		}

		console.log(ghost + " has been successfully replenished");
	  //console.log(err, content);
	});

}, 1000);
