const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("⏳ Replit Object Storage se images process ho rahi hain...");

// Create gallery folder directly in workspace
const outDir = '/home/runner/workspace/all_gallery_photos';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Find object store directories
const possiblePaths = [
  '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf/uploads',
  '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf/public',
  process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || ''
];

let copyCount = 0;

possiblePaths.forEach(p => {
  if (p && fs.existsSync(p)) {
    const files = fs.readdirSync(p);
    files.forEach(file => {
      const src = path.join(p, file);
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, path.join(outDir, `${file}.jpg`));
        copyCount++;
      }
    });
  }
});

console.log(`📦 ${copyCount} images copied into 'all_gallery_photos' folder!`);

// Create compressed archive using tar
try {
  execSync(`tar -czf "/home/runner/workspace/gallery_photos.tar.gz" -C "${outDir}" .`);
  console.log("✅ Compressed file 'gallery_photos.tar.gz' successfully created in Replit workspace!");
} catch (err) {
  console.error("Tar error:", err);
}

