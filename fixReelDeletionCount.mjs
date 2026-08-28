import fs from 'fs';
import path from 'path';

function updateReelDeleteHandler(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  let modified = false;

  // Ensure increment / decrement from firebase/firestore is imported if missing
  if (content.includes('deleteDoc') && !content.includes('increment')) {
    content = content.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"]firebase\/firestore['"];/,
      (match, imports) => `import { ${imports.trim()}, increment } from 'firebase/firestore';`
    );
    modified = true;
  }

  // Update reel deletion logic to decrement user reel count & sync state dynamically
  if (content.includes('deleteDoc') && (content.includes('reels') || content.includes('deleteReel'))) {
    if (!content.includes('increment(-1)')) {
      content = content.replace(
        /(await\s+deleteDoc\(doc\(db,\s*['"]reels['"],\s*[\w\.\s]+?\)\);)/g,
        `$1\n    try {\n      if (user?.uid) {\n        await updateDoc(doc(db, "users", user.uid), { reelsCount: increment(-1), postsCount: increment(-1) });\n      }\n    } catch (e) { console.error("Error decrementing count:", e); }`
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed Reel Deletion & Real-Time Count Decrement in: ${filePath}`);
  }
}

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git' || item === 'dist') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (item.endsWith('.jsx') || item.endsWith('.tsx') || item.endsWith('.js')) {
      updateReelDeleteHandler(full);
    }
  }
}

scan('.');
