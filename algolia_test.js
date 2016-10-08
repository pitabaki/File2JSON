var fs = require('fs'),
    path = require('path');

var algoliasearch = require('algoliasearch');

var client = algoliasearch('', '');
var index = client.initIndex('htmlDocuments');

// only query string
/*
index.search('query', function searchDone(err, content) {
  if (err) {
    console.log(err);
    return;
  }

  console.log(content);

  for (var h in content.hits) {
    console.log('Hit(' + content.hits[h].objectID + '): ' + content.hits[h].toString());
  }
});*/


// with params
index.search('string', {
  attributesToRetrieve: ['name', 'url'],
  hitsPerPage: 50
}, function searchDone(err, content) {
  if (err) {
    console.error(err);
    return;
  }


  for (var h in content.hits) {
    console.log('Hit(' + content.hits[h].objectID + '): ' + content.hits[h].name + " " + content.hits[h].url);
  }

});