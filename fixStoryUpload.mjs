import fs from 'fs';
import path from 'path';

// Find story upload handler file in the project
function scanAndFixStoryUpload(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      scanAndFixStoryUpload(full);
    } else if (item.endsWith('.jsx') || item.endsWith('.tsx') || item.endsWith('.js')) {
      let content = fs.readFileSync(full, 'utf8');
      
      // Check if file handles story upload
      if (content.includes('Share Story') || content.includes('Add Story') || content.includes('uploadBytes')) {
        console.log(`🔍 Found story component in: ${full}`);
        
        // Patch upload logic to use Replit storage endpoint /api/upload or base64 / FormData fallback
        const patchCode = `
        // Patched Story Upload Handler using Replit Object Storage / Backend API
        const handleStoryUpload = async (file, caption) => {
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caption', caption || '');
            
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            
            if (!res.ok) throw new Error('Failed to upload to Replit Storage');
            const data = await res.json();
            return data.url || data.filePath;
          } catch (err) {
            console.error("Story upload fallback error:", err);
            throw err;
          }
        };
        `;
        
        // Inject or replace standard upload code if necessary
        if (!content.includes('handleStoryUpload')) {
          content = content.replace(/const\s+uploadStory\s*=\s*async/g, patchCode + '\nconst uploadStory = async');
          fs.writeFileSync(full, content, 'utf8');
          console.log(`✅ Patched story upload handler in: ${full}`);
        }
      }
    }
  }
}

scanAndFixStoryUpload('.');
