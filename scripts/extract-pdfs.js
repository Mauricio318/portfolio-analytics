const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const filePaths = [
  'old_version/pdf/cv/Currículo do Sistema de Currículos Lattes (Mauricio Garcia Bimbu).pdf',
  'old_version/pdf/cv/Currículo do Sistema de Currículos Lattes CV(Mauricio Garcia Bimbu).pdf',
  'old_version/pdf/cv/Mauricio_Garcia_Bimbu.pdf'
];

let currentIndex = 0;
let combinedText = '';

function parseNext() {
  if (currentIndex >= filePaths.length) {
    const outPath = path.resolve('/tmp/extracted_bimbus_cvs.txt');
    fs.writeFileSync(outPath, combinedText);
    console.log('PDFs extraídos para ' + outPath);
    return;
  }

  const fp = filePaths[currentIndex];
  const fullPath = path.resolve(process.cwd(), fp);
  
  if (fs.existsSync(fullPath)) {
    const pdfParser = new PDFParser(this, 1); // 1 = returns raw text
    pdfParser.on("pdfParser_dataError", errData => {
      combinedText += `\n--- ERRO LENDO: ${fp} ---\n`;
      currentIndex++;
      parseNext();
    });
    pdfParser.on("pdfParser_dataReady", pdfData => {
      combinedText += `\n--- ENTRADA DE: ${fp} ---\n`;
      combinedText += pdfParser.getRawTextContent();
      currentIndex++;
      parseNext();
    });
    pdfParser.loadPDF(fullPath);
  } else {
    combinedText += `\n--- ARQUIVO NAO ENCONTRADO: ${fp} ---\n`;
    currentIndex++;
    parseNext();
  }
}

parseNext();
