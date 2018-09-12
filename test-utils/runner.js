const fs = require('fs');
const puppeteer = require('puppeteer');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

const testUrl = process.env.TEST_URL;
const testList = process.env.TEST_LIST;
const testFilter = process.env.TEST_FILTER;

const coverage = process.env.COVERAGE;
const isolated = process.env.ISOLATED;
const debug = process.env.DEBUG;

const runTest = async (browser, isolated, testFilter) => {
    let page;
    if(!isolated) {
        const pages = await browser.pages();
        page = pages[0];
    } else {
        page = await browser.newPage();
    }

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
        await page.waitFor(1000);
        await page.evaluate(() => {
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
    return await result;
};

(async () => { try {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        devtools: debug == 1
    });
    if(isolated == 1) {
        const tests = testList.split(' ').map(testPath => path.parse(testPath).name);
        for(const test of tests) {
            const failures = await runTest(browser, isolated, test);
            if(failures) {
                process.exit(failures);
            }
        }
    } else {
        const failures = await runTest(browser, isolated, testFilter);
        if(failures) {
            process.exit(failures);
        }
    }
    await browser.close();
} catch(error) {
    console.error(error);
    process.exit(1);
}})();
