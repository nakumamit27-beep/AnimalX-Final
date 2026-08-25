import fs from 'fs';
import path from 'path';

const searchTerms = [
  { regex: /Animal X/g, replace: 'WildLingo' },
  { regex: /AnimalX/g, replace: 'WildLingo' },
  { regex: /animalx/g, replace: 'wildlingo' },
  { regex: /ANIMALX/g, replace: 'WILDLINGO' }
];

const targetDirs = ['./src', './public', './artifacts'];
const targetFiles = ['./index.html', './package.json', './README.md'];

let modifiedCount = 0;

function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const ext = path.extname(filePath).toLowerCase();
    // Skip binary / heavy assets
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.mp3', '.mp4', '.zip', '.pdf'].includes(ext)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanged = false;

    for (const term of searchTerms) {
      if (term.regex.test(content)) {
        content = content.replace(term.regex, term.replace);
        hasChanged = true;
      }
    }

    if (hasChanged) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      modifiedCount++;
    }
  } catch (err) {
    // Ignore unreadable files
  }
}

function scanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'build') continue;
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  }
}

console.log("🚀 Starting App Name Migration: 'Animal X' -> 'WildLingo'...\n");

for (const dir of targetDirs) scanDir(dir);
for (const file of targetFiles) processFile(file);

console.log(`\n🎉 Complete! Successfully updated ${modifiedCount} files to 'WildLingo'!`);
