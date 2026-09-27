import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

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
  const evalRef = doc(db, 'evaluations', '4-2026-上期');
  const d = await getDoc(evalRef);
  if (d.exists()) {
    const data = d.data();
    if (data.teamScore > 0) {
      console.log(`Fixing totalScore: ${data.totalScore} -> ${data.totalScore - data.teamScore}`);
      await updateDoc(evalRef, {
        teamScore: 0,
        teamDetails: [0, 0, 0],
        totalScore: data.totalScore - data.teamScore
      });
      console.log("Fixed.");
    } else {
      console.log("No teamScore to fix.");
    }
  }
  process.exit(0);
})();
