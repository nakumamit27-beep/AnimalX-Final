const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("⏳ Replit Object Storage se images process ho rahi hain...");

const outDir = '/home/runner/workspace/all_gallery_photos';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Screenshot ke exact bucket aur sub-folder paths
const baseBucket = '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf';
const searchPaths = [
  path.join(baseBucket, 'uploads'),
  path.join(baseBucket, '.private'),
  path.join(baseBucket, 'public'),
  baseBucket,
  '/tmp/uploads'
];

let copyCount = 0;

searchPaths.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const destFile = path.join(outDir, `${file.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`);
          fs.copyFileSync(fullPath, destFile);
          copyCount++;
        }
      });
    } catch (e) {
      // ignore unreadable dirs
    }
  }
});

console.log(`📦 Found & Copied: ${copyCount} photos into 'all_gallery_photos' folder!`);

// Zip or Tar packing
try {
  execSync(`tar -czf "/home/runner/workspace/gallery_photos.tar.gz" -C "${outDir}" .`);
  console.log("✅ 'gallery_photos.tar.gz' Replit Files me ready ho gayi hai!");
} catch (err) {
  console.error("Packing error:", err);
}

