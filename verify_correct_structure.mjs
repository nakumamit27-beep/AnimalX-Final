const PROJECT_ID = 'happy-fd1bc';

async function verify() {
  console.log("🔍 Checking Firestore Image Links accurately...");
  
  let nextPageToken = '';
  let totalDocs = 0;
  let cloudinaryMapped = 0;
  let nonCloudinary = 0;

  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=300${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.documents || data.documents.length === 0) break;

    for (const doc of data.documents) {
      totalDocs++;
      const fields = doc.fields || {};
      
      // Check both image field and raw object paths
      const imgPath = fields['image']?.stringValue || '';

      if (imgPath.includes('cloudinary.com')) {
        cloudinaryMapped++;
      } else {
        nonCloudinary++;
      }
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  console.log("\n=============================================");
  console.log(`📊 TOTAL ANIMALS IN DATABASE: ${totalDocs}`);
  console.log(`✅ CLOUDINARY MAPPED PHOTOS: ${cloudinaryMapped}`);
  console.log(`⚠️ REMAINING UNMAPPED PHOTOS: ${nonCloudinary}`);
  console.log("=============================================");
}

verify();
