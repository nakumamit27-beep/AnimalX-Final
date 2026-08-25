import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import wildlifeSeed from './src/data/wildlifeSeed.js';

const firebaseConfig = {
  apiKey: "AIzaSyB3RzIrVl0xGtmin3RMDxKhyA6eMtgWN4",
  authDomain: "happy-fd1bc.firebaseapp.com",
  projectId: "happy-fd1bc",
  storageBucket: "happy-fd1bc.appspot.com",
  messagingSenderId: "426245078000",
  appId: "1:426245078000:web:d94566ffb8a7230385bb35"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const dataMap = wildlifeSeed.default || wildlifeSeed;
  const entries = Object.entries(dataMap);
  console.log(`🚀 Total ${entries.length} animals upload ho rahe hain...`);

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
  console.log("🎉 Firestore successfully update ho gaya!");
}
run();
