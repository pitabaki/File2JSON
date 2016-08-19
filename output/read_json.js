var fs = require('fs'),
	path = require('path');

var jsonCheck = /json$/;

fs.readdir('../node_pdf_test/test/', function (err, files) {
	if ( err ) {
		console.log(err);
	}

	files.forEach( function (fileName) {
		var file = path.join(__dirname,'../node_pdf_test/test/' /* Directory Name */ , fileName);

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