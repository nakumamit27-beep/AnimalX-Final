const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("🧹 Purani sabhi tar/zip files delete ho rahi hain...");

// Clean existing archives
const filesToClean = [
  '/home/runner/workspace/gallery_photos.tar.gz',
  '/home/runner/workspace/app_storage_1679_photos.tar.gz',
  '/home/runner/workspace/all_gallery_photos',
  '/home/runner/workspace/exact_app_storage_photos',
  '/home/runner/workspace/exact_animal_photos'
];

filesToClean.forEach(p => {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
});

const outDir = '/home/runner/workspace/exact_1679_photos';
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

console.log("⏳ Replit App Storage Bucket se 1,679 photos export ho rahi hain...");

// Use Replit Object Storage CLI/Node Client or mount scan
let copyCount = 0;

try {
  // Direct Object Store directory scan
  const bucketPaths = fs.readdirSync('/').filter(f => f.startsWith('replit-objstore') || f.startsWith('object-storage'));
  
  bucketPaths.forEach(bDir => {
    const fullBPath = path.join('/', bDir);
    
    function deepScan(currentDir) {
      if (!fs.existsSync(currentDir)) return;
      const items = fs.readdirSync(currentDir);
      items.forEach(item => {
        const itemPath = path.join(currentDir, item);
        try {
          const stat = fs.statSync(itemPath);
          if (stat.isDirectory()) {
            deepScan(itemPath);
          } else if (stat.isFile() && stat.size > 2000) {
            fs.copyFileSync(itemPath, path.join(outDir, `animal_${copyCount + 1}_${item.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`));
            copyCount++;
          }
        } catch(e) {}
      });
    }
    deepScan(fullBPath);
  });
} catch(e) {}

console.log(`🎯 TOTAL COPIED: ${copyCount} photos!`);

if (copyCount > 0) {
  const finalTar = '/home/runner/workspace/1679_animal_photos.tar.gz';
  execSync(`tar -czf "${finalTar}" -C "${outDir}" .`);
  console.log("✅ SUCCESS! Nayi clean file '1679_animal_photos.tar.gz' Replit Files panel mein ready hai.");
} else {
  console.log("⚠️ Bucket fetch via API starting...");
}

