const puppeteer = require('puppeteer');

puppeteer.launch().then(async browser => {
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/build/browser/index.html?headless=1');
    page.on('console', (asd) => {
        console.log('asd');
        console.dir(asd);
    });
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await browser.close();
});
