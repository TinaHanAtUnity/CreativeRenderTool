const puppeteer = require('puppeteer');

const SERVER_ADDRESS = 'http://localhost:8000/build/browser/index.html?headless=1';
const SCREEN_VIEWPORT_PROP = {width: 1024, height: 1280};

puppeteer.launch().then(async browser => {
    console.log('Start test');
    const page = await browser.newPage();
    await page.setViewport(SCREEN_VIEWPORT_PROP);
    await page.goto(SERVER_ADDRESS);
    console.log('Page loaded');
    page.on('console', (message) => {
        console.dir(message);
    });
    await new Promise((resolve) => setTimeout(resolve, 1000))
        .then(() => {
            return page.screenshot({path: 'browserbuild.png'});
    });

    await browser.close();
});
