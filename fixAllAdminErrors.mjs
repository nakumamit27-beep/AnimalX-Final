import fs from 'fs';
import path from 'path';

function fixFileContent(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix bare topSpeed / weight / length variable calls
  content = content.replace(/value=\{topSpeed\}/g, 'value={form.topSpeed}');
  content = content.replace(/value=\{weight\}/g, 'value={form.weight}');
  content = content.replace(/value=\{length\}/g, 'value={form.length}');
  content = content.replace(/newAnimal\?\./g, 'form.');

  // Clean replacement for Admin Panel inputs
  const cleanInputs = `
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', margin: '10px 0' }}>
              <div>
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af' }}>Top Speed</label>
                <input className="upload-input" placeholder="e.g. 80 km/h" value={(typeof form !== 'undefined' && form?.topSpeed) || ''} onChange={e => { if (typeof handleField === 'function') handleField('topSpeed', e.target.value); }} />
              </div>
              <div>
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af' }}>Weight</label>
                <input className="upload-input" placeholder="e.g. 190 kg" value={(typeof form !== 'undefined' && form?.weight) || ''} onChange={e => { if (typeof handleField === 'function') handleField('weight', e.target.value); }} />
              </div>
              <div>
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af' }}>Length</label>
                <input className="upload-input" placeholder="e.g. 2.5 m" value={(typeof form !== 'undefined' && form?.length) || ''} onChange={e => { if (typeof handleField === 'function') handleField('length', e.target.value); }} />
              </div>
            </div>
  `;

  if (content.includes('topSpeed') || content.includes('Top Speed')) {
    content = content.replace(/<div[^>]*style=\{\{\s*display:\s*['"]grid['"][\s\S]*?Top Speed[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, cleanInputs);
    content = content.replace(/<div className="upload-row-3col"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, cleanInputs);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Successfully fixed syntax error in: ${filePath}`);
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scanDir(full);
    else if (item.endsWith('.jsx') || item.endsWith('.tsx')) fixFileContent(full);
  }
}

scanDir('.');
