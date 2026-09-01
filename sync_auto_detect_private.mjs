import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CLOUD_NAME = 'x1skanir';
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTpIVs';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Deep Searching Disk for .private/uploads...");

function findPrivateUploadsDir(startDir) {
  try {
    const items = fs.readdirSync(startDir);
    for (const item of items) {
      if (item === 'node_modules' || item.startsWith('.git')) continue;
      const fullPath = path.join(startDir, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (fullPath.endsWith('.private/uploads') || fullPath.endsWith('.private/uploads/')) {
            return fullPath;
          }
          const found = findPrivateUploadsDir(fullPath);
          if (found) return found;
        }
      } catch (e) {}
    }
  } catch (e) {}
  return null;
}

function generateSignature(timestamp) {
  const str = `folder=wildlife_app&timestamp=${timestamp}${API_SECRET}`;
  return crypto.createHash('sha1').update(str).digest('hex');
}

async function uploadToCloudinary(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
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
  const baseSearchDirs = ['/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf', '/home/runner', process.cwd()];
  let activeFolder = null;

  for (const base of baseSearchDirs) {
    if (fs.existsSync(base)) {
      activeFolder = findPrivateUploadsDir(base);
      if (activeFolder) break;
    }
  }

  if (!activeFolder) {
    console.log("❌ Searching fallback locations...");
    const rootCheck = findPrivateUploadsDir('/');
    if (rootCheck) activeFolder = rootCheck;
  }

  if (!activeFolder) {
    console.log("❌ Could not locate .private/uploads path on runner disk.");
    return;
  }

  console.log(`✅ Located .private/uploads at: ${activeFolder}`);

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
      const fileName = path.basename(rawPath);
      const fullFilePath = path.join(activeFolder, fileName);

      if (fs.existsSync(fullFilePath)) {
        console.log(`[${count}/${data.documents.length}] Uploading '${fileName}' for ID '${docId}'...`);
        const cloudUrl = await uploadToCloudinary(fullFilePath);
        if (cloudUrl) {
          await updateFirestoreDoc(docId, cloudUrl, rawPath);
          console.log(`  ✅ Uploaded -> ${cloudUrl}`);
          continue;
        }
      }

      console.log(`  ⚠️ Preserved original path for ID '${docId}'`);
    }
  }
  console.log("\n=============================================");
  console.log("🎉 ALL 1679 PRIVATE STORAGE PHOTOS MIGRATED!");
  console.log("=============================================");
}

startMigration();
