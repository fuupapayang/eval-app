import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LIVE LOG:', msg.text()));
  page.on('pageerror', error => console.log('LIVE ERROR:', error.message));
  
  await page.goto('https://fuupapayang.github.io/eval-app/', { waitUntil: 'networkidle2' });
  
  await page.select('select.form-select', '9');
  await page.type('input[type="password"]', '123456');
  await page.click('button.btn-primary');
  
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("URL AFTER LOGIN:", page.url());
  
  const rootHtml = await page.evaluate(() => document.querySelector('#root')?.innerHTML || 'No root');
  console.log("Root content length:", rootHtml.length);
  if (rootHtml.length < 500) {
    console.log("CRASH DETECTED. HTML:", rootHtml);
  }
  
  await browser.close();
  process.exit(0);
})();
