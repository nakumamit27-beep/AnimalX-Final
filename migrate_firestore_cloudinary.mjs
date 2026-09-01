import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

// Auto-map animals to Cloudinary photos
const cloudImages = {
  "Lion": "https://res.cloudinary.com/x1ekanir/image/upload/v1690000000/lion.jpg",
  "Tiger": "https://res.cloudinary.com/x1ekanir/image/upload/v1690000000/tiger.jpg"
};

console.log("Syncing Cloudinary URLs to Firestore...");
