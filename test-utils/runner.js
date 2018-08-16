const fs = require('fs');
const puppeteer = require('puppeteer');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

if(process.argv.length < 3 || !process.argv[2]) {
    throw new Error('Missing test URL');
}
const testUrl = process.argv[2];
const coverage = process.argv[3];

const debug = process.env.DEBUG;
const testFilter = process.env.TEST_FILTER;

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        devtools: !!debug
    });
    const page = await browser.newPage();

    page.on('console', (message) => {
        let type = message.type();
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

    page.exposeFunction('exec', async (command) => {
        return await exec(command);
    });

    const result = new Promise((resolve) => {
        page.exposeFunction('result', (failures) => {
            resolve(failures);
        });
    });

    await page.goto(testUrl + (testFilter ? '?grep=' + testFilter : ''), {
        waitUntil: 'domcontentloaded'
    });

    if(debug) {
        page.waitFor(1000);
        page.evaluate(() => {
            debugger;
        });
    }
    await page.evaluate(() => {
        mocha.run((failures) => {
            if(window.writeCoverage && __coverage__) {
                window.writeCoverage(JSON.stringify(__coverage__));
            }
            window.result(failures);
        });
    });
    const failures = await result;
    await browser.close();
    if(failures) {
        process.exit(failures);
    }
})();
