const PROJECT_ID = 'happy-fd1bc';

async function fetchAllToCloudinary() {
  console.log("🚀 Triggering Cloudinary to fetch all 1213 images from Replit Storage...");

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

      if (imgUrl.includes('cloudinary.com')) {
        count++;
        fetch(imgUrl).catch(() => {});
        if (count % 100 === 0) {
          console.log(`[${count}] Cloudinary network requests fired...`);
        }
      }
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  console.log("\n=============================================");
  console.log(`🎉 SUCCESS! Triggered ${count} images for Cloudinary caching.`);
  console.log("=============================================");
}

fetchAllToCloudinary();
