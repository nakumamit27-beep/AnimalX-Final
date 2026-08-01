const { Client } = require('@replit/object-storage');
const fs = require('fs');
const path = require('path');

const client = new Client();

async function downloadAll() {
  const mediaDir = path.join(__dirname, 'media');
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
  }

  try {
    console.log("Bucket se saari files ki list nikaali ja rahi hai...");
    const result = await client.list();
    const files = result.value || result;

    if (!files || files.length === 0) {
      console.log("Bucket mein koi file nahi mili!");
      return;
    }

    console.log(`Kul ${files.length} files mili hain. Download shuru ho raha hai...`);

    for (let fileObj of files) {
      const fileName = typeof fileObj === 'string' ? fileObj : fileObj.name;
      const destPath = path.join(mediaDir, fileName);

      // Har file ke liye downloadToFilename ka use
      const { ok, error } = await client.downloadToFilename(fileName, destPath);
      
      if (ok) {
        console.log(`Downloaded: ${fileName}`);
      } else {
        console.log(`Failed to download ${fileName}:`, error);
      }
    }

    console.log("🎉 Sabhi photos aur files 'media' folder mein download ho chuki hain!");
  } catch (err) {
    console.error("Error aa gayi:", err);
  }
}

downloadAll();
