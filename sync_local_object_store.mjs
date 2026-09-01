import fs from 'fs';
import path from 'path';

const CLOUD_NAME = 'x1skanir';
const UPLOAD_PRESET = 'ml_default';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Scanning Replit Disk Storage for Animals...");

async function uploadBufferToCloudinary(fileBuffer) {
  try {
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

  console.log(`Processing ${data.documents.length} records...`);

  // Locate replit object store dir dynamically
  let storageBaseDir = '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf';

  let count = 0;
  for (const doc of data.documents) {
    const docId = doc.name.split('/').pop();
    const fields = doc.fields || {};
    let relativePath = fields['image']?.stringValue || fields['imageObjectPath']?.stringValue;

    if (relativePath && !relativePath.includes('cloudinary.com')) {
      count++;
      
      // Extract file UUID/Name from path
      const fileName = path.basename(relativePath);
      
      // Check multiple local possible paths
      const possibleFilePaths = [
        path.join(storageBaseDir, 'public', 'uploads', fileName),
        path.join(storageBaseDir, 'uploads', fileName),
        path.join(process.cwd(), 'uploads', fileName),
        path.join(process.cwd(), 'public', 'uploads', fileName)
      ];

      let fileBuffer = null;
      for (const p of possibleFilePaths) {
        if (fs.existsSync(p)) {
          fileBuffer = fs.readFileSync(p);
          break;
        }
      }

      if (fileBuffer) {
        console.log(`[${count}/${data.documents.length}] Uploading ID '${docId}' from local disk...`);
        const cloudUrl = await uploadBufferToCloudinary(fileBuffer);
        if (cloudUrl) {
          await updateFirestoreDoc(docId, cloudUrl, relativePath);
          console.log(`  ✅ Successfully Uploaded -> ${cloudUrl}`);
        }
      } else {
        console.log(`  ⚠️ Skipped ID '${docId}': File not present on current runner disk.`);
      }
    }
  }
}

startMigration();
