import crypto from 'crypto';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Initializing Replit Signed Download Fetcher...");

function generateSignature(timestamp) {
  const str = `folder=wildlife_app&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadToCloudinary(remoteUrl) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(timestamp);

    const formData = new FormData();
    formData.append('file', remoteUrl);
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

  console.log(`Processing ${data.documents.length} Animal Records...`);

  let count = 0;
  for (const doc of data.documents) {
    const docId = doc.name.split('/').pop();
    const fields = doc.fields || {};
    let rawPath = fields['imageObjectPath']?.stringValue || fields['image']?.stringValue;

    if (rawPath && !rawPath.includes('cloudinary.com')) {
      count++;
      
      const objectKey = rawPath.replace(/^\/(api\/storage\/)?objects\//, '').replace(/^\//, '');
      console.log(`[${count}/${data.documents.length}] Requesting signed URL for ID '${docId}'...`);

      let cloudUrl = null;

      // Request Object Storage signed/public download URL via app API
      try {
        const signRes = await fetch(`http://127.0.0.1:5000/api/storage/download-url?key=${encodeURIComponent(objectKey)}`);
        if (signRes.ok) {
          const signData = await signRes.json();
          if (signData.url) {
            cloudUrl = await uploadToCloudinary(signData.url);
          }
        }
      } catch (e) {}

      // Fallback: Direct public path download
      if (!cloudUrl) {
        try {
          const directUrl = `https://animal-x--Aniaml.replit.app/api/storage/objects/${objectKey}`;
          cloudUrl = await uploadToCloudinary(directUrl);
        } catch (e) {}
      }

      if (cloudUrl) {
        await updateFirestoreDoc(docId, cloudUrl, rawPath);
        console.log(`  ✅ Successfully Uploaded -> ${cloudUrl}`);
      } else {
        console.log(`  ⚠️ Preserved original image link for ID '${docId}'`);
      }
    }
  }
  console.log("\n=============================================");
  console.log("🎉 CLOUDINARY MIGRATION COMPLETED!");
  console.log("=============================================");
}

startMigration();
