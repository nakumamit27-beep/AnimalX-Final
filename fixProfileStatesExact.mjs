import fs from 'fs';

const filePath = './artifacts/animal-x/src/pages/Profile.jsx';

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add state hooks if missing
  if (!content.includes('const [newSpeed, setNewSpeed]')) {
    content = content.replace(
      /const\s+\[newLifespan,\s*setNewLifespan\]\s*=\s*useState\([^)]*\);/,
      `const [newLifespan, setNewLifespan] = useState("");\n  const [newSpeed, setNewSpeed] = useState("");\n  const [newWeight, setNewWeight] = useState("");\n  const [newLength, setNewLength] = useState("");`
    );
  }

  // Replace invalid topSpeed / setForm inputs with correct state variables
  const cleanFieldsUI = `
            <div className="upload-row-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' }}>
              <div className="upload-field">
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af' }}>Speed</label>
                <input className="upload-input" placeholder="e.g. 80 km/h" value={newSpeed} onChange={e => setNewSpeed(e.target.value)} />
              </div>
              <div className="upload-field">
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af' }}>Weight</label>
                <input className="upload-input" placeholder="e.g. 190 kg" value={newWeight} onChange={e => setNewWeight(e.target.value)} />
              </div>
              <div className="upload-field">
                <label className="upload-label" style={{ fontSize: '11px', color: '#9ca3af' }}>Length</label>
                <input className="upload-input" placeholder="e.g. 2.5 m" value={newLength} onChange={e => setNewLength(e.target.value)} />
              </div>
            </div>`;

  // Replace the broken block at line 795-808
  content = content.replace(/<div className="upload-row-3col"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, cleanFieldsUI);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Profile.jsx fixed with proper states (newSpeed, newWeight, newLength)!`);
}
