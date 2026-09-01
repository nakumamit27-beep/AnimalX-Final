import crypto from 'crypto';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Remote URL Direct Fetch Engine Started...");

function generateSignature(timestamp) {
  const str = `folder=wildlife_app&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadRemoteUrlToCloudinary(remoteUrl) {
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

  console.log(`Scanning ${data.documents.length} Animal Cards for Remote Transfer...`);

  let count = 0;
  for (const doc of data.documents) {
    const docId = doc.name.split('/').pop();
    const fields = doc.fields || {};
    const imageUrl = fields['image']?.stringValue || fields['imageObjectPath']?.stringValue;

    if (imageUrl && !imageUrl.includes('cloudinary.com')) {
      count++;
      console.log(`[${count}/${data.documents.length}] Fetching & Uploading ID '${docId}'...`);
      
      const cloudUrl = await uploadRemoteUrlToCloudinary(imageUrl);

      if (cloudUrl) {
        await updateFirestoreDoc(docId, cloudUrl, imageUrl);
        console.log(`  ✅ Successfully Uploaded -> ${cloudUrl}`);
      } else {
        console.log(`  ⚠️ Skipped ID '${docId}': Preserved original image safe!`);
      }
    }
  }
  console.log("\n=============================================");
  console.log("🎉 ALL ANIMAL CARDS TRANSFER COMPLETED TO CLOUDINARY!");
  console.log("=============================================");
}

startMigration();
