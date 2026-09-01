const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("⏳ Replit Object Storage se images ZIP me pack ho rahi hain...");

const outDir = '/tmp/gallery_photos';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const objDir = '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf/uploads';

if (fs.existsSync(objDir)) {
  const files = fs.readdirSync(objDir);
  files.forEach((file) => {
    const src = path.join(objDir, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(outDir, `${file}.jpg`));
    }
  });
}

// Save ZIP directly in main Replit workspace root
execSync(`zip -j "/home/runner/workspace/gallery_photos.zip" ${outDir}/*.jpg`);
console.log("✅ Replit me 'gallery_photos.zip' file ban gayi hai!");
