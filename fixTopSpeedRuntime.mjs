import fs from 'fs';
import path from 'path';

function fixTopSpeed(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Find and replace invalid bare variable calls like topSpeed or value={topSpeed}
  content = content.replace(/value=\{topSpeed\}/g, "value={typeof form !== 'undefined' ? (form?.topSpeed || '') : ''}");
  content = content.replace(/value=\{weight\}/g, "value={typeof form !== 'undefined' ? (form?.weight || '') : ''}");
  content = content.replace(/value=\{length\}/g, "value={typeof form !== 'undefined' ? (form?.length || '') : ''}");
  content = content.replace(/handleField\(topSpeed/g, "handleField('topSpeed'");
  content = content.replace(/handleField\(weight/g, "handleField('weight'");
  content = content.replace(/handleField\(length/g, "handleField('length'");

  // Replace any broken JSX grid block containing topSpeed with a robust, error-free block
  const safeFieldsUI = `
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px', marginBottom: '10px' }}>
            <div>
              <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Top Speed</label>
              <input className="upload-input" placeholder="80 km/h" value={typeof form !== 'undefined' ? (form?.topSpeed || '') : (typeof newAnimal !== 'undefined' ? (newAnimal?.topSpeed || '') : '')} onChange={e => {
                const val = e.target.value;
                if (typeof handleField === 'function') handleField('topSpeed', val);
                else if (typeof setForm === 'function') setForm(f => ({ ...f, topSpeed: val }));
                else if (typeof setNewAnimal === 'function') setNewAnimal(a => ({ ...a, topSpeed: val }));
              }} />
            </div>
            <div>
              <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Weight</label>
              <input className="upload-input" placeholder="190 kg" value={typeof form !== 'undefined' ? (form?.weight || '') : (typeof newAnimal !== 'undefined' ? (newAnimal?.weight || '') : '')} onChange={e => {
                const val = e.target.value;
                if (typeof handleField === 'function') handleField('weight', val);
                else if (typeof setForm === 'function') setForm(f => ({ ...f, weight: val }));
                else if (typeof setNewAnimal === 'function') setNewAnimal(a => ({ ...a, weight: val }));
              }} />
            </div>
            <div>
              <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Length</label>
              <input className="upload-input" placeholder="2.5 m" value={typeof form !== 'undefined' ? (form?.length || '') : (typeof newAnimal !== 'undefined' ? (newAnimal?.length || '') : '')} onChange={e => {
                const val = e.target.value;
                if (typeof handleField === 'function') handleField('length', val);
                else if (typeof setForm === 'function') setForm(f => ({ ...f, length: val }));
                else if (typeof setNewAnimal === 'function') setNewAnimal(a => ({ ...a, length: val }));
              }} />
            </div>
          </div>
  `;

  if (content.includes('topSpeed') || content.includes('Top Speed')) {
    content = content.replace(/<div[^>]*style=\{\{\s*display:\s*['"]grid['"][\s\S]*?Top Speed[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, safeFieldsUI);
    content = content.replace(/<div className="upload-row-3col"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, safeFieldsUI);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Successfully fixed topSpeed error in: ${filePath}`);
  }
}

function scanAndFix(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scanAndFix(full);
    else if (item.endsWith('.jsx') || item.endsWith('.tsx')) fixTopSpeed(full);
  }
}

scanAndFix('.');
