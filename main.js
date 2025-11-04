const { fileReader, fileConverter } = require('./converter');
const { fileValidator } = require('./validator');

const inputFile = process.argv[2];
const outputFile = process.argv[3];
// kanske ändra så att man kan köra programmet med fler än en infil för att köra en ända stor XML-utfil.

if (!inputFile || !outputFile) {
    console.error('Usage: node main.js <inputFile> <outputFile>');
    process.exit(1);
}

try {
    console.log(`Reading and parsing file: ${inputFile}`);
    const records = fileReader(inputFile);

    console.log('Validating file...');
    fileValidator(records);
    console.log('Validation successful. Converting to XML...');

    fileConverter(records, outputFile);
    console.log(`Conversion complete. Output written to: ${outputFile}`);
} catch (error) {
    console.error('Error during file conversion:', error.message);
    process.exit(1);
    }
