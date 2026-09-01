import crypto from 'crypto';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';
const BUCKET_ID = 'repl-objstore-041a9cdd-60c9-43ca-8e4b-612773cc8b83';

console.log("🚀 Initializing Bucket RPC Direct Reader...");

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

async function fetchFromBucket(objectKey) {
  const token = process.env.REPLIT_OBJECT_STORAGE_TOKEN || process.env.REPL_IDENTITY;
  
  // Direct Bucket Endpoints
  const endpoints = [
    `http://127.0.0.1:1106/v1/buckets/${BUCKET_ID}/objects/.private/uploads/${objectKey}`,
    `http://127.0.0.1:1106/v1/buckets/${BUCKET_ID}/objects/uploads/${objectKey}`,
    `http://127.0.0.1:1106/v1/buckets/${BUCKET_ID}/objects/${objectKey}`,
    `http://127.0.0.1:1106/object/${BUCKET_ID}/.private/uploads/${objectKey}`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        return await res.arrayBuffer();
      }
    } catch (e) {}
  }
  return null;
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
      console.log(`[${count}/${data.documents.length}] Pulling '${fileName}' for ID '${docId}'...`);

      let cloudUrl = null;
      const arrayBuf = await fetchFromBucket(fileName);

      if (arrayBuf) {
        cloudUrl = await uploadToCloudinary(Buffer.from(arrayBuf));
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
  console.log("🎉 ALL BUCKET IMAGES SYNCED TO CLOUDINARY!");
  console.log("=============================================");
}

startMigration();
