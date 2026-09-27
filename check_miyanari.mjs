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

(async () => {
  const staffDocs = await getDocs(collection(db, 'staff'));
  let miyanari = null;
  staffDocs.forEach(doc => {
    const data = doc.data();
    if (data.name && data.name.includes('宮成')) {
      miyanari = data;
    }
  });
  
  if (miyanari) {
    console.log("Found Miyanari:", JSON.stringify(miyanari, null, 2));
    
    // Get evaluations for this staff
    const evalDocs = await getDocs(collection(db, 'evaluations'));
    const evals = [];
    evalDocs.forEach(doc => {
      const data = doc.data();
      if (data.staffId === miyanari.id) {
        evals.push(data);
      }
    });
    
    console.log("Evaluations:", JSON.stringify(evals, null, 2));
  } else {
    console.log("Miyanari not found!");
  }
  process.exit(0);
})();
