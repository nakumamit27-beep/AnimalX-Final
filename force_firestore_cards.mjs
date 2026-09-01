import fs from 'fs';

const filePath = './src/pages/Animals.jsx';
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Priority to Firestore DB Cloudinary image links
  content = content.replace(
    /const displayAnimals = .*/g,
    `const displayAnimals = dbAnimals.length > 0 ? dbAnimals : animals;`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("✅ Animals page synced with Firestore DB!");
}
