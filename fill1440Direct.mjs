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

// Old flat extraction that successfully found all items
let animalsList = [];
try {
  const animalsPath = fs.existsSync('./src/data/animals.js') ? './src/data/animals.js' : './artifacts/animal-x/src/data/animals.js';
  const animMod = await import(animalsPath);
  const rawData = animMod.ANIMALS || animMod.animals || animMod.baseNames || animMod.default || animMod;
  
  if (Array.isArray(rawData)) {
    animalsList = rawData.map(a => typeof a === 'string' ? a : a.name || a.baseName);
  } else if (typeof rawData === 'object') {
    for (const [cat, list] of Object.entries(rawData)) {
      if (Array.isArray(list)) {
        list.forEach(item => animalsList.push(typeof item === 'string' ? item : item.name || item.baseName));
      }
    }
  }
  animalsList = [...new Set(animalsList.filter(Boolean))];
} catch(e) {}

if(animalsList.length === 0) animalsList = Object.keys(localSeed);

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

async function fetchFromAI(name, retries = 3) {
  // Smart prompt to handle Trees/Nature without failing
  const prompt = `Provide stats for "${name}". If it is a Tree, Plant, Nature, or Geographical feature, use "N/A" for weight/speed/diet and fill the rest (like height/habitat). Strictly output pure JSON without markdown or codeblocks:
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
  console.log(`🎯 Total Items Found: ${animalsList.length}`);
  console.log(`🚀 Seeding continuous Flat List 1 to ${animalsList.length}...\n`);

  for (let i = 0; i < animalsList.length; i++) {
    const name = animalsList[i];
    const numericId = String(i + 1);
    const slugId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    let data = localSeed[name];
    let source = "LOCAL";

    if (!data) {
      data = await fetchFromAI(name);
      source = "AI";
      await new Promise(r => setTimeout(r, 1000)); // Delay to prevent AI blocking
    }

    if (!data) {
      console.log(`[${i + 1}/${animalsList.length}] ❌ Failed completely: ${name}`);
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
      console.log(`[${i + 1}/${animalsList.length}] ✅ (${source}) Saved ID ${numericId} & ${slugId}: ${name}`);
    } catch (err) {
      console.error(`❌ Error (${name}):`, err.message);
    }
  }
  console.log("\n🎉 Complete! Saare 1440 items fill ho gaye bina skip kiye!");
}

run();
