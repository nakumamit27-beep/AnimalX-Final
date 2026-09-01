const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("⏳ Replit Object Storage SDK se 1,679 photos download ho rahi hain...");

const outDir = '/home/runner/workspace/app_storage_photos';
if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

async function downloadDirect() {
  let count = 0;
  try {
    const { Client } = require('@replit/object-storage');
    const client = new Client();
    
    // List all objects in uploads/
    const { objects } = await client.list({ prefix: 'uploads/' });
    console.log(`📦 Found ${objects.length} objects in uploads folder.`);

    for (const obj of objects) {
      const { ok, value } = await client.downloadAsBytes(obj.name);
      if (ok) {
        const fileName = path.basename(obj.name) + '.jpg';
        fs.writeFileSync(path.join(outDir, fileName), Buffer.from(value));
        count++;
      }
    }
  } catch (e) {
    console.log("SDK Error, using Object Storage sidecar endpoint...");
    try {
      const listRes = await fetch('http://127.0.0.1:1106/list?prefix=uploads/');
      if (listRes.ok) {
        const data = await listRes.json();
        for (const obj of (data.objects || [])) {
          const fileRes = await fetch(`http://127.0.0.1:1106/get?key=${encodeURIComponent(obj.name)}`);
          if (fileRes.ok) {
            const buffer = Buffer.from(await fileRes.arrayBuffer());
            const fileName = path.basename(obj.name) + '.jpg';
            fs.writeFileSync(path.join(outDir, fileName), buffer);
            count++;
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  console.log(`🎯 TOTAL DOWNLOADED: ${count} photos!`);

  if (count > 0) {
    const tarPath = '/home/runner/workspace/1679_animal_photos.tar.gz';
    if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
    execSync(`tar -czf "${tarPath}" -C "${outDir}" .`);
    console.log("✅ Ready! '1679_animal_photos.tar.gz' Replit Files panel mein ready ho gayi hai.");
  }
}

downloadDirect();
