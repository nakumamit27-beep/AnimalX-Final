import fs from 'fs';
import path from 'path';

function fixProfileAndReelSync(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  // 1. Ensure Reel upload uses dynamic profile name instead of hardcoded fallback
  if (content.includes('authorName') || content.includes('username') || content.includes('uploadReel')) {
    if (content.includes('"WildLingo"') || content.includes("'WildLingo'")) {
      content = content.replace(/['"]WildLingo['"]/g, 'profile?.displayName || profile?.username || user?.displayName || "WildSphere User"');
      modified = true;
    }
  }

  // 2. Ensure Reels upload fetches latest profile doc from firestore
  if (content.includes('addDoc') && content.includes('reels')) {
    content = content.replace(
      /authorName:\s*[^,\n\}]+/g,
      'authorName: profile?.displayName || profile?.name || user?.displayName || "WildSphere Creator"'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Synced live profile name in: ${filePath}`);
  }
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git' || item === 'dist') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item.endsWith('.jsx') || item.endsWith('.tsx') || item.endsWith('.js')) {
      fixProfileAndReelSync(full);
    }
  }
}

scan('.');
