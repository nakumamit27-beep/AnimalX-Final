import fs from 'fs';
import path from 'path';

function fixReelsFlexLayout(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Main Root Container to Flex Column with zero overflow
  content = content.replace(
    /className="reels-page"[\s\S]*?>/,
    'className="reels-page" style={{ height: "100%", minHeight: "0", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: "#000", position: "relative" }}>'
  );

  // Scroll Container with flex-1 and min-h-0 so it fits exact remaining height
  content = content.replace(
    /className="reels-scroll"[\s\S]*?>/,
    'className="reels-scroll" ref={scrollRef} style={{ flex: 1, minHeight: 0, width: "100%", overflowY: "scroll", scrollSnapType: "y mandatory", scrollbarWidth: "none" }}>'
  );

  // Each Reel Item locked to 100% of the flex container height
  content = content.replace(
    /className=\{\`reel-item [\s\S]*?\`/g,
    'className={`reel-item ${isActive ? "active" : ""}`} style={{ height: "100%", width: "100%", scrollSnapAlign: "start", scrollSnapStop: "always", position: "relative", overflow: "hidden" }}'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed Flex Viewport Height in: ${filePath}`);
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item === 'Reels.jsx') fixReelsFlexLayout(full);
  }
}

scan('.');
