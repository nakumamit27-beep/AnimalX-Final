const PROJECT_ID = 'happy-fd1bc';

async function updateUrls() {
  console.log("🚀 Firestore Image URLs ko Cloudinary Mapping par update kar rahe hain...");
  
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=1500`);
  const data = await res.json();

  if (!data.documents) return;

  let count = 0;
  for (const doc of data.documents) {
    const docId = doc.name.split('/').pop();
    const fields = doc.fields || {};
    let rawPath = fields['imageObjectPath']?.stringValue || fields['image']?.stringValue;

    if (rawPath && !rawPath.includes('res.cloudinary.com')) {
      count++;
      
      const relativePath = rawPath.replace(/^\/(api\/storage\/)?objects\//, '').replace(/^\//, '');
      const newCloudinaryUrl = `https://res.cloudinary.com/x1skanir/image/upload/wildlife_app/${relativePath}`;

      const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals/${docId}?updateMask.fieldPaths=image&updateMask.fieldPaths=original_image_backup`;
      
      await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            image: { stringValue: newCloudinaryUrl },
            original_image_backup: { stringValue: rawPath }
          }
        })
      });

      console.log(`[${count}/${data.documents.length}] Updated ID '${docId}' -> ${newCloudinaryUrl}`);
    }
  }

  console.log("\n=============================================");
  console.log("🎉 ALL FIRESTORE URLS SUCCESSFULLY MAPPED!");
  console.log("=============================================");
}

updateUrls();
