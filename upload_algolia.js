/*
********************

Add records/indices/index to Algolia's database

********************
*/

'use strict';

var fs = require('fs'),
	path = require('path');

var algoliasearch = require('algoliasearch');


var client = algoliasearch();
var index = client.initIndex('htmlDocuments');
var htmlDocs = require('./algolia_json/pdfArray.json');

index.addObjects(htmlDocs, function (err, content) {
	if (err) {
		console.log(err);
	}
  //console.log(err, content);
});