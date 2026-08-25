import fs from 'fs';
import path from 'path';

function applyMobileViewFix(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Main Reels Page Container for Strict Mobile Viewport Height
  content = content.replace(
    /className="reels-page"/g,
    'className="reels-page" style={{ height: "100dvh", width: "100%", maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", background: "#000" }}'
  );

  // Fix Reels Top Bar Height Containment
  content = content.replace(
    /className="reels-top-bar"/g,
    'className="reels-top-bar" style={{ shrink: 0, zIndex: 30 }}'
  );

  // Fix Scroll Container for Snap Scrolling & Exact Calculated Height
  content = content.replace(
    /className="reels-scroll"/g,
    'className="reels-scroll" style={{ flex: 1, overflowY: "scroll", scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}'
  );

  // Lock Each Reel Item to 100% Container Height
  content = content.replace(
    /className=\`reel-item [\s\S]*?\`/g,
    'className={`reel-item ${isActive ? "active" : ""}`} style={{ height: "100%", width: "100%", scrollSnapAlign: "start", scrollSnapStop: "always", position: "relative", overflow: "hidden" }}'
  );

  // Make Video Tag Fill Parent Completely
  content = content.replace(
    /className="reel-video"/g,
    'className="reel-video" style={{ width: "100%", height: "100%", objectFit: "cover" }}'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Mobile Viewport Layout Fixed Successfully in: ${filePath}`);
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item === 'Reels.jsx') applyMobileViewFix(full);
  }
}

scan('.');
