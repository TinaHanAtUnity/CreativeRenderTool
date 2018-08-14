const fs = require('fs');
const puppeteer = require('puppeteer');

if(process.argv.length < 3 || !process.argv[2]) {
    throw new Error('Missing bundle path');
}
const bundle = process.argv[2];
const coverage = process.argv[3];

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
    if(coverage) {
        page.exposeFunction('writeCoverage', (coverage) => {
            fs.writeFileSync('build/coverage/coverage.json', coverage);
        });
    }
    const result = new Promise((resolve) => {
        page.exposeFunction('result', (failures) => {
            resolve(failures);
        });
    });
    await page.goto('http://localhost:8000/src/test-index.html');
    await page.addScriptTag({
        url: bundle
    });
    page.evaluate(() => {
        mocha.run((failures) => {
            if(window.writeCoverage && __coverage__) {
                window.writeCoverage(JSON.stringify(__coverage__));
            }
            window.result(failures);
        });
    });
    console.log(await result);
    await browser.close();
})();
