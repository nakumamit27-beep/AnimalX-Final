import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Starting Animals Collection Direct Migration...");

function generateSignature(timestamp) {
  const str = `folder=wildlife_app&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadToCloudinary(filePathOrUrl) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(timestamp);
    const formData = new FormData();

    // If local file path exists, send as file blob, else send direct URL string
    if (fs.existsSync(filePathOrUrl)) {
      const fileBuffer = fs.readFileSync(filePathOrUrl);
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob);
    } else {
      formData.append('file', filePathOrUrl);
    }

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
  try {
    // Fetch up to 1500 documents from animals collection
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=1500`);
    const data = await res.json();

    if (!data.documents) {
      console.log("❌ No documents found in 'animals' collection.");
      return;
    }

    console.log(`✅ Found ${data.documents.length} Animal Cards in Firestore!`);

    let count = 0;
    for (const doc of data.documents) {
      const docId = doc.name.split('/').pop();
      const fields = doc.fields || {};
      
      const imagePath = fields['imageObjectPath']?.stringValue || fields['image']?.stringValue;

      if (imagePath && !imagePath.includes('cloudinary.com')) {
        count++;
        console.log(`[${count}/${data.documents.length}] Migrating Animal ID '${docId}'...`);
        
        // Target path inside Replit Object Storage
        let sourceToUpload = imagePath;
        if (imagePath.startsWith('/replit-objstore-') || imagePath.startsWith('/')) {
          if (fs.existsSync(imagePath)) {
            sourceToUpload = imagePath;
          }
        }

        const newCloudUrl = await uploadToCloudinary(sourceToUpload);

        if (newCloudUrl) {
          await updateFirestoreAnimalDoc(docId, newCloudUrl, imagePath);
          console.log(`  ✅ Successfully Uploaded -> ${newCloudUrl}`);
        } else {
          console.log(`  ⚠️ Skipped ID '${docId}': Kept original image safe!`);
        }
      }
    }
    console.log("\n=============================================");
    console.log("🎉 ALL ANIMAL CARDS SUCCESSFULLY MIGRATED TO CLOUDINARY!");
    console.log("=============================================");
  } catch (err) {
    console.error("Migration Error:", err.message);
  }
}

startMigration();
