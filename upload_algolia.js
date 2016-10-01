/*
********************

Add records/indices/index to Algolia's database

********************
*/

'use strict';

var fs = require('fs'),
	path = require('path');

var algoliasearch = require('algoliasearch');


var client = algoliasearch('', '');
var htmlIndex = client.initIndex('htmlDocuments');
var pdfIndex = client.initIndex('pdfDocuments');
var htmlDocs = require('./algolia_json/htmlArray.json');
var pdfDocs = require('./algolia_json/pdfArray.json');

var jsonArray = [htmlDocs,pdfDocs];

for ( var n = 0; n < jsonArray.length; n++ ) {
	if (jsonArray[n] === htmlDocs) {
		htmlIndex.addObjects(htmlDocs, function (err, content) {
			if (err) {
				console.log(err);
			}
		  //console.log(err, content);
		});
	} else if (jsonArray[n] === pdfDocs) {
		pdfIndex.addObjects(pdfDocs, function (err, content) {
			if (err) {
				console.log(err);
			}
		  //console.log(err, content);
		});
	}
}