import crypto from 'crypto';

const PROJECT_ID = 'happy-fd1bc';
const CLOUD_NAME = 'x1ekanir'; // Corrected Cloud Name
const API_KEY = '735145446791451';
const API_SECRET = 'ho9QXa_SsNgRUj9dc_wcuwTplVs';

function generateSignature(params, secret) {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(serialized + secret).digest('hex');
}

async function startUpload() {
  console.log("🚀 Starting Upload with correct Cloud Name 'x1ekanir'...");

  let nextPageToken = '';
  let count = 0;

  do {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals?pageSize=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.documents || data.documents.length === 0) break;

    for (const doc of data.documents) {
      const docId = doc.name.split('/').pop();
      const fields = doc.fields || {};
      let imgVal = fields['image']?.stringValue || fields['original_image_backup']?.stringValue || fields['imageObjectPath']?.stringValue || '';

      if (imgVal) {
        count++;
        const fileName = imgVal.split('/').pop();
        const sourceUrl = `https://animal-x--Aniaml.replit.app/api/storage/objects/uploads/${fileName}`;
        const timestamp = Math.floor(Date.now() / 1000);

        const params = {
          folder: 'wildlife_app',
          timestamp: timestamp
        };

        const signature = generateSignature(params, API_SECRET);

        const formData = new FormData();
        formData.append('file', sourceUrl);
        formData.append('api_key', API_KEY);
        formData.append('timestamp', timestamp);
        formData.append('folder', 'wildlife_app');
        formData.append('signature', signature);

        try {
          const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData
          });
          const cloudData = await cloudRes.json();

          if (cloudData.secure_url) {
            const patchUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals/${docId}?updateMask.fieldPaths=image`;
            await fetch(patchUrl, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fields: { image: { stringValue: cloudData.secure_url } } })
            });

            console.log(`[${count}] ✅ SUCCESS: ${fileName}`);
          } else {
            console.log(`[${count}] ❌ Error:`, cloudData.error?.message || cloudData);
          }
        } catch (err) {
          console.log(`[${count}] ❌ Network Error:`, err.message);
        }
      }
    }

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  console.log("\n=============================================");
  console.log("🎉 ALL IMAGES MIGRATED TO CLOUDINARY!");
  console.log("=============================================");
}

startUpload();
