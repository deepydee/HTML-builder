const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'styles');
const destDir = path.join(__dirname, 'project-dist');

bundleCss(srcDir, destDir)
  .catch(error => console.error(error));

async function bundleCss(src, dest) {
  const bundlePath = path.join(dest, 'bundle.css');
  fs.createWriteStream(bundlePath);
  const styles = [];

  // Read contents of source directory
  const files = await fs.promises.readdir(src, {withFileTypes: true});

  // Loop files
  for (const file of files) {
    const filePath = path.join(src, file.name);
    let { ext } = path.parse(filePath);

    if (file.isFile() && ext === '.css') {
      const stream = fs.createReadStream(filePath, 'utf-8');

      // Wait for the stream to finish reading the file
      const style = await new Promise((resolve, reject) => {
        let data = '';
        stream.on('data', chunk => data += chunk);
        stream.on('end', () => resolve(data));
        stream.on('error', error => reject(error));
      });

      styles.push(style);
    }
  }

  styles.forEach(async (style) => {
    try {
      await fs.promises.appendFile(bundlePath, style + '\n');
      console.log('Style has been written to the file');
    } catch (error) {
      console.error('Error writing to file:', error);
    }
  });
}
