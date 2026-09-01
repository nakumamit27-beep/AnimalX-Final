const PROJECT_ID = 'happy-fd1bc';

async function fetchAllToCloudinary() {
  console.log("🚀 Requesting Cloudinary URLs to force background fetch & folder creation...");

  let nextPageToken = '';
  let count = 0;

  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=300${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.documents || data.documents.length === 0) break;

    for (const doc of data.documents) {
      const fields = doc.fields || {};
      const imgUrl = fields['image']?.stringValue || '';

      if (imgUrl.includes('res.cloudinary.com')) {
        count++;
        // Request image URL directly so Cloudinary fetches it from Replit
        fetch(imgUrl).catch(() => {});
        if (count % 50 === 0) {
          console.log(`[${count}] Triggered requests to Cloudinary...`);
        }
      }
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  console.log("\n=============================================");
  console.log(`🎉 Done! Triggered ${count} images. Check Cloudinary Folders now!`);
  console.log("=============================================");
}

fetchAllToCloudinary();
