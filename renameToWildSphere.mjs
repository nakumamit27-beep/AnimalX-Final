import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('WildLingo') || content.includes('wildlingo')) {
      const updated = content
        .replace(/WildLingo/g, 'WildSphere')
        .replace(/wildlingo/g, 'wildsphere');
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`✅ Updated name in: ${filePath}`);
    }
  } catch (err) {
    // Ignore read errors for binary/system files
  }
}

function scanAndReplace(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'build') continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanAndReplace(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      if (['.jsx', '.tsx', '.js', '.ts', '.json', '.html', '.md', '.css'].includes(ext)) {
        replaceInFile(fullPath);
      }
    }
  }
}

console.log('🚀 Changing project name to WildSphere everywhere...');
scanAndReplace('.');
console.log('🎉 Done! All references updated to WildSphere.');
