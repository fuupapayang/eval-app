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

async function run() {
  const staffSnap = await getDocs(collection(db, "staff"));
  const staff = staffSnap.docs.map(d => d.data());
  const targetNames = ["大石心菜", "井上さくら", "鶴田真美"];
  const targets = staff.filter(s => targetNames.includes(s.name));
  
  console.log("Targets:", targets);
  
  const evalSnap = await getDocs(collection(db, "evaluations"));
  const evals = evalSnap.docs.map(d => d.data());
  
  targets.forEach(t => {
    const e = evals.filter(ev => ev.staffId === t.id);
    console.log(`\nEval for ${t.name} (id: ${t.id}):`);
    console.dir(e, {depth: null});
  });
  
  process.exit(0);
}
run();
