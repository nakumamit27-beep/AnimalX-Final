const fs = require('fs');

// 1. Update AnimalCard.jsx to use accurate Unsplash dynamic photos & stored base64/URL
const cardPath = 'src/components/AnimalCard.jsx';
if (fs.existsSync(cardPath)) {
  let content = fs.readFileSync(cardPath, 'utf8');

  // Inject helper for clean per-animal unsplash photos
  const resolver = `
  const getAnimalImage = (animal) => {
    if (!animal) return "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop";
    if (animal.image && animal.image.length > 10 && !animal.image.includes('emoji')) return animal.image;
    if (animal.imageUrl && animal.imageUrl.length > 10 && !animal.imageUrl.includes('emoji')) return animal.imageUrl;
    if (animal.photoUrl && animal.photoUrl.length > 10 && !animal.photoUrl.includes('emoji')) return animal.photoUrl;
    
    const name = encodeURIComponent(animal.name || animal.displayName || 'animal');
    return \`https://source.unsplash.com/featured/800x600/?\${name}\`;
  };
  `;

  if (!content.includes('getAnimalImage')) {
    content = content.replace(/export default function AnimalCard/, `${resolver}\nexport default function AnimalCard`);
  }

  content = content.replace(/src=\{[^\}]+\}/g, `src={getAnimalImage(animal)}`);
  fs.writeFileSync(cardPath, content, 'utf8');
  console.log("✅ AnimalCard.jsx updated with clean Unsplash fallback!");
}

// 2. Fix edit modal / upload logic in components to handle Base64 direct client-side upload
const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = dir + '/' + file;
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) results = results.concat(walk(filePath));
    else if (filePath.endsWith('.jsx')) results.push(filePath);
  });
  return results;
};

const jsxFiles = walk('src');
jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('Upload New Photo') || content.includes('Uploading...')) {
    // Replace upload fetch call to direct FileReader base64 string
    content = content.replace(
      /const response = await fetch\(['"`]\/api\/upload['"`][\s\S]*?\);/g,
      `// Direct Client-side Base64 Image handling for Firebase Hosting
      const reader = new FileReader();
      const base64Url = await new Promise((res) => {
        reader.onload = (e) => res(e.target.result);
        reader.readAsDataURL(file);
      });
      const response = { ok: true, json: async () => ({ url: base64Url }) };`
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed client-side upload in ${file}`);
  }
});

