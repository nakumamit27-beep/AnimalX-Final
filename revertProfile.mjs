import fs from 'fs';
import path from 'path';

function removeExtraInputs(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove topSpeed/weight/length input blocks
  content = content.replace(/<div[^>]*>[\s\S]*?Top Speed[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
  content = content.replace(/<div className="upload-row-3col"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Cleaned Profile.jsx! All extra inputs removed.`);
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item === 'Profile.jsx') removeExtraInputs(full);
  }
}

scan('.');
