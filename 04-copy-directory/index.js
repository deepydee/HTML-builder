const fs = require('fs').promises;
const path = require('path');

const srcDir = path.join(__dirname, 'files');
const destDir = path.join(__dirname, 'files-copy');

copyDir(srcDir, destDir)
  .catch(error => console.error(error));

async function copyDir(src, dest) {
  // Create target directory if it doesn't exist
  await fs.mkdir(dest, { recursive: true });

  // Read contents of source directory
  const files = await fs.readdir(src);

  // Loop through files
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    try {
      const srcStat = await fs.stat(srcPath);

      if (srcStat.isDirectory()) {
        // Recursively copy subdirectories
        await copyDir(srcPath, destPath);
      } else {
        // Copy file
        await fs.copyFile(srcPath, destPath);
        console.log(`Copied ${srcPath} to ${destPath}`);
      }
    } catch (error) {
      console.error(`Error copying ${srcPath} to ${destPath}:`, error);
    }
  }

  // Remove any files in target that don't exist in source
  const targetFiles = await fs.readdir(dest);
  for (const targetFile of targetFiles) {
    const targetPath = path.join(dest, targetFile);
    if (!files.includes(targetFile)) {
      await fs.unlink(targetPath);
      console.log(`Removed ${targetPath}`);
    }
  }
}
