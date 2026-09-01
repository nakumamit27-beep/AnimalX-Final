import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import v2 from 'cloudinary';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cloudinary = v2.v2;
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrateCollection(collName, urlField) {
  console.log(`Starting migration for ${collName}...`);
  const querySnapshot = await getDocs(collection(db, collName));
  
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    const currentUrl = data[urlField];

    if (currentUrl && !currentUrl.includes('cloudinary.com')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(currentUrl, {
          resource_type: "auto",
          folder: "wildlife_app"
        });
        await updateDoc(doc(db, collName, docSnap.id), {
          [urlField]: uploadRes.secure_url
        });
        console.log(`Uploaded & Updated: ${uploadRes.secure_url}`);
      } catch (err) {
        console.error(`Failed for ID ${docSnap.id}:`, err.message);
      }
    }
  }
}

async function start() {
  await migrateCollection('animals', 'imageUrl');
  await migrateCollection('reels', 'videoUrl');
  console.log("Migration finished completely!");
}

start();
