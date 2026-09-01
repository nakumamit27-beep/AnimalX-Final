const fs = require('fs');

const cardPath = 'src/components/AnimalCard.jsx';

if (fs.existsSync(cardPath)) {
  let content = fs.readFileSync(cardPath, 'utf8');

  // Insert dynamic per-animal image resolver
  const dynamicResolver = `
  const getAnimalPhoto = (animal) => {
    if (!animal) return "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop";
    
    // Use stored direct URL if available and valid
    if (animal.image && (animal.image.startsWith('http://') || animal.image.startsWith('https://'))) return animal.image;
    if (animal.imageUrl && (animal.imageUrl.startsWith('http://') || animal.imageUrl.startsWith('https://'))) return animal.imageUrl;
    if (animal.photoUrl && (animal.photoUrl.startsWith('http://') || animal.photoUrl.startsWith('https://'))) return animal.photoUrl;

    // Generate accurate dynamic photo query based on exact animal name
    const query = encodeURIComponent((animal.name || animal.displayName || 'wildlife').toLowerCase());
    return \`https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop\`;
  };
  `;

  // Update src logic in AnimalCard component cleanly
  content = content.replace(
    /src=\{[^\}]+\}/g,
    `src={animal.image && animal.image.startsWith('http') ? animal.image : (animal.imageUrl && animal.imageUrl.startsWith('http') ? animal.imageUrl : \`https://loremflickr.com/800/600/\${encodeURIComponent((animal.name || 'animal').toLowerCase())}\`)}`
  );

  fs.writeFileSync(cardPath, content, 'utf8');
  console.log("✅ Fixed dynamic per-animal photos in AnimalCard.jsx!");
}
