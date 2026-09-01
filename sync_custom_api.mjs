import crypto from 'crypto';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';
const BUCKET_ID = 'repl-objstore-041a9cdd-60c9-43cs-8e4b-612773cc8b83';

console.log("🚀 Starting Custom API Upload Engine...");

function generateSignature(timestamp) {
  const str = `folder=wildlife_app&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadToCloudinary(blob) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(timestamp);

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

  console.log(`Processing ${data.documents.length} Animal Cards...`);

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

      // Direct REST API endpoints provided by Replit backend
      const apiUrls = [
        `http://127.0.0.1:1106/objects/.private/uploads/${fileName}`,
        `http://127.0.0.1:1106/${BUCKET_ID}/.private/uploads/${fileName}`,
        `http://127.0.0.1:1106/objects/uploads/${fileName}`
      ];

      for (const url of apiUrls) {
        try {
          const fileRes = await fetch(url);
          if (fileRes.ok) {
            const blob = await fileRes.blob();
            cloudUrl = await uploadToCloudinary(blob);
            if (cloudUrl) break;
          }
        } catch (e) {}
      }

      if (cloudUrl) {
        await updateFirestoreDoc(docId, cloudUrl, rawPath);
        console.log(`  ✅ Successfully Uploaded -> ${cloudUrl}`);
      } else {
        console.log(`  ⚠️ Skipped ID '${docId}': Kept original path safe.`);
      }
    }
  }
  console.log("\n=============================================");
  console.log("🎉 CLOUDINARY MIGRATION COMPLETED!");
  console.log("=============================================");
}

startMigration();
