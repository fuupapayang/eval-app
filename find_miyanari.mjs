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
  const staff = await getDocs(collection(db, 'staff'));
  staff.forEach(d => {
    if (d.data().name.includes('宮成')) {
      console.log("Miyanari ID:", d.id, d.data());
    }
  });
  process.exit(0);
})();
