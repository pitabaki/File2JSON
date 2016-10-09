var fs = require('fs'),
	path = require('path'),
	Youtube = require("youtube-api"),
	url = require('url'),
	request = require('request'),
	htmlToJson = require('html-to-json/lib/htmlToJson');

var videoArray = [],
	apiKey = "AIzaSyB6IG_PyGnLSJlfPaWZ0Us-D2BeRbNcmkw";

var	newPath = path.join(__dirname,'/algolia_json/'); //temp relative (local). Change to permanent URL

Youtube.authenticate({
    type: "key",
    key: apiKey
});

/*
Youtube.videos.list({
    "part": "id",
    "chart":"mostPopular",
    "maxResults": 50
}, function (err, data) {
    console.log(err, data);
});*/

/*
Youtube.playlistItems.list({
	"part":"contentDetails",
	"playlistId":"UUVrYoLMkIg_MjJ43a3BJqJg",
	"maxResults":"50"
}, function (err, info) {
	if (err) {
		console.log(err);
	}

	info.items.forEach(function (element) {
    	videoArray.push(element.contentDetails.videoId);
    });
});


setTimeout(function() {
	videoArray.forEach(function (vidId) {
		var homeUrl = url.parse("https://www.youtube.com/watch?v=" + vidId),
			textArray = [],
			paraArray = [],
			headingsArray = [];





		var parseLinks = htmlToJson.createParser(['a[href]', {
		  'text': function ($a) {
		    return $a.text().trim();
		  },
		  'href': function ($a) {
		    return url.resolve(homeUrl, $a.attr('href'));
		  },
		  'headings': function () {
		    return this.get('href').then(function (href) {
		      var parsedUrl = url.parse(href);

		      // Only bother Prolific's server for this example
		      if (parsedUrl.protocol === 'http:' && parsedUrl.hostname === homeUrl.hostname) {
		        return parseHeadings.request(href);
		      } else {
		        return null;
		      }
		    });
		  }
		}]);

		var parseParagraphs = htmlToJson.createParser(['p', function ($p) {
		  return $p.text().trim();
		}]);

		console.log(parseParagraphs);

		var parseHeadings = htmlToJson.createParser(['h1,h2,h3,h4,h5,h6', function ($hx) {
		  return $hx.text().trim();
		}]);

		parseLinks.request(url.format(homeUrl)).done(function (links) {
			links.forEach(function (items) {
				//console.log(items.text);
		  	});
		}, function (err) {
		  throw err;
		});

	});
}, 5000);*/

		/*

		var parseLinks = htmlToJson.createParser(['a[href]', {
			'text': function ($a) {
				textArray.push($a.text().trim());
				return $a.text().trim();
			},
			'href': function ($a) {
				return url.resolve(vidURL, $a.attr('href'));
			},
			'paragraph' : function () {
				return this.get('href').then(function (href) {
					var parsedUrl = url.parse(href);
					if ( parsedUrl.protocol === 'http:' && parsedUrl.hostname === vidURL.hostname) {
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
					if (parsedUrl.protocol === 'http:' && parsedUrl.hostname === vidURL.hostname) {
						headingsArray.push(parseHeadings.request(href));
						return parseHeadings.request(href);
					} else {
						return null;
					}
				});
			}
		}]);

		var parseParagraphs = htmlToJson.createParser(['p', function ($p) {
		  return $p.text().trim();
		}]);

		var parseHeadings = htmlToJson.createParser(['h1,h2,h3,h4,h5,h6', function ($hx) {
		  return $hx.text().trim();
		}]);

		parseLinks.request(url.format(vidURL)).done(function (links) {
			fs.writeFile(newPath + 'youtubeArray.json', paraArray); //Writes JSON file
		}, function (err) {
		  console.log(err);
		}); */


Youtube.channels.list({
    "part": "contentDetails",
    "id": "UCvriYJRBd8TpO7Po8h0oCOw",
    "maxResults": 50
}, function (err, data) {

	if (err) {
		console.log(err);
	}

    var playId = "";

    data.items.forEach(function (element) {
    	var tempId = "\"" + element.contentDetails.relatedPlaylists.uploads + "\"",
    		videoId = element.contentDetails.relatedPlaylists.uploads;
		Youtube.playlistItems.list({
			"part":"contentDetails",
			"playlistId": videoId,
			"maxResults": 50
		}, function (err, info) {

			if (err) {
				console.log(err);
			}
		
			info.items.forEach(function (element) {
		    	videoArray.push(element.contentDetails.videoId);

		    	var videoLink = "https://www.googleapis.com/youtube/v3/videos?id=" + element.contentDetails.videoId + "&part=contentDetails&key=" + apiKey;

				request({
					url: videoLink,
					json: true
				}, function (error, response, body) {

					if (!error && response.statusCode === 200) {
						console.log(body) // Print the json response
					}
				});
		    	//console.log(url.parse(videoLink));
		    });
		});
    	return playId = tempId;
    });
    

});

/*
Youtube.playlistItems.list({
	"part":"contentDetails",
	"playlistId":"UUvriYJRBd8TpO7Po8h0oCOw",
	"maxResults": 50
}, function (err, info) {

	if (err) {
		console.log(err);
	}

	info.items.forEach(function (element) {
    	videoArray.push(element.contentDetails.videoId);
    	console.log(element);
    });
});
*/
/*
Youtube.channels.list({
    "part": "contentDetails",
    "id": "UCVrYoLMkIg_MjJ43a3BJqJg",
    "maxResults": 50
}, function (err, data) {

	if (err) {
		console.log(err);
	}

    var playId = "";

    data.items.forEach(function (element) {
    	var tempId = "\"" + element.contentDetails.relatedPlaylists.uploads + "\"";
    	return playId = tempId;
    });

    console.log(playId);

	Youtube.playlistItems.list({
		"part": "id",
		"playlistId": playId,
		"maxResults":"50"
	}, function (err,info) {
		if (err) {
			console.log(err);
		}

		console.log(info);
	});
});*/