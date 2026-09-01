import fs from 'fs';
import path from 'path';

const CLOUD_NAME = 'x1skanir';
const UPLOAD_PRESET = 'ml_default';

async function uploadFileToCloudinary(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'wildlife_app');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    return null;
  }
}

function findMediaFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules') continue;
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findMediaFiles(filePath, fileList);
        } else if (/\.(jpg|jpeg|png|webp|mp4|mov)$/i.test(file)) {
          fileList.push(filePath);
        }
      } catch (e) {}
    }
  } catch (e) {}
  
  return fileList;
}

async function run() {
  console.log("Scanning workspace for Replit storage assets...");
  
  const searchPaths = [
    process.cwd(),
    '/replit-objstore-a69f0f31-fdd4-42e3-aa1a-f77c299073cf'
  ];

  let mediaFiles = [];
  for (const p of searchPaths) {
    mediaFiles = mediaFiles.concat(findMediaFiles(p));
  }

  // Remove duplicates
  mediaFiles = [...new Set(mediaFiles)];

  console.log(`Found ${mediaFiles.length} media files across workspace.`);

  for (const filePath of mediaFiles) {
    const fileName = path.basename(filePath);
    console.log(`Transferring: ${fileName}`);
    const url = await uploadFileToCloudinary(filePath);
    if (url) {
      console.log(`✅ Success: ${url}`);
    }
  }

  console.log("\n🎉 All local & object storage files transferred to Cloudinary!");
}

run();
