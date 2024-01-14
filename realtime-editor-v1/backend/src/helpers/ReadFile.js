const fs = require('fs');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);

async function readFile(filePath) {
  try {
    const data = await readFileAsync(filePath, 'utf8');
    return data;
  } catch (error) {
    throw error;
  }
}

module.exports = { readFile };