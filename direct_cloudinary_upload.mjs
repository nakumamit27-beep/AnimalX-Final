const PROJECT_ID = 'happy-fd1bc';
const CLOUD_NAME = 'x1skanir';
const UPLOAD_PRESET = 'ml_default'; // Standard unsigned preset

async function uploadDirectly() {
  console.log("🚀 Uploading images directly to Cloudinary Media Library...");

  let nextPageToken = '';
  let count = 0;

  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=100${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.documents || data.documents.length === 0) break;

    for (const doc of data.documents) {
      const docId = doc.name.split('/').pop();
      const fields = doc.fields || {};
      let originalPath = fields['original_image_backup']?.stringValue || fields['imageObjectPath']?.stringValue;

      if (originalPath) {
        count++;
        const fileName = originalPath.split('/').pop();
        const fileUrl = `https://animal-x--Aniaml.replit.app/api/storage/objects/uploads/${fileName}`;

        const formData = new FormData();
        formData.append('file', fileUrl);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'wildlife_app/uploads');

        try {
          const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
          });
          const cloudData = await cloudRes.json();

          if (cloudData.secure_url) {
            // Update Firestore with explicit uploaded URL
            const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals/${docId}?updateMask.fieldPaths=image`;
            await fetch(patchUrl, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fields: { image: { stringValue: cloudData.secure_url } } })
            });
            console.log(`[${count}] Uploaded & Saved to Dashboard -> ${fileName}`);
          }
        } catch (e) {
          console.error(`Error uploading ${fileName}:`, e.message);
        }
      }
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  console.log("\n=============================================");
  console.log("🎉 ALL IMAGES UPLOADED DIRECTLY TO MEDIA LIBRARY!");
  console.log("=============================================");
}

uploadDirectly();
