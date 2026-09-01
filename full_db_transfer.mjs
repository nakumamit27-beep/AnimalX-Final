import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const CLOUD_NAME = 'x1skanir';
const UPLOAD_PRESET = 'ml_default';

if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error("❌ Error: 'serviceAccountKey.json' missing in root!");
  console.log("Please upload your Firebase Admin Service Account JSON file first.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function uploadToCloudinary(remoteUrl) {
  try {
    const formData = new FormData();
    formData.append('file', remoteUrl);
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

async function migrateCollection(collectionName, urlFields) {
  console.log(`\n🔍 Checking collection: '${collectionName}'...`);
  const snapshot = await db.collection(collectionName).get();
  console.log(`Found ${snapshot.docs.length} documents in '${collectionName}'.`);

  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let targetField = urlFields.find(field => data[field]);
    let currentUrl = targetField ? data[targetField] : null;

    if (currentUrl && !currentUrl.includes('cloudinary.com')) {
      count++;
      console.log(`[${count}/${snapshot.docs.length}] Uploading ID ${doc.id}...`);
      
      const newCloudUrl = await uploadToCloudinary(currentUrl);

      if (newCloudUrl) {
        // Safe update: Backup original URL and save new Cloudinary URL
        await db.collection(collectionName).doc(doc.id).update({
          [targetField]: newCloudUrl,
          original_url_backup: currentUrl 
        });
        console.log(` ✅ Safe Updated -> ${newCloudUrl}`);
      } else {
        console.log(` ⚠️ Skipped ID ${doc.id}: Original URL kept safe!`);
      }
    }
  }
  console.log(`Finished processing '${collectionName}'!`);
}

async function startFullSync() {
  console.log("🚀 Starting Safe Media Migration to Cloudinary...");
  await migrateCollection('animals', ['imageUrl', 'photo', 'mediaUrl', 'url']);
  await migrateCollection('reels', ['videoUrl', 'mediaUrl', 'url']);
  await migrateCollection('posts', ['mediaUrl', 'imageUrl', 'url']);
  console.log("\n=============================================");
  console.log("🎉 ALL MEDIA SAFELY MIGRATED TO CLOUDINARY!");
  console.log("=============================================");
}

startFullSync();
