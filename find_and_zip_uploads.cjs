const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("⏳ Replit system storage scan ho raha hai...");

const outDir = '/home/runner/workspace/exact_app_storage_photos';
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

let targetUploadDir = '';

// Find active mounted replit object storage directories
function findUploadsFolder(baseDir) {
  if (!fs.existsSync(baseDir)) return;
  try {
    const items = fs.readdirSync(baseDir);
    for (const item of items) {
      const fullPath = path.join(baseDir, item);
      if (item === 'uploads' && fs.statSync(fullPath).isDirectory()) {
        const files = fs.readdirSync(fullPath);
        if (files.length > 500) { // Matching our 1,600+ uploads folder
          targetUploadDir = fullPath;
          return;
        }
      }
      if (fs.statSync(fullPath).isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        findUploadsFolder(fullPath);
        if (targetUploadDir) return;
      }
    }
  } catch (e) {}
}

// Search root locations
['/replit-objstore-', '/tmp', process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || ''].forEach(p => {
  if (p && !targetUploadDir) {
    if (p.startsWith('/replit-objstore-')) {
      const parent = path.dirname(p);
      if (fs.existsSync(parent)) {
        fs.readdirSync(parent).filter(f => f.startsWith('replit-objstore')).forEach(dir => {
          findUploadsFolder(path.join(parent, dir));
        });
      }
    } else {
      findUploadsFolder(p);
    }
  }
});

let count = 0;
if (targetUploadDir && fs.existsSync(targetUploadDir)) {
  console.log(`📍 Found exact folder: ${targetUploadDir}`);
  const files = fs.readdirSync(targetUploadDir);
  files.forEach(file => {
    const src = path.join(targetUploadDir, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(outDir, `${file}.jpg`));
      count++;
    }
  });
}

console.log(`🎯 TOTAL COPIED: ${count} photos!`);

if (count > 0) {
  const archivePath = '/home/runner/workspace/app_storage_1679_photos.tar.gz';
  if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);
  execSync(`tar -czf "${archivePath}" -C "${outDir}" .`);
  console.log("✅ Ready! 'app_storage_1679_photos.tar.gz' file Replit Files panel me ban gayi hai.");
} else {
  console.log("❌ Uploads folder path match nahi ho paya.");
}

