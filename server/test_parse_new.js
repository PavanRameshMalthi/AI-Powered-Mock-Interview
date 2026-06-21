const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const uploadsDir = './uploads';
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));

(async () => {
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    console.log(`\n--- Parsing ${file} ---`);
    try {
      const dataBuffer = fs.readFileSync(filePath);
      console.log(`Buffer length: ${dataBuffer.length}`);
      
      const parser = new PDFParse({ data: dataBuffer });
      const textResult = await parser.getText();
      console.log(`Extracted text length: ${textResult.text.length}`);
      console.log(`Preview (500 chars):\n${textResult.text.substring(0, 500)}`);
    } catch (err) {
      console.error(`Error parsing ${file}:`, err);
    }
  }
})();
