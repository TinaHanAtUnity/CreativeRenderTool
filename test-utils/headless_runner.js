const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    page.on('console', (message) => {
        let type = message.type();
        switch(type) {
            case 'startGroup':
            case 'startGroupCollapsed':
                type = 'group';
                break;

            case 'endGroup':
                type = 'groupEnd';
                break;

            default:
                break;
        }
        if(type in console) {
            console[type](message.text());
        } else {
            console.dir(message);
        }
    });
    const result = new Promise((resolve) => {
        page.exposeFunction('result', (failures) => {
            resolve(failures);
        });
    });
    page.on('domcontentloaded', () => {
        page.evaluate(() => {
            mocha.run(window.result);
        });
    });
    await page.goto('http://localhost:8000/src/test-index.html');
    console.log(await result);
    await browser.close();
})();
