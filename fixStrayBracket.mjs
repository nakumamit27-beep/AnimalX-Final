import fs from 'fs';

const filePath = './artifacts/animal-x/src/pages/Profile.jsx';

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove stray bracket between buttons row and story section
  content = content.replace(/<\/button>\s*\(\s*<div/g, '</button>\n<div');
  content = content.replace(/<\/div>\s*\(\s*<div/g, '</div>\n<div');
  content = content.replace(/\)\s*\(\s*</g, ')\n<');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("✅ Extra '(' character successfully removed from Profile.jsx!");
}
