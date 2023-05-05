const path = require('path');
const fs = require('fs');

const componentsDir = path.resolve(__dirname, './components');
const templatePath = path.resolve(__dirname, './template.html');
const distPath = path.resolve(__dirname, './project-dist');
const stylesSrcPath = path.resolve(__dirname, './styles');
const assetsSrcPath = path.join(__dirname, '/assets');

createDistDirectory(distPath)
  .then(() => replaceTags(templatePath))
  .then(indexFileContent => generateIndexFile(indexFileContent))
  .then(() => bundleCss(stylesSrcPath, distPath))
  .then(() => copyDir(assetsSrcPath, path.join(distPath, '/assets')))
  .catch(error => console.error(error));

async function createDistDirectory(distPath) {
  try {
    await fs.promises.mkdir(distPath);
    console.log('Dist directory created successfully...');
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.log('Dist directory already exists, skipping creation...');
    } else {
      throw error;
    }
  }
}

async function replaceTags(templatePath) {
  let template = '';

  const templateStream = fs.createReadStream(templatePath, 'utf-8');
  templateStream.on('data', chunk => template += chunk);

  await new Promise((resolve, reject) => {
    templateStream.on('end', () => {
      resolve();
    });

    templateStream.on('error', error => {
      reject(error);
    });
  });

  const out = await replaceTagByComponent(template);
  return out;
}

async function generateIndexFile(fileContent) {
  const indexPath = path.join(distPath, './index.html');

  // write indexFile to indexFilePath
  fs.writeFile(indexPath, fileContent, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log('Index file written successfully...');
  });
}

async function replaceTagByComponent(fileContents) {
  const regex = /{{(.+?)}}/g;
  const matches = [...fileContents.matchAll(regex)];

  if (!matches) {
    return;
  }

  for (const match of matches) {
    const componentName = match[1];
    const componentPath = path.join(componentsDir, `${componentName}.html`);

    try {
      const componentContent = await fs.promises.readFile(componentPath, 'utf-8');
      fileContents = fileContents.replace(match[0], componentContent);
    } catch (error) {
      console.error(`Could not replace ${match[0]} with content of ${componentPath}: ${error}`);
    }
  }

  return fileContents;
}

async function bundleCss(src, dest) {
  const bundlePath = path.join(dest, 'style.css');
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
      console.log('Style has been appended to the file style.css');
    } catch (error) {
      console.error('Error writing to file:', error);
    }
  });
}

async function copyDir(src, dest) {
  // Create target directory if it doesn't exist
  await fs.promises.mkdir(dest, { recursive: true });

  // Read contents of source directory
  const files = await fs.promises.readdir(src);

  // Loop through files
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    try {
      const srcStat = await fs.promises.stat(srcPath);

      if (srcStat.isDirectory()) {
        // Recursively copy subdirectories
        await copyDir(srcPath, destPath);
      } else {
        // Copy file
        await fs.promises.copyFile(srcPath, destPath);
        console.log(`Copied ${srcPath} to ${destPath}`);
      }
    } catch (error) {
      console.error(`Error copying ${srcPath} to ${destPath}:`, error);
    }
  }

  // Remove any files in target that don't exist in source
  const targetFiles = await fs.promises.readdir(dest);
  for (const targetFile of targetFiles) {
    const targetPath = path.join(dest, targetFile);
    if (!files.includes(targetFile)) {
      await fs.promises.unlink(targetPath);
      console.log(`Removed ${targetPath}`);
    }
  }
}
