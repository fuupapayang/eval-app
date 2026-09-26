import fs from 'fs';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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
  const evalDocs = await getDocs(collection(db, 'evaluations'));
  const evaluations = evalDocs.docs.map(d => d.data());
  
  let count = 0;
  for (const ev of evaluations) {
    if (ev.period === '上期') {
      try {
        await updateDoc(doc(db, 'evaluations', ev.id), {
          generalComment: ev.generalComment ? ev.generalComment + "\n\n頑張っていきましょう" : "頑張っていきましょう"
        });
        console.log(`Updated upper eval for ${ev.staffId}`);
        count++;
      } catch (e) {
        console.error(`Error updating ${ev.id}:`, e);
      }
    }
  }
  console.log(`Finished updating ${count} upper term evaluations.`);
  process.exit(0);
}

main();
