import fs from 'fs';

const filePath = './artifacts/animal-x/src/components/UploadReel.jsx';
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
  console.log("✅ SUCCESS: UploadReel.jsx updated successfully! Videos will now stream directly to Supabase.");
} else {
  console.log("⚠️ Pattern check failed. Applying direct string replacement...");
  const startIdx = content.indexOf("async function uploadToStorage");
  const endIdx = content.indexOf("return objectPath;\n}");
  
  if (startIdx !== -1 && endIdx !== -1) {
    const fullEndIdx = endIdx + "return objectPath;\n}".length;
    content = content.slice(0, startIdx) + newUploadFunction + content.slice(fullEndIdx);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("✅ SUCCESS: UploadReel.jsx updated via exact indexing!");
  } else {
    console.log("❌ Failed to replace automatically.");
  }
}
