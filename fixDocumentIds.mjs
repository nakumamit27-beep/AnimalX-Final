import fs from 'fs';

let seedPath = './src/data/wildlifeSeed.js';
if (!fs.existsSync(seedPath)) {
  seedPath = './artifacts/animal-x/src/data/wildlifeSeed.js';
}

const wildlifeSeedModule = await import(seedPath);
const PROJECT_ID = "happy-fd1bc";
const API_KEY = "AIzaSyB3RzIrVl0xGtmin3RMDxKhyA6eMtgWN4";

function formatValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return { integerValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(item => formatValue(item)) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = formatValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function uploadToFirestore(docId, fields) {
  const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animalDetails/${docId}?key=${API_KEY}`;
  return fetch(docUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
}

async function run() {
  const dataMap = wildlifeSeedModule.default || wildlifeSeedModule.WILDLIFE_SEED || wildlifeSeedModule;
  const entries = Object.entries(dataMap);
  console.log(`🚀 Link fixing: Uploading ${entries.length} Animals to BOTH Numeric IDs & Name Slugs...\n`);

  for (let i = 0; i < entries.length; i++) {
    const [name, data] = entries[i];
    const slugId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const numericId = String(i + 1); // Document ID as 1, 2, 3... matching /animals/3

    if (data && data.taxonomicClass && !data.class) data.class = data.taxonomicClass;

    const fields = {};
    for (const [key, val] of Object.entries(data)) {
      fields[key] = formatValue(val);
    }

    try {
      // 1. Save to Numeric ID (e.g. '3' for Elephant)
      await uploadToFirestore(numericId, fields);
      
      // 2. Save to Slug ID (e.g. 'elephant')
      await uploadToFirestore(slugId, fields);

      console.log(`[${i + 1}/${entries.length}] ✅ Mapped ID: ${numericId} & ${slugId} (${name})`);
    } catch (err) {
      console.error(`❌ Error (${name}):`, err.message);
    }
  }
  console.log("\n🎉 Complete! Ab `/animals/3` page refresh karke check karein!");
}

run();
