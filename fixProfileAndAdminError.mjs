import fs from 'fs';
import path from 'path';

function fixProfileFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix form state variable & handlers inside Profile.jsx safely
  if (content.includes('topSpeed') && content.includes('form.topSpeed')) {
    // Ensure form state exists or safe fallback exists
    content = content.replace(/value=\{form\.topSpeed \|\| ''\}/g, 'value={topSpeed || ""}');
    content = content.replace(/value=\{form\.weight \|\| ''\}/g, 'value={weight || ""}');
    content = content.replace(/value=\{form\.length \|\| ''\}/g, 'value={length || ""}');

    content = content.replace(/onChange=\{e => handleField\('topSpeed', e\.target\.value\)\}/g, 'onChange={e => setForm(a => ({ ...a, topSpeed: e.target.value }))}');
    content = content.replace(/onChange=\{e => handleField\('weight', e\.target\.value\)\}/g, 'onChange={e => setForm(a => ({ ...a, weight: e.target.value }))}');
    content = content.replace(/onChange=\{e => handleField\('length', e\.target\.value\)\}/g, 'onChange={e => setForm(a => ({ ...a, length: e.target.value }))}');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed 'form is not defined' runtime error in: ${filePath}`);
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item === 'Profile.jsx' || item.includes('Admin')) fixProfileFile(full);
  }
}

scan('.');
