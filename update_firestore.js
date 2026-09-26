import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0FuAoiaxeIvkjxtDLcF8_kyEOSn8xFtw",
  authDomain: "photo-selector-db.firebaseapp.com",
  projectId: "photo-selector-db",
  storageBucket: "photo-selector-db.firebasestorage.app",
  messagingSenderId: "989879732142",
  appId: "1:989879732142:web:7b57634827a8b683c8aa3f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const updates = JSON.parse(fs.readFileSync('updates.json', 'utf8'));
  for (const update of updates) {
    const { id, ...data } = update;
    try {
      await updateDoc(doc(db, 'evaluations', id), data);
      console.log(`Updated evaluation ${id}`);
    } catch(e) {
      console.error(`Error updating ${id}:`, e);
    }
  }
  process.exit(0);
}

main();
