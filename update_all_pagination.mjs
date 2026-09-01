const PROJECT_ID = 'happy-fd1bc';

async function updateAllBatches() {
  console.log("🚀 Syncing ALL remaining Firestore pages to Cloudinary URLs...");
  
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
      let rawPath = fields['imageObjectPath']?.stringValue || fields['image']?.stringValue;

      if (rawPath && !rawPath.includes('res.cloudinary.com')) {
        totalProcessed++;
        
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

        console.log(`[Total: ${totalProcessed}] ID '${docId}' -> ${newCloudinaryUrl}`);
      }
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  console.log("\n=============================================");
  console.log("🎉 ALL ANIMAL CARDS ACROSS ALL PAGES UPDATED!");
  console.log("=============================================");
}

updateAllBatches();
