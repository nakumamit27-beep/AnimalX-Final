import fs from 'fs';
import path from 'path';

const CLOUD_NAME = 'x1skanir';
const UPLOAD_PRESET = 'ml_default';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Buffer Upload Engine Active...");

async function uploadFileBuffer(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', UPLOAD_PRESET);
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

async function updateFirestoreAnimalDoc(docId, newUrl, oldUrl) {
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
    const imagePath = fields['imageObjectPath']?.stringValue || fields['image']?.stringValue;

    if (imagePath && !imagePath.includes('cloudinary.com')) {
      count++;
      
      // Resolve path
      let fullLocalPath = imagePath;
      if (!fs.existsSync(fullLocalPath)) {
        fullLocalPath = path.join(process.cwd(), 'public', imagePath);
      }

      console.log(`[${count}/${data.documents.length}] Uploading ID '${docId}'...`);
      const cloudUrl = await uploadFileBuffer(fullLocalPath);

      if (cloudUrl) {
        await updateFirestoreAnimalDoc(docId, cloudUrl, imagePath);
        console.log(`  ✅ Uploaded & Updated -> ${cloudUrl}`);
      } else {
        console.log(`  ⚠️ Path non-readable: Preserved original link for ID ${docId}`);
      }
    }
  }
}

startMigration();
