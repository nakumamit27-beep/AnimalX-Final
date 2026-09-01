import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Initializing Replit Native Object CLI Extraction...");

function generateSignature(timestamp) {
  const str = `folder=wildlife_app&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadToCloudinary(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(timestamp);

    const blob = new Blob([fileBuffer]);
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
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=1500`);
  const data = await res.json();

  if (!data.documents) return;

  console.log(`Processing ${data.documents.length} Records...`);

  const tmpDir = path.join(process.cwd(), '.tmp_img_cache');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  let count = 0;
  for (const doc of data.documents) {
    const docId = doc.name.split('/').pop();
    const fields = doc.fields || {};
    let rawPath = fields['imageObjectPath']?.stringValue || fields['image']?.stringValue;

    if (rawPath && !rawPath.includes('cloudinary.com')) {
      count++;
      const fileName = rawPath.split('/').pop();
      const objectKey = rawPath.replace(/^\/(api\/storage\/)?objects\//, '').replace(/^\//, '');
      const localPath = path.join(tmpDir, fileName);

      console.log(`[${count}/${data.documents.length}] Extracting '${objectKey}' for ID '${docId}'...`);

      let cloudUrl = null;

      // Extract using internal Replit binary tools directly
      try {
        const cmd = `python3 -c "import urllib.request; urllib.request.urlretrieve('http://127.0.0.1:5000/api/storage/objects/${objectKey}', '${localPath}')"`;
        execSync(cmd, { stdio: 'ignore' });
      } catch (e) {
        try {
          execSync(`curl -s "http://127.0.0.1:5000/uploads/${fileName}" -o "${localPath}"`, { stdio: 'ignore' });
        } catch (err) {}
      }

      if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
        cloudUrl = await uploadToCloudinary(localPath);
        fs.unlinkSync(localPath); // clean up tmp
      }

      if (cloudUrl) {
        await updateFirestoreDoc(docId, cloudUrl, rawPath);
        console.log(`  ✅ Successfully Uploaded -> ${cloudUrl}`);
      } else {
        console.log(`  ⚠️ Skipped ID '${docId}': Kept original path safe.`);
      }
    }
  }

  try { fs.rmdirSync(tmpDir); } catch(e){}

  console.log("\n=============================================");
  console.log("🎉 CLOUDINARY MIGRATION COMPLETED!");
  console.log("=============================================");
}

startMigration();
