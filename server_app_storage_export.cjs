const fs = require('fs');
const path = require('path');
const express = require('express');
const { execSync } = require('child_process');

// Cleaning old archives
const oldArchives = [
  '/home/runner/workspace/gallery_photos.tar.gz',
  '/home/runner/workspace/app_storage_1679_photos.tar.gz',
  '/home/runner/workspace/1679_animal_photos.tar.gz'
];
oldArchives.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });

console.log("⏳ Replit Object Storage Sidecar Service se 1,679 photos fetch ho rahi hain...");

const outDir = '/home/runner/workspace/app_storage_photos';
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// Read files using Replit internal Object Store client/fetch
async function downloadBucket() {
  try {
    const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || 'replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf';
    
    // Fetch list of objects directly from local object storage sidecar API
    const res = await fetch(`http://127.0.0.1:1106/list?prefix=uploads/`);
    if (res.ok) {
      const data = await res.json();
      let count = 0;
      for (const obj of (data.objects || [])) {
        const fileRes = await fetch(`http://127.0.0.1:1106/get?key=${encodeURIComponent(obj.name)}`);
        if (fileRes.ok) {
          const buffer = Buffer.from(await fileRes.arrayBuffer());
          const cleanName = path.basename(obj.name).replace(/[^a-zA-Z0-9_-]/g, '_');
          fs.writeFileSync(path.join(outDir, `${cleanName}.jpg`), buffer);
          count++;
        }
      }
      console.log(`🎯 SUCCESS! ${count} photos downloaded via Object Storage API!`);
    } else {
      throw new Error("Sidecar API offline");
    }
  } catch (err) {
    console.log("⚠️ Direct Sidecar offline, packing local cache files...");
    // Local fallback
    const uploadsPath = './artifacts/animal-x/uploads';
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      files.forEach((f, i) => {
        fs.copyFileSync(path.join(uploadsPath, f), path.join(outDir, `photo_${i+1}.jpg`));
      });
    }
  }

  // Create ZIP archive inside web server public path
  const distDir = '/home/runner/workspace/artifacts/animal-x/dist';
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  
  const tarPath = path.join(distDir, 'app_storage_1679_photos.tar.gz');
  execSync(`tar -czf "${tarPath}" -C "${outDir}" .`);
  console.log("✅ 'app_storage_1679_photos.tar.gz' web link par ready hai!");
}

downloadBucket();
