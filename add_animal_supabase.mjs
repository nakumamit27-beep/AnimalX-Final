import readline from 'readline';

const PROJECT_ID = 'happy-fd1bc';
// Apne Supabase Credentials yahan update karein (agar alag hain)
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise(res => rl.question(q, res));

// Direct File Upload to Supabase Storage Bucket via REST API
async function uploadToSupabase(filePathOrUrl) {
  const fileName = `animal_${Date.now()}.jpg`;
  
  // Fetch image bytes
  const imageRes = await fetch(filePathOrUrl);
  const blob = await imageRes.arrayBuffer();

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/animal-media/${fileName}`;
  
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'image/jpeg'
    },
    body: blob
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase Upload Error: ${err}`);
  }

  // Return Public URL
  return `${SUPABASE_URL}/storage/v1/object/public/animal-media/${fileName}`;
}

// Write to Firestore DB
async function saveToFirestore(fieldsObj) {
  const formattedFields = {};
  for (const [key, val] of Object.entries(fieldsObj)) {
    formattedFields[key] = { stringValue: String(val) };
  }

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/animals`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: formattedFields })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore Error: ${errText}`);
  }
}

async function main() {
  console.log("\n=========================================");
  console.log("🦁 SUPABASE -> FIRESTORE ANIMAL UPLOADER");
  console.log("=========================================\n");

  try {
    const name = await ask("Animal Name (e.g. Spirit Lion): ");
    const category = await ask("Category (Mammals/Birds/etc.): ");
    const photoSource = await ask("Photo Direct Link / Local Path: ");
    const habits = await ask("Habits/Habitat: ");
    const lifespan = await ask("Lifespan: ");
    const country = await ask("Country/Region: ");

    console.log("\n⏳ Uploading photo directly to Supabase Bucket ('animal-media')...");
    const supabasePublicUrl = await uploadToSupabase(photoSource);
    console.log(`✅ Supabase Public Link Generated: ${supabasePublicUrl}`);

    console.log("⏳ Saving animal details to Firestore DB...");
    await saveToFirestore({
      name,
      category,
      image: supabasePublicUrl,
      habits,
      lifespan,
      country,
      createdAt: new Date().toISOString()
    });

    console.log("\n=========================================");
    console.log(`🎉 SUCCESS! '${name}' added with Supabase photo & Firestore entry!`);
    console.log("=========================================\n");
  } catch (err) {
    console.error("\n❌ Error:", err.message);
  } finally {
    rl.close();
  }
}

main();
