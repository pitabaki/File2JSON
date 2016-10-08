var fs = require("fs"),
	path = require("path"),
	PDFParser = require("pdf2json/pdfparser");

var oldPath = path.join(__dirname, 'input');

fs.readdir(oldPath, function (err, files) {
	if (err) {
		console.log(err);
	}

	files.forEach(function(fileName) {
		var file = path.join(oldPath,fileName);
		var stats = fs.statSync(file);

		if (path.extname(file) === ".pdf") {
			fs.readFile(file, function (err, data) {
				if (err) {
					console.log(err);
				}

				var	pdfParser = new PDFParser(this,1);

				    pdfParser.on("pdfParser_dataError", function(errData) {
				    	console.log(errData.parserError);
				    });

				    
				    pdfParser.on("pdfParser_dataReady", function(pdfData) {
				    	var pdfText = JSON.stringify(pdfParser.getRawTextContent()),
				    		pdfHeaders = JSON.stringify(pdfParser.getAllFieldsTypes()),
				    		pdfRawData = JSON.stringify(pdfData);

				    	//console.log(pdfRawData);
				    	fs.writeFile(oldPath + "/pdf_raw.json", pdfRawData);

				    });

				    pdfParser.loadPDF(file);
			});
		}
	});
});