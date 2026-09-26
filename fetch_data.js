import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
  const staffDocs = await getDocs(collection(db, 'staff'));
  const staffList = staffDocs.docs.map(d => d.data());
  
  const evalDocs = await getDocs(collection(db, 'evaluations'));
  const evaluations = evalDocs.docs.map(d => d.data());

  console.log(JSON.stringify({ staffList, evaluations }));
  process.exit(0);
}

main();
