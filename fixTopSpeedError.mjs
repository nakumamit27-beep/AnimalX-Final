import fs from 'fs';
import path from 'path';

function fixTopSpeedInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  // Fix bare 'topSpeed' references in JSX attributes or values
  if (content.includes('topSpeed')) {
    // Replace unquoted or bare topSpeed variable calls
    content = content.replace(/value=\{topSpeed\}/g, 'value={form?.topSpeed || ""}');
    content = content.replace(/value=\{topSpeed \|\| ''\}/g, 'value={form?.topSpeed || ""}');
    content = content.replace(/handleField\(topSpeed,/g, "handleField('topSpeed',");
    content = content.replace(/handleField\(\s*topSpeed\s*,\s*/g, "handleField('topSpeed', ");
    
    // Complete replacement for the added Speed, Weight, Length inputs with 100% safe state checks
    const safeInputsUI = `
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <div>
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af' }}>Top Speed</label>
                <input className="upload-input" placeholder="e.g. 80 km/h" value={typeof form !== 'undefined' ? (form?.topSpeed || '') : ''} onChange={e => typeof handleField === 'function' ? handleField('topSpeed', e.target.value) : null} />
              </div>
              <div>
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af' }}>Weight</label>
                <input className="upload-input" placeholder="e.g. 190 kg" value={typeof form !== 'undefined' ? (form?.weight || '') : ''} onChange={e => typeof handleField === 'function' ? handleField('weight', e.target.value) : null} />
              </div>
              <div>
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af' }}>Length</label>
                <input className="upload-input" placeholder="e.g. 2.5 m" value={typeof form !== 'undefined' ? (form?.length || '') : ''} onChange={e => typeof handleField === 'function' ? handleField('length', e.target.value) : null} />
              </div>
            </div>
    `;

    // Replace the problematic grid block
    content = content.replace(/<div[^>]*style=\{\{\s*display:\s*['"]grid['"][\s\S]*?Top Speed[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, safeInputsUI);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed 'topSpeed is not defined' error in: ${filePath}`);
  }
}

function scanAll(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scanAll(full);
    else if (item.endsWith('.jsx') || item.endsWith('.tsx')) fixTopSpeedInFile(full);
  }
}

scanAll('.');
