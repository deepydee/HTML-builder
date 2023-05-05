const path = require('path');
const readline = require('readline');
const fs = require('fs');

const fname = path.resolve(__dirname, 'dest.txt');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function writeToFile(text) {
  try {
    await fs.promises.appendFile(fname, text + '\n');
    console.log('Text has been written to the file');
  } catch (error) {
    console.error('Error writing to file:', error);
  }
}

function start() {
  console.log('Type some text to write to the file, or type "exit" to quit');

  rl.on('line', (input) => {
    if (input === 'exit') {
      process.exit(0);
    }

    writeToFile(input);
  });
}

process.on('exit', () => {
  rl.close();
  console.log('Goodbye!');
});

start();
