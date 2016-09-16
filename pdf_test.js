    let fs = require('fs'),
        PDFParser = require("pdf2json/pdfparser");

    let pdfParser = new PDFParser(this,1);

    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
        fs.writeFile("./Aerohive_Ed-K-12-DeployGuide-1-Planning.txt", pdfParser.getRawTextContent());
    });

    pdfParser.loadPDF("./input/Aerohive-gypsy-documents/Aerohive_Ed-K-12-DeployGuide-1-Planning.pdf");