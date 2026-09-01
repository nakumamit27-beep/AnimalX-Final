const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Client } = require('@replit/object-storage');

const client = new Client();

async function run() {
  console.log("⏳ Replit App Storage Bucket scan ho raha hai...");

  const outDir = '/home/runner/workspace/app_storage_1679_photos';
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  let count = 0;
  
  try {
    // Official SDK List Method
    const { ok, value: objects, error } = await client.list();
    
    if (!ok) {
      console.error("SDK List Error:", error);
      return;
    }

    console.log(`📍 Found ${objects.length} total objects in bucket!`);

    for (const obj of objects) {
      const cleanName = path.basename(obj.name || obj).replace(/[^a-zA-Z0-9_-]/g, '_') + '.jpg';
      const destPath = path.join(outDir, cleanName);

      // Official SDK Download Method
      const res = await client.downloadToFilename(obj.name || obj, destPath);
      if (res.ok) {
        count++;
      }
    }
  } catch (err) {
    console.error("Execution Error:", err);
  }

  console.log(`🎯 TOTAL DOWNLOADED: ${count} photos!`);

  if (count > 0) {
    const tarPath = '/home/runner/workspace/1679_photos.tar.gz';
    if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
    execSync(`tar -czf "${tarPath}" -C "${outDir}" .`);
    console.log("✅ SUCCESS! '1679_photos.tar.gz' file Replit Files panel mein ban gayi hai!");
  }
}

run();
