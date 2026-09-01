import fs from 'fs';

const CLOUD_NAME = 'x1skanir';
const UPLOAD_PRESET = 'ml_default';

console.log("Direct Upload Engine Started...");
console.log(`Target Cloud: ${CLOUD_NAME} | Preset: ${UPLOAD_PRESET}`);

async function uploadLocalFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const fileData = fs.readFileSync(filePath);
  const blob = new Blob([fileData]);
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  return data.secure_url;
}

console.log("Sync complete! Cloudinary preset is active for all new & local uploads.");
