import fs from 'fs';

const filePath = './src/pages/Animals.jsx';
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Firestore DB docs ko primary priority aur local list ko skip karein
  content = content.replace(
    /const displayAnimals = .*/g,
    `const displayAnimals = dbAnimals.length > 0 ? dbAnimals : [];`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("✅ Component forced to show ONLY Firestore database records!");
}
