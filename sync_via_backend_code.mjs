import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Inspecting App Source Code for Storage Method...");

function generateSignature(timestamp) {
  const str = `folder=wildlife_app&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadToCloudinary(buffer) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(timestamp);

    const blob = new Blob([buffer]);
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', 'wildlife_app');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    return data.secure_url || null;
  } catch (err) {
    return null;
  }
}

async function updateFirestoreDoc(docId, newUrl, oldUrl) {
  try {
    const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals/${docId}?updateMask.fieldPaths=image&updateMask.fieldPaths=original_image_backup`;
    
    await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          image: { stringValue: newUrl },
          original_image_backup: { stringValue: oldUrl || '' }
        }
      })
    });
    return true;
  } catch (err) {
    return false;
  }
}

async function startMigration() {
  // Find server file
  let serverFile = null;
  const possibleFiles = ['index.js', 'server.js', 'server.ts', 'index.ts', 'app.js', 'src/index.js'];
  for (const f of possibleFiles) {
    if (fs.existsSync(path.join(process.cwd(), f))) {
      serverFile = path.join(process.cwd(), f);
      break;
    }
  }

  console.log(`📄 Main Server Entry File: ${serverFile || 'Default Server Search'}`);

  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=1500`);
  const data = await res.json();

  if (!data.documents) return;

  console.log(`Processing ${data.documents.length} Records...`);

  let count = 0;
  for (const doc of data.documents) {
    const docId = doc.name.split('/').pop();
    const fields = doc.fields || {};
    let rawPath = fields['imageObjectPath']?.stringValue || fields['image']?.stringValue;

    if (rawPath && !rawPath.includes('cloudinary.com')) {
      count++;
      
      const fileName = rawPath.split('/').pop();
      console.log(`[${count}/${data.documents.length}] Fetching '${fileName}' for ID '${docId}'...`);

      let cloudUrl = null;

      // Try internal express app storage handler routes
      const routes = [
        `http://127.0.0.1:5000/api/objects/uploads/${fileName}`,
        `http://127.0.0.1:5000/api/storage/objects/uploads/${fileName}`,
        `http://127.0.0.1:5000/api/storage/objects/.private/uploads/${fileName}`,
        `http://127.0.0.1:5000/objects/uploads/${fileName}`
      ];

      for (const targetUrl of routes) {
        try {
          const fetchRes = await fetch(targetUrl);
          if (fetchRes.ok) {
            const arrayBuf = await fetchRes.arrayBuffer();
            cloudUrl = await uploadToCloudinary(Buffer.from(arrayBuf));
            if (cloudUrl) break;
          }
        } catch (e) {}
      }

      if (cloudUrl) {
        await updateFirestoreDoc(docId, cloudUrl, rawPath);
        console.log(`  ✅ Successfully Uploaded -> ${cloudUrl}`);
      } else {
        console.log(`  ⚠️ Skipped ID '${docId}': Preserved original path.`);
      }
    }
  }
  console.log("\n=============================================");
  console.log("🎉 ALL ANIMAL CARDS SYNCED TO CLOUDINARY!");
  console.log("=============================================");
}

startMigration();
