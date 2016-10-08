var fs = require('fs'),
	path = require('path');

var pdfArray = [],
	pdfInfo = "",
	pathy = __dirname + "/algolia_json/";

fs.readdir(pathy, function (err, files) {
	if (err) {
		console.log(err);
	}

	files.forEach(function (fileName) {
		var exHTML = /htmlArray/,
			exPDF = /pdfArray/;

		if (exHTML.test(fileName) === false && exPDF.test(fileName) === false) {
			var file = path.join(pathy,fileName);
			
			fs.readFile(file, 'utf8', function (err, content) {
				if (err) {
					console.log(err);
				}

				if (pdfArray.length === 0) {
					pdfArray.push("[" + content);
				} else {
					pdfArray.push("," + content);
				}
				fs.unlinkSync(file);

				setTimeout(function() {
					pdfInfo = pdfArray.join("");
					pdfInfo += "]";
					fs.writeFile(pathy + "pdfArray.json", pdfInfo);
				}, 1000);
				//console.log(pdfArray);

			});
		}
	});
});