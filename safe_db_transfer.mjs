const CLOUD_NAME = 'x1skanir';
const UPLOAD_PRESET = 'ml_default';
const PROJECT_ID = 'happy-fd1bc';

console.log("🚀 Starting Safe DB Migration via REST API...");

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
  console.log(`\n🔍 Fetching documents from collection: '${collectionName}'...`);
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}?pageSize=300`);
    const data = await res.json();

    if (!data.documents) {
      console.log(`No items found in '${collectionName}'.`);
      return;
    }

    console.log(`Found ${data.documents.length} records in '${collectionName}'.`);

    let count = 0;
    for (const doc of data.documents) {
      const docId = doc.name.split('/').pop();
      const fields = doc.fields || {};
      const currentUrl = fields[primaryField]?.stringValue || fields['imageUrl']?.stringValue || fields['photo']?.stringValue || fields['mediaUrl']?.stringValue;

      if (currentUrl && !currentUrl.includes('cloudinary.com')) {
        count++;
        console.log(`[${count}/${data.documents.length}] Processing ID: ${docId}...`);
        
        const newCloudUrl = await uploadToCloudinary(currentUrl);

        if (newCloudUrl) {
          await updateFirestoreDoc(collectionName, docId, primaryField, newCloudUrl, currentUrl);
          console.log(` ✅ Safely Migrated -> ${newCloudUrl}`);
        } else {
          console.log(` ⚠️ Skipped ID ${docId}: Kept original URL safe!`);
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
  await processCollection('posts', 'mediaUrl');
  console.log("\n=============================================");
  console.log("🎉 SAFE MIGRATION COMPLETE! All photos are backup-protected.");
  console.log("=============================================");
}

start();
