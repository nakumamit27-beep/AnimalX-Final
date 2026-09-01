const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("⏳ App Storage (Objects/.private/uploads) ki exact 1,679 files search ho rahi hain...");

const outDir = '/home/runner/workspace/exact_app_storage_photos';
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// Read exact system path matching App Storage UI
const possibleUploadPaths = [
  '/replit-objstore-63328590-7f8f-49cc-8901-5f5ee2f4f50a/uploads',
  '/replit-objstore-63328590-7f8f-49cc-8901-5f5ee2f4f50a/.private/uploads',
  '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf/uploads',
  process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID ? path.join(process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID, 'uploads') : '',
  process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID ? path.join(process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID, '.private/uploads') : ''
];

let copyCount = 0;

for (const dirPath of possibleUploadPaths) {
  if (dirPath && fs.existsSync(dirPath)) {
    try {
      const files = fs.readdirSync(dirPath);
      if (files.length > 0) {
        files.forEach(file => {
          const src = path.join(dirPath, file);
          if (fs.existsSync(src) && fs.statSync(src).isFile()) {
            fs.copyFileSync(src, path.join(outDir, `${file}.jpg`));
            copyCount++;
          }
        });
        console.log(`📍 Found exact storage path: ${dirPath}`);
        break; // Stop when exact 1600+ upload files are found
      }
    } catch (e) {}
  }
}

console.log(`🎯 TOTAL FILES COPIED: ${copyCount} photos!`);

if (copyCount > 0) {
  const archivePath = '/home/runner/workspace/app_storage_1679_photos.tar.gz';
  if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);
  execSync(`tar -czf "${archivePath}" -C "${outDir}" .`);
  console.log("✅ Ready! 'app_storage_1679_photos.tar.gz' file Replit me ban gayi hai.");
} else {
  console.log("❌ Target path error.");
}

