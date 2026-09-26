import puppeteer from 'puppeteer';
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
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('DEV LOG:', msg.text()));
  page.on('pageerror', error => console.log('DEV ERROR:', error.message));
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  
  await page.select('select.form-select', '9');
  await page.type('input[type="password"]', '123456');
  await page.click('button.btn-primary');
  
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("URL AFTER LOGIN:", page.url());
  
  await browser.close();
  process.exit(0);
})();
