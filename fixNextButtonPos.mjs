import fs from 'fs';
import path from 'path';

function fixUploadModalUI(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Ensure modal backdrop centers the sheet properly
  content = content.replace(
    /className="upload-backdrop"/g,
    'className="upload-backdrop" style={{ display: "flex", alignItems: "center", justifyContents: "center", padding: "12px", zIndex: 9999 }}'
  );

  // 2. Set upload-sheet to fixed max height and column layout
  content = content.replace(
    /className="upload-sheet"[\s\S]*?>/g,
    'className="upload-sheet" style={{ maxHeight: "82vh", width: "100%", maxWidth: "420px", margin: "auto", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "20px", background: "#111827", position: "relative" }}>'
  );

  // 3. Make upload-body internal scrollable
  content = content.replace(
    /className="upload-body"/g,
    'className="upload-body" style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "20px" }}'
  );

  // 4. Ensure upload-footer is sticky/always visible at bottom
  content = content.replace(
    /className="upload-footer"/g,
    'className="upload-footer" style={{ padding: "12px 16px", background: "#1f2937", borderTop: "1px solid #374151", display: "flex", alignItems: "center", justifyContent: "space-between", shrink: 0, zIndex: 10 }}'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Upload Reel Modal & Next Button UI fixed successfully in: ${filePath}`);
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item === 'UploadReel.jsx') fixUploadModalUI(full);
  }
}

scan('.');
