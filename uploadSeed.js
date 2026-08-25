const { db } = require('./src/firebase.js');
const { doc, setDoc } = require('firebase/firestore');
const wildlifeSeed = require('./src/data/wildlifeSeed.js').default || require('./src/data/wildlifeSeed.js');

async function run() {
  const entries = Object.entries(wildlifeSeed);
  console.log(`🚀 Total ${entries.length} animals ka data upload ho raha hai...`);

  for (let i = 0; i < entries.length; i++) {
    const [name, data] = entries[i];
    const docId = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    if (data.taxonomicClass && !data.class) data.class = data.taxonomicClass;

    try {
      await setDoc(doc(db, 'animalDetails', docId), data, { merge: true });
      console.log(`[${i + 1}/${entries.length}] ✅ Uploaded: ${name}`);
    } catch (err) {
      console.error(`❌ Failed (${name}):`, err.message);
    }
  }
  console.log("🎉 Complete! App refresh karein.");
}
run();
