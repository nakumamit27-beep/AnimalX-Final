import fs from 'fs';
import path from 'path';

const CLOUD_NAME = 'x1skanir';
const UPLOAD_PRESET = 'ml_default';
const PROJECT_ID = 'happy-fd1bc';

console.log("🔍 Scanning disk for uploads directory...");

function findUploadsDir(startDir) {
  try {
    const items = fs.readdirSync(startDir);
    for (const item of items) {
      if (item === 'node_modules' || item.startsWith('.')) continue;
      const fullPath = path.join(startDir, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (item === 'uploads') return fullPath;
          const found = findUploadsDir(fullPath);
          if (found) return found;
        }
      } catch (e) {}
    }
  } catch (e) {}
  return null;
}

async function uploadFileBuffer(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const blob = new Blob([buffer]);
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

async function start() {
  const uploadsFolder = findUploadsDir(process.cwd()) || findUploadsDir('/home/runner');
  
  if (!uploadsFolder) {
    console.log("❌ Could not locate 'uploads' folder on disk.");
    return;
  }

  console.log(`✅ Uploads folder located at: ${uploadsFolder}`);

  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=1500`);
  const data = await res.json();

  if (!data.documents) return;

  let count = 0;
  for (const doc of data.documents) {
    const docId = doc.name.split('/').pop();
    const fields = doc.fields || {};
    let rawPath = fields['imageObjectPath']?.stringValue || fields['image']?.stringValue;

    if (rawPath && !rawPath.includes('cloudinary.com')) {
      count++;
      const fileName = path.basename(rawPath);
      const filePath = path.join(uploadsFolder, fileName);

      if (fs.existsSync(filePath)) {
        console.log(`[${count}/${data.documents.length}] Uploading ID '${docId}'...`);
        const cloudUrl = await uploadFileBuffer(filePath);
        if (cloudUrl) {
          await updateFirestoreDoc(docId, cloudUrl, rawPath);
          console.log(`  ✅ Successfully Uploaded -> ${cloudUrl}`);
        }
      } else {
        console.log(`  ⚠️ File '${fileName}' missing in uploads folder.`);
      }
    }
  }
}

start();
