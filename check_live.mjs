import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LIVE LOG:', msg.text()));
  page.on('pageerror', error => console.log('LIVE ERROR:', error.message));
  
  await page.goto('https://fuupapayang.github.io/eval-app/', { waitUntil: 'networkidle2' });
  
  // Try logging in with wrong password
  await page.select('select.form-select', '1779350018387'); // テスト太郎
  await page.type('input[type="password"]', 'wrongpassword');
  await page.click('button.btn-primary');
  
  await new Promise(r => setTimeout(r, 1000));
  const errText = await page.evaluate(() => document.body.innerText);
  if (errText.includes('スタッフパスワードが間違っています。')) {
    console.log("Wrong password error is correctly displayed.");
  }
  
  // Now login with correct password
  // Clear the input field first
  await page.evaluate(() => document.querySelector('input[type="password"]').value = '');
  await page.type('input[type="password"]', '111');
  await page.click('button.btn-primary');
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("URL AFTER LOGIN:", page.url());
  const rootHtml = await page.evaluate(() => document.querySelector('#root')?.innerHTML || 'No root');
  console.log("Root content length:", rootHtml.length);
  
  await page.screenshot({ path: 'live_mypage.png' });
  
  await browser.close();
  process.exit(0);
})();
