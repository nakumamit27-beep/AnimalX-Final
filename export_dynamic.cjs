const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("⏳ Replit Environment se bucket scan ho raha hai...");

const outDir = '/home/runner/workspace/all_gallery_photos';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let copyCount = 0;

// Function to recursively scan any folder and find images
function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  try {
    const items = fs.readdirSync(dirPath);
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && stat.size > 1000) {
          const destFile = path.join(outDir, `photo_${copyCount + 1}_${item.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`);
          fs.copyFileSync(fullPath, destFile);
          copyCount++;
        }
      } catch (e) {}
    });
  } catch (e) {}
}

// 1. Scan default environment bucket path
const envBucket = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || '';
if (envBucket) scanDirectory(envBucket);

// 2. Scan root replit-objstore
scanDirectory('/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf');

// 3. Scan workspace artifacts & uploads
scanDirectory('/home/runner/workspace/artifacts');
scanDirectory('/tmp');

console.log(`📦 Final Count: ${copyCount} photos copied into 'all_gallery_photos'!`);

// Create Archive
if (copyCount > 0) {
  try {
    execSync(`tar -czf "/home/runner/workspace/gallery_photos.tar.gz" -C "${outDir}" .`);
    console.log("✅ SUCCESS! 'gallery_photos.tar.gz' Replit Files panel me ready hai!");
  } catch (err) {
    console.error("Tar error:", err);
  }
} else {
  console.log("❌ Files scan path error.");
}

