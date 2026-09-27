import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
  const d = await getDoc(doc(db, 'evaluations', '4-2026-上期'));
  if (d.exists()) {
    console.log("Team Texts:", d.data().teamTexts);
    console.log("Team Score:", d.data().teamScore);
  } else {
    console.log("No eval for Suzuki");
  }
  process.exit(0);
})();
