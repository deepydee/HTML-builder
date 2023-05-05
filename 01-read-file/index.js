const fs = require('fs');
const path = require('path');
const { stdout } = process;

const fname = path.resolve(__dirname, 'text.txt');
const stream = fs.createReadStream(fname, 'utf-8');

let data = '';
stream.on('data', chunk => data += chunk);
stream.on('end', () => stdout.write(data + '\n'));
stream.on('error', error => stdout.write('Error ' + error.message));
