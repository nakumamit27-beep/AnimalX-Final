const fs = require('fs');

// 1. Properly patch AnimalCard.jsx without syntax error
const cardPath = 'src/components/AnimalCard.jsx';
if (fs.existsSync(cardPath)) {
  let content = fs.readFileSync(cardPath, 'utf8');

  // Safely replace image src attribute
  content = content.replace(
    /src=\{[^\}]+\}/g,
    `src={animal.image || animal.imageUrl || animal.photoUrl || \`https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop\`}`
  );

  fs.writeFileSync(cardPath, content, 'utf8');
  console.log("✅ AnimalCard syntax fixed!");
}

// 2. Patch file upload logic for Firebase Hosting (Base64)
const uploadFiles = ['src/components/AnimalCard.jsx', 'src/pages/Profile.jsx', 'src/components/UploadReel.jsx'];
uploadFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('/api/upload')) {
      content = content.replace(
        /fetch\(['"`]\/api\/upload['"`][\s\S]*?\)/g,
        `new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ ok: true, json: async () => ({ url: e.target.result }) });
          reader.readAsDataURL(file);
        })`
      );
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Base64 Upload patched in ${file}`);
    }
  }
});
