'use strict';

var fs = require('fs'),
	path = require('path');

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
			files.forEach( function(fileName) { //rummage through files/folders

				var directoryCheck = fs.statSync(path.join(newPath,fileName)).isDirectory(),
					newOldPath = path.join(newPath,fileName),
					gitTest = /git$/,
					nodeModTest = /node\_modules/;

				if ((directoryCheck === true) && (fileName.length > 0) && (gitTest.test(newOldPath) === false) && (nodeModTest.test(newOldPath) === false)){
					directoryList(newOldPath);
					directoryListing.push("{\"path\":\"" + newOldPath + "\"}");
				}

			}); // End files foreach
		} else {
			for ( var n = 0; n < directoryListing.length; n++) {
				if (n !== directoryListing.length - 1) {
					directoryObj += directoryListing[n] + ",";
				} else {
					directoryObj += directoryListing[n] + "]";
				}
			}

			fs.writeFile(__dirname + "/directory_listing.json", directoryObj);
		}
			
	}); // End readdir
}

directoryList(oldPath);
