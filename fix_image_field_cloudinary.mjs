const PROJECT_ID = 'happy-fd1bc';

async function fixImageField() {
  console.log("🚀 Updating the main 'image' field for ALL animal cards...");
  
  let nextPageToken = '';
  let totalProcessed = 0;

  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=300${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.documents || data.documents.length === 0) break;

    for (const doc of data.documents) {
      const docId = doc.name.split('/').pop();
      const fields = doc.fields || {};
      
      let rawPath = fields['image']?.stringValue || fields['imageObjectPath']?.stringValue || '';

      if (rawPath && !rawPath.includes('cloudinary.com')) {
        totalProcessed++;
        
        const fileName = rawPath.split('/').pop();
        const newCloudinaryUrl = `https://res.cloudinary.com/x1skanir/image/upload/wildlife_app/uploads/${fileName}`;

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

        console.log(`[${totalProcessed}] Fixed ID '${docId}' -> ${newCloudinaryUrl}`);
      }
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  console.log("\n=============================================");
  console.log(`🎉 COMPLETED! All ${totalProcessed} animal cards 'image' field updated.`);
  console.log("=============================================");
}

fixImageField();
