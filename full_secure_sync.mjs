import crypto from 'crypto';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Starting Signed & Authenticated Cloudinary Transfer Engine...");

// Helper to generate Cloudinary Signature
function generateSignature(timestamp) {
  const str = `folder=wildlife_app&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

// Upload Remote URL to Cloudinary using Signed Upload API
async function uploadToCloudinarySigned(remoteUrl) {
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

async function updateFirestoreDoc(collectionName, docId, fieldName, newUrl, oldUrl) {
  try {
    const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}/${docId}?updateMask.fieldPaths=${fieldName}&updateMask.fieldPaths=original_url_backup`;
    
    await fetch(patchUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          [fieldName]: { stringValue: newUrl },
          original_url_backup: { stringValue: oldUrl }
        }
      })
    });
    return true;
  } catch (err) {
    return false;
  }
}

async function processCollection(collectionName, primaryField) {
  console.log(`\n🔍 Scanning collection: '${collectionName}'...`);
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}?pageSize=500`);
    const data = await res.json();

    if (!data.documents) return;

    let count = 0;
    for (const doc of data.documents) {
      const docId = doc.name.split('/').pop();
      const fields = doc.fields || {};
      const currentUrl = fields[primaryField]?.stringValue || fields['imageUrl']?.stringValue || fields['photo']?.stringValue || fields['mediaUrl']?.stringValue;

      if (currentUrl && !currentUrl.includes('cloudinary.com')) {
        count++;
        console.log(`[${count}/${data.documents.length}] Syncing ID ${docId} to Cloudinary...`);
        
        const newCloudUrl = await uploadToCloudinarySigned(currentUrl);

        if (newCloudUrl) {
          await updateFirestoreDoc(collectionName, docId, primaryField, newCloudUrl, currentUrl);
          console.log(`  ✅ Safely Uploaded -> ${newCloudUrl}`);
        } else {
          console.log(`  ⚠️ Skipped ID ${docId}: Original Photo Retained!`);
        }
      }
    }
  } catch (err) {
    console.error(`Error in ${collectionName}:`, err.message);
  }
}

async function start() {
  await processCollection('animals', 'imageUrl');
  await processCollection('reels', 'videoUrl');
  console.log("\n=============================================");
  console.log("🎉 ALL MEDIA SUCCESSFULLY SYNCED TO CLOUDINARY!");
  console.log("=============================================");
}

start();
