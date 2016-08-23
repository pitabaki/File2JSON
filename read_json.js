var fs = require('fs'),
	path = require('path');

var jsonCheck = /json$/,
	checkPath = '../node_pdf_test/output/';

fs.readdir(checkPath, function (err, files) {
	if ( err ) {
		console.log(err);
	}

	files.forEach( function (fileName) {
		var file = path.join(__dirname, checkPath /* Directory Name */ , fileName);

		if (jsonCheck.test(fileName) === true) {
			fs.readFile(file, 'utf8', function (err, contents) {
				if (err) {
					console.log(err);
				}

				var jsonContent = JSON.parse(contents);
				console.log(jsonContent);
			});
		}
	});
});