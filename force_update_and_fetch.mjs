const PROJECT_ID = 'happy-fd1bc';

async function forceUpdateAndFetch() {
  console.log("🚀 Updating image fields and triggering Cloudinary fetch directly...");

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

      if (rawPath) {
        totalProcessed++;
        const fileName = rawPath.split('/').pop();
        const newCloudinaryUrl = `https://res.cloudinary.com/x1skanir/image/upload/wildlife_app/uploads/${fileName}`;

        // 1. Update Firestore
        const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals/${docId}?updateMask.fieldPaths=image`;
        await fetch(patchUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: { image: { stringValue: newCloudinaryUrl } }
          })
        });

        // 2. Trigger Cloudinary fetch immediately
        fetch(newCloudinaryUrl).catch(() => {});

        if (totalProcessed % 100 === 0) {
          console.log(`[${totalProcessed}] Updated & Triggered fetch...`);
        }
      }
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  console.log("\n=============================================");
  console.log(`🎉 SUCCESS! Processed ${totalProcessed} images.`);
  console.log("=============================================");
}

forceUpdateAndFetch();
