const PROJECT_ID = 'happy-fd1bc';
const CLOUD_NAME = 'x1skanir';

async function testUploadAndMigrate() {
  console.log("🚀 Debugging & Uploading images to Cloudinary...");

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=5`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.documents) {
    console.log("❌ No Firestore documents found!");
    return;
  }

  for (const doc of data.documents) {
    const docId = doc.name.split('/').pop();
    const fields = doc.fields || {};
    
    // Read any available path
    let imgVal = fields['image']?.stringValue || fields['imageObjectPath']?.stringValue || '';
    
    console.log(`\n📌 Processing Document ID: ${docId}`);
    console.log(`   Current Path in DB: ${imgVal}`);

    if (imgVal) {
      const fileName = imgVal.split('/').pop();
      // Target direct public asset URL from Replit
      const sourceUrl = `https://animal-x--Aniaml.replit.app/api/storage/objects/uploads/${fileName}`;
      console.log(`   Trying Source URL: ${sourceUrl}`);

      const formData = new FormData();
      formData.append('file', sourceUrl);
      formData.append('upload_preset', 'ml_default');
      formData.append('folder', 'wildlife_app');

      try {
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const cloudData = await cloudRes.json();

        if (cloudData.secure_url) {
          console.log(`   ✅ SUCCESS UPLOAD! Cloudinary URL: ${cloudData.secure_url}`);
        } else {
          console.log(`   ❌ Cloudinary Error:`, cloudData.error ? cloudData.error.message : cloudData);
        }
      } catch (err) {
        console.log(`   ❌ Network Error:`, err.message);
      }
    }
  }
}

testUploadAndMigrate();
