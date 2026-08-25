import fs from 'fs';
import path from 'path';

function fixReelsExactLayout(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Root container strict 100% viewport height
  content = content.replace(
    /className="reels-page"/g,
    'className="reels-page" style={{ height: "calc(100vh - 60px)", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#000", position: "relative" }}'
  );

  // 2. Scroll container takes remaining full space & snaps strictly per video item
  content = content.replace(
    /className="reels-scroll"/g,
    'className="reels-scroll" style={{ flex: 1, width: "100%", height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory", scrollbarWidth: "none" }}'
  );

  // 3. Each Reel item takes EXACT 100% parent height (no extra white gap or double split)
  content = content.replace(
    /className=\{\`reel-item [\s\S]*?\`/g,
    'className={`reel-item ${isActive ? "active" : ""}`} style={{ height: "100%", width: "100%", scrollSnapAlign: "start", scrollSnapStop: "always", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContents: "center" }}'
  );

  // 4. Video wrapper and Video tag full fit
  content = content.replace(
    /className="reel-video"/g,
    'className="reel-video" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Mobile Full-Screen Layout Fixed in: ${filePath}`);
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item === 'Reels.jsx') fixReelsExactLayout(full);
  }
}

scan('.');
