const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("⏳ Replit Object Storage se 1,679 images pack ho rahi hain...");

const outDir = '/home/runner/workspace/all_gallery_photos';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Exact Replit Object Store Path from your settings
const sourceDir = '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf';

let copyCount = 0;

function scanAndCopy(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanAndCopy(fullPath);
    } else if (stat.isFile()) {
      const destName = `${item.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;
      fs.copyFileSync(fullPath, path.join(outDir, destName));
      copyCount++;
    }
  });
}

scanAndCopy(sourceDir);

console.log(`📦 Success! ${copyCount} images copied into 'all_gallery_photos'!`);

// Compress into ZIP archive
try {
  execSync(`tar -czf "/home/runner/workspace/gallery_photos.tar.gz" -C "${outDir}" .`);
  console.log("✅ 'gallery_photos.tar.gz' Replit workspace me ready hai!");
} catch (e) {
  console.error("Compression error:", e);
}
