import fs from 'fs';

const filePath = './src/components/UploadReel.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Supabase Client Import if missing
if (!content.includes("from '../utils/supabase'") && !content.includes("from '../supabaseClient'")) {
  content = `import { supabase } from '../utils/supabase';\n` + content;
}

// 2. Replace uploadToStorage function to stream directly to Supabase Bucket
const oldUploadFunction = /async function uploadToStorage[\s\S]*?return objectPath;\s*\}/;

const newUploadFunction = `async function uploadToStorage(file, contentType) {
  const fileName = \`reels/\${Date.now()}_\${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}\`;
  
  // Upload directly to Supabase Storage Bucket
  const { data, error } = await supabase.storage
    .from('wildlife-videos')
    .upload(fileName, file, {
      contentType: contentType,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error('Supabase Upload Error: ' + error.message);
  }

  // Get Direct Public Video URL
  const { data: publicUrlData } = supabase.storage
    .from('wildlife-videos')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}`;

if (oldUploadFunction.test(content)) {
  content = content.replace(oldUploadFunction, newUploadFunction);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("✅ SUCCESS: UploadReel.jsx updated! Replit storage bypassed -> Video will now go directly to Supabase.");
} else {
  console.log("⚠️ Could not match old uploadToStorage block automatically. Checking file...");
}
