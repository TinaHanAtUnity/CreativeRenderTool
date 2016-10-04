const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');
const System = require('systemjs');
const jsdom = require('jsdom').jsdom;

global.document = jsdom('');
global.window = document.defaultView;

let getTestPaths = (root) => {
    let paths = [];
    fs.readdirSync(root).forEach((file) => {
        let fullPath = path.join(root, file);
        if (fs.statSync(fullPath).isDirectory()) {
            paths = paths.concat(getTestPaths(fullPath));
        } else if(fullPath.indexOf('Test.js') !== -1) {
            paths.push(fullPath.replace('src/ts/', '').replace('.js', ''));
        }
    });
    return paths;
};

System.config({
    baseURL: 'src/ts',
    defaultJSExtensions: true,
    map: {
        'mocha': './node_modules/mocha/mocha.js',
        'sinon': './node_modules/sinon/pkg/sinon.js',
        'chai': './node_modules/chai/chai.js',
        'text': './node_modules/systemjs-plugin-text/text.js',
        'xmldom': './node_modules/xmldom/dom-parser.js'
    },
    meta: {
        'mocha': {
            format: 'global'
        }
    },
    paths: {
        '*.html': './src/html/*.html'
    }
});

let runner = new Mocha({
    ui: 'bdd'
});
runner.suite.emit('pre-require', global, 'global-mocha-context', runner);

Promise.all(getTestPaths('src/ts/Test').map((testPath) => {
    return System.import(testPath);
})).then(() => {
    return new Promise((resolve, reject) => {
        runner.run((failures) => {
            failures ? reject(failures) : resolve();
        });
    });
}).catch(console.error.bind(console));
