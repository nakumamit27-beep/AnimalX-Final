import fs from 'fs';

const GEMINI_API_KEY = "AIzaSyAzy-9s_Po-MjRemxeDi3pCCp7f4AVfuSg";
const PROJECT_ID = "happy-fd1bc";
const FIREBASE_API_KEY = "AIzaSyB3RzIrVl0xGtmin3RMDxKhyA6eMtgWN4";

let localSeed = {};
try {
  const seedPath = fs.existsSync('./src/data/wildlifeSeed.js') ? './src/data/wildlifeSeed.js' : './artifacts/animal-x/src/data/wildlifeSeed.js';
  const mod = await import(seedPath);
  localSeed = mod.default || mod.WILDLIFE_SEED || mod;
} catch(e) {}

let allCategoriesMap = {};
let totalItemsCount = 0;

try {
  const animalsPath = fs.existsSync('./src/data/animals.js') ? './src/data/animals.js' : './artifacts/animal-x/src/data/animals.js';
  const animMod = await import(animalsPath);
  
  const rawData = animMod.ANIMALS || animMod.animals || animMod.baseNames || animMod.default || animMod;

  if (typeof rawData === 'object') {
    for (const [catName, list] of Object.entries(rawData)) {
      if (Array.isArray(list)) {
        const cleanList = list.map(item => typeof item === 'string' ? item : item.name || item.baseName).filter(Boolean);
        allCategoriesMap[catName] = cleanList;
        totalItemsCount += cleanList.length;
      }
    }
  }
} catch(e) {
  console.error("Path Error:", e.message);
}

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

async function fetchFromAI(name, category, retries = 3) {
  const isPlantOrNature = ['Trees', 'Nature', 'Mountains', 'Desert'].includes(category);
  
  const prompt = isPlantOrNature 
    ? `Provide detailed environmental/botanical stats for item "${name}" in category "${category}" in pure valid JSON format only (no markdown, no backticks):
       {
         "scientificName": "string", "weight": "N/A", "speed": "N/A",
         "height": "string", "length": "string", "lifespan": "string",
         "diet": "N/A", "habitat": "string", "conservationStatus": "string",
         "population": "string", "family": "string", "taxonomicClass": "string", "order": "string",
         "behaviour": ["string"], "humanBehaviour": ["string"], "distribution": ["string"], "threats": ["string"], "funFacts": ["string"]
       }`
    : `Provide wildlife stats for "${name}" (Category: ${category}) in pure JSON format only (no markdown, no backticks):
       {
         "scientificName": "string", "weight": "string", "speed": "string",
         "height": "string", "length": "string", "lifespan": "string",
         "diet": "string", "habitat": "string", "conservationStatus": "string",
         "population": "string", "family": "string", "taxonomicClass": "string", "order": "string",
         "behaviour": ["string"], "humanBehaviour": ["string"], "distribution": ["string"], "threats": ["string"], "funFacts": ["string"]
       }`;

  const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      
      const resData = await res.json();
      if (resData.error) {
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      let text = resData.candidates[0].content.parts[0].text.trim();
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      return JSON.parse(text);
    } catch (err) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return null;
}

async function uploadToFirestore(docId, fields) {
  const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animalDetails/${docId}?key=${FIREBASE_API_KEY}`;
  return fetch(docUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });
}

async function run() {
  console.log(`📂 Found 10 Categories: ${Object.keys(allCategoriesMap).join(', ')}`);
  console.log(`🎯 Total Items Across ALL Categories: ${totalItemsCount}\n`);

  let globalIndex = 1;

  for (const [category, items] of Object.entries(allCategoriesMap)) {
    console.log(`\n📌 === Processing Category: ${category} (${items.length} items) ===`);

    for (let i = 0; i < items.length; i++) {
      const name = items[i];
      const numericId = String(globalIndex);
      const slugId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

      let data = localSeed[name];
      let source = "LOCAL";

      if (!data) {
        data = await fetchFromAI(name, category);
        source = "AI";
        await new Promise(r => setTimeout(r, 1000));
      }

      if (!data) {
        console.log(`[${globalIndex}/${totalItemsCount}] ❌ Failed AI Gen: ${name}`);
        globalIndex++;
        continue;
      }

      if (data.taxonomicClass && !data.class) data.class = data.taxonomicClass;

      const fields = {};
      for (const [key, val] of Object.entries(data)) {
        fields[key] = formatValue(val);
      }

      try {
        await uploadToFirestore(numericId, fields);
        await uploadToFirestore(slugId, fields);
        console.log(`[${globalIndex}/${totalItemsCount}] ✅ (${category} | ${source}) Saved ID ${numericId} & ${slugId}: ${name}`);
      } catch (err) {
        console.error(`❌ Error (${name}):`, err.message);
      }

      globalIndex++;
    }
  }

  console.log("\n🎉 Mubarak ho! Saari 10 Categories ka data Firestore me upload ho gaya!");
}

run();
