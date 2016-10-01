/*
********************

Build out directory listing
(used in read_alt as source)

********************
*/

'use strict';

var fs = require('fs'),
	path = require('path'),
	url = require('url'),
	execFile = require('child_process').execFile,
	http = require('http'),
	subList = require('sublist.json')

var oldPath = path.join(__dirname); //Variable for root path

var directoryListing = [];

/*
Function checks file directory with remote login
*/

function directoryList(pathy) {

	var directoryLength = pathy.length,
		directoryObj = "[",
		newPath = pathy;
	

	fs.readdir(newPath, function(err,files) {
		if ( files.length > 0 ) {
			//console.log("working");
			//console.log(files.length);
			files.forEach( function(fileName) { //rummage through files/folders
				//console.log(fileName + " " + fileName.length);
				var directoryCheck = fs.statSync(path.join(newPath,fileName)).isDirectory(),
					newOldPath = path.join(newPath,fileName),
					gitTest = /git$/,
					nodeModTest = /node\_modules/,
					outputTest = /Output/,
					webcastTest = /webcast/gi;

				if ((directoryCheck === true) && (fileName.length > 0)&& (webcastTest.test(newOldPath) === false) && (outputTest.test(newOldPath) === false) && (gitTest.test(newOldPath) === false) && (nodeModTest.test(newOldPath) === false)){
					directoryList(newOldPath);
					directoryListing.push("{\"path\":\"" + newOldPath + "\"}");
					//console.log(directoryListing);
				}

			}); // End files foreach
		}
		setTimeout( function() {
			//directoryObj += "{\"path\":\"" + "/home/wwwaeroh/public_html/330000/docs/guides" + "\"},";
			for ( var n = 0; n < directoryListing.length; n++) {
				if (n !== directoryListing.length - 1) {
					directoryObj += directoryListing[n] + ",";
				} else {
					directoryObj += directoryListing[n] + "]";
				}
			}
			fs.writeFile(__dirname + "/directory_listing.json", directoryObj);
			/*setTimeout( function() {
				var child = execFile('node', ['read_alt.js'], function (err, stdout, stderr) {
					if (err) {
						console.log(err);
					}
					console.log(stdout);
				});
			}, 5000);*/
		}, 5000);
			
	}); // End readdir
}

directoryList(oldPath);
