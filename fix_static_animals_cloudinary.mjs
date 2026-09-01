import fs from 'fs';
import path from 'path';

// Files where default animal list / seed data is stored
const targetFiles = [
  './src/data/animals.js',
  './src/data/animals.mjs',
  './src/data/wildlifeSeed.js',
  './src/data/animals.ts',
  './src/data/animalsData.js'
];

targetFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace emoji or local storage path with Cloudinary fallback / uploaded links
    content = content.replace(
      /image:\s*['"`](?!\s*https?:\/\/res\.cloudinary\.com)[^'"`]*['"`]/g,
      `image: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=800&q=80'`
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated Cloudinary/Real photos in ${file}`);
  }
});
