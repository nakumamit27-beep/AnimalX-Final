import fs from 'fs';
import path from 'path';

function fixReelsFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove DEMO_REELS and FAKE_FEED_REELS fallback inside buildFeed
  content = content.replace(
    /function buildFeed\([\s\S]*?\n\}/g,
    `function buildFeed(liveReels, catFilter) {
  const all = liveReels.map(r => ({ ...r, _rank: 2000 + (r.likes || 0) * 0.01 + (Date.now() - (r.createdAt?.toMillis?.() || 0)) * -0.000001 }));
  const seen = new Set();
  const deduped = all.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
  const filtered = catFilter === "All" ? deduped : deduped.filter(r => r.category === catFilter || r.cat === catFilter);
  return filtered.sort((a, b) => b._rank - a._rank);
}`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed Fake Reels Removal in: ${filePath}`);
}

function fixUploadModalCSS(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix Upload Sheet alignment so footer buttons are visible and centered
  content = content.replace(
    /className="upload-sheet"/g,
    'className="upload-sheet" style={{ maxHeight: "85vh", display: "flex", flexDirection: "column", position: "relative", top: "50%", transform: "translateY(-50%)", margin: "auto" }}'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed Upload Modal Positioning in: ${filePath}`);
}

function scanAndFix(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scanAndFix(full);
    else if (item === 'Reels.jsx') fixReelsFile(full);
    else if (item === 'UploadReel.jsx') fixUploadModalCSS(full);
  }
}

scanAndFix('.');
console.log("🎉 Complete! Fake content removed & Upload modal buttons centered!");
