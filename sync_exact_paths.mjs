import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Starting Direct Path Matching Engine...");

function generateSignature(timestamp) {
  const str = `folder=wildlife_app&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadToCloudinary(fileBuffer) {
  try {
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

  // Define root scan locations
  const searchRoots = [
    '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf/public',
    '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf',
    process.cwd(),
    path.join(process.cwd(), 'public')
  ];

  let count = 0;
  for (const doc of data.documents) {
    const docId = doc.name.split('/').pop();
    const fields = doc.fields || {};
    let rawPath = fields['imageObjectPath']?.stringValue || fields['image']?.stringValue;

    if (rawPath && !rawPath.includes('cloudinary.com')) {
      count++;
      
      const cleanRelPath = rawPath.replace(/^\/(api\/storage\/)?objects\//, '').replace(/^\//, '');
      console.log(`[${count}/${data.documents.length}] Scanning for ID '${docId}' -> ${cleanRelPath}`);

      let foundBuffer = null;

      for (const root of searchRoots) {
        const fullCandidatePath = path.join(root, cleanRelPath);
        if (fs.existsSync(fullCandidatePath)) {
          foundBuffer = fs.readFileSync(fullCandidatePath);
          break;
        }
      }

      if (foundBuffer) {
        const cloudUrl = await uploadToCloudinary(foundBuffer);
        if (cloudUrl) {
          await updateFirestoreDoc(docId, cloudUrl, rawPath);
          console.log(`  ✅ Successfully Uploaded -> ${cloudUrl}`);
          continue;
        }
      }

      console.log(`  ⚠️ Preserved original image link for ID '${docId}'`);
    }
  }
  console.log("\n=============================================");
  console.log("🎉 MATCHING COMPLETED!");
  console.log("=============================================");
}

startMigration();
