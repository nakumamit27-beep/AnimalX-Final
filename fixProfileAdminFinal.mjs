import fs from 'fs';
import path from 'path';

function fixProfileFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix any undefined newAnimal or broken form state variables
  content = content.replace(/newAnimal\?\./g, '');
  content = content.replace(/setForm/g, 'setForm');

  // Clean form input structure for Speed, Weight, Length
  const cleanFieldsUI = `
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px', marginBottom: '10px' }}>
              <div>
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Top Speed</label>
                <input className="upload-input" placeholder="80 km/h" value={typeof form !== 'undefined' ? (form?.topSpeed || '') : ''} onChange={e => typeof handleField === 'function' ? handleField('topSpeed', e.target.value) : (typeof setForm === 'function' && setForm(f => ({ ...f, topSpeed: e.target.value })))} />
              </div>
              <div>
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Weight</label>
                <input className="upload-input" placeholder="190 kg" value={typeof form !== 'undefined' ? (form?.weight || '') : ''} onChange={e => typeof handleField === 'function' ? handleField('weight', e.target.value) : (typeof setForm === 'function' && setForm(f => ({ ...f, weight: e.target.value })))} />
              </div>
              <div>
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Length</label>
                <input className="upload-input" placeholder="2.5 m" value={typeof form !== 'undefined' ? (form?.length || '') : ''} onChange={e => typeof handleField === 'function' ? handleField('length', e.target.value) : (typeof setForm === 'function' && setForm(f => ({ ...f, length: e.target.value })))} />
              </div>
            </div>
  `;

  // Safely replace any previously broken speed/weight blocks
  if (content.includes('topSpeed')) {
    content = content.replace(/<div[^>]*style=\{\{\s*display:\s*['"]grid['"][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, cleanFieldsUI);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed Profile & Hidden Admin Panel in: ${filePath}`);
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
