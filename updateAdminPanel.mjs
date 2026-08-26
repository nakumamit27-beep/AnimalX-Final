import fs from 'fs';
import path from 'path';

function findAndUpdateAdmin(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      findAndUpdateAdmin(full);
    } else if (item === 'Profile.jsx' || item === 'AdminPanel.jsx' || item.includes('Admin')) {
      let content = fs.readFileSync(full, 'utf8');
      
      // Inject Speed, Weight, Length fields into the Add Animal Form state & UI
      if (content.includes('Add New Animal') && !content.includes('topSpeed')) {
        content = content.replace(
          /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\(\{\s*name:\s*"",/g,
          'const [$1, setForm] = useState({ name: "", topSpeed: "", weight: "", length: "",'
        );

        const newFieldsUI = `
                  <div className="upload-row-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div className="upload-field">
                      <label className="upload-label">Speed</label>
                      <input className="upload-input" placeholder="e.g. 80 km/h" value={topSpeed || ""} onChange={e => setForm(a => ({ ...a, topSpeed: e.target.value }))} />
                    </div>
                    <div className="upload-field">
                      <label className="upload-label">Weight</label>
                      <input className="upload-input" placeholder="e.g. 190 kg" value={weight || ""} onChange={e => setForm(a => ({ ...a, weight: e.target.value }))} />
                    </div>
                    <div className="upload-field">
                      <label className="upload-label">Length</label>
                      <input className="upload-input" placeholder="e.g. 2.5 m" value={length || ""} onChange={e => setForm(a => ({ ...a, length: e.target.value }))} />
                    </div>
                  </div>
        `;

        content = content.replace(/(<label[^>]*>Lifespan<\/label>[\s\S]*?<\/div>)/, `$1\n${newFieldsUI}`);
        fs.writeFileSync(full, content, 'utf8');
        console.log(`✅ Added Speed, Weight, Length to Admin Panel in: ${full}`);
      }
    }
  }
}

findAndUpdateAdmin('.');
