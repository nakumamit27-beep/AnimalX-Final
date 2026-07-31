const { Client } = require('@replit/object-storage');
const fs = require('fs');
const path = require('path');

const client = new Client();

async function run() {
  try {
    const mediaDir = path.join(__dirname, 'media');
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir);
    }

    console.log("Bucket se files fetch ki ja rahi hain...");
    const result = await client.list();
    const objects = Array.isArray(result) ? result : (result.value || []);
    
    console.log(`Total files: ${objects.length}`);

    for (const obj of objects) {
      const name = obj.name || obj;
      const dest = path.join(mediaDir, path.basename(name));
      const fileData = await client.downloadAsBytes(name);
      const buffer = Buffer.from(fileData.value || fileData);
      fs.writeFileSync(dest, buffer);
      console.log(`Saved: ${name}`);
    }
    console.log("Sabhi files successfully download ho gayi hain!");
  } catch (e) {
    console.error("Error:", e);
  }
}

run();
