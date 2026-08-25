import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = "AIzaSyAzy-9s_Po-MjRemxeDi3pCCp7f4AVfuSg";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const PROJECT_ID = "happy-fd1bc";
const API_KEY = "AIzaSyB3RzIrVl0xGtmin3RMDxKhyA6eMtgWN4";

// 1. Load Local Seed to avoid unnecessary AI calls for the first 79
let localSeed = {};
try {
  const seedPath = fs.existsSync('./src/data/wildlifeSeed.js') ? './src/data/wildlifeSeed.js' : './artifacts/animal-x/src/data/wildlifeSeed.js';
  const mod = await import(seedPath);
  localSeed = mod.default || mod.WILDLIFE_SEED || mod;
} catch(e) {}

// 2. Load Full Animals List (1440)
let animalsList = [];
try {
  const animalsPath = fs.existsSync('./src/data/animals.js') ? './src/data/animals.js' : './artifacts/animal-x/src/data/animals.js';
  const animMod = await import(animalsPath);
  const baseNames = animMod.baseNames || animMod.default || animMod;
  
  const exclude = ['Nature', 'Mountains', 'Sea', 'Desert', 'Trees'];
  for (const [cat, list] of Object.entries(baseNames)) {
    if (!exclude.includes(cat) && Array.isArray(list)) {
      animalsList.push(...list);
    }
  }
  animalsList = [...new Set(animalsList)];
} catch(e) {
  console.error("❌ Animals list load fail:", e.message);
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

async function fetchFromAI(name) {
  const prompt = `Provide precise wildlife stats for animal "${name}" in pure valid JSON format only (no markdown, no backticks):
  {
    "scientificName": "string", "weight": "string", "speed": "string",
    "height": "string", "length": "string", "lifespan": "string",
    "diet": "string", "habitat": "string", "conservationStatus": "string",
    "population": "string", "family": "string", "taxonomicClass": "string", "order": "string",
    "behaviour": ["string"], "humanBehaviour": ["string"], "distribution": ["string"], "threats": ["string"], "funFacts": ["string"]
  }`;
  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
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
  console.log(`🚀 Starting Full 1440 Seeding via Local Seed & Gemini AI...\n`);

  for (let i = 0; i < animalsList.length; i++) {
    const name = animalsList[i];
    const numericId = String(i + 1);
    const slugId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    let data = localSeed[name];
    let source = "LOCAL";

    if (!data) {
      data = await fetchFromAI(name);
      source = "AI";
      await new Promise(r => setTimeout(r, 800)); // Delay to prevent API rate limits
    }

    if (!data) {
      console.log(`[${i + 1}/${animalsList.length}] ⚠️ Skipped AI generation for: ${name}`);
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

  console.log("\n🎉 Mubarak ho! Saare 1440 Animals ka data Numeric ID + Slugs me fill ho gaya hai!");
}

run();
