import fs from 'fs';
import path from 'path';

function updateAdForm(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('Ad Title') && !content.includes('Ad Video')) {
    // Add state for ad video if not present
    if (!content.includes('adVideo')) {
      content = content.replace(
        /const\s+\[adTitle,\s*setAdTitle\]\s*=\s*useState\([^)]*\);/,
        `const [adTitle, setAdTitle] = useState("");\n  const [adVideo, setAdVideo] = useState(null);\n  const [adVideoPreview, setAdVideoPreview] = useState("");`
      );
    }

    const videoUploadUI = `
            <div className="ad-field" style={{ marginTop: '12px', marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Ad Video *</label>
              <input 
                type="file" 
                accept="video/*" 
                style={{ width: '100%', padding: '8px', background: '#1f2937', color: '#fff', borderRadius: '8px', border: '1px solid #374151' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    setAdVideo(file);
                    setAdVideoPreview(URL.createObjectURL(file));
                  }
                }} 
              />
              {adVideoPreview && (
                <div style={{ marginTop: '10px' }}>
                  <video src={adVideoPreview} controls style={{ width: '100%', maxHeight: '180px', borderRadius: '8px', background: '#000' }} />
                </div>
              )}
            </div>
    `;

    // Insert right after Website / Link field or Description field
    if (content.includes('Website / Link')) {
      content = content.replace(/(placeholder="https:\/\/yourwebsite\.com"[\s\S]*?<\/div>)/, `$1\n${videoUploadUI}`);
    } else {
      content = content.replace(/(placeholder="Describe your product or service\.\.\."[\s\S]*?<\/textarea>\s*<\/div>)/, `$1\n${videoUploadUI}`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Ad Video Upload option added to: ${filePath}`);
  }
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item.endsWith('.jsx') || item.endsWith('.tsx')) updateAdForm(full);
  }
}

scan('.');
