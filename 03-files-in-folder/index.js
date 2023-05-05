const path = require('path');
const fs = require('node:fs/promises');

const dirname = path.resolve(__dirname, './secret-folder');
const dirInfo = fs.readdir(dirname, {withFileTypes: true});

dirInfo
  .then(data => {
    data.forEach(async (dirent) => {
      if (dirent.isFile()) {
        const filePath = path.join(dirname, dirent.name);
        const fileInfo = await getFileInfo(filePath);
        console.log(fileInfo);
      }
    });
  });

async function getFileInfo(filePath) {
  let { name, ext } = path.parse(filePath);
  let { size } = await fs.stat(filePath);

  ext = ext.slice(1);
  size = (size / 1024).toFixed(3);

  return `${name} - ${ext} - ${size}kb`;
}
