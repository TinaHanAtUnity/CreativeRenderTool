const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');
const System = require('systemjs');
const Istanbul = require('istanbul');
const jsdom = require('jsdom').jsdom;
const DOMParser = require('xmldom').DOMParser;
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const LocalStorage = require('node-localstorage').LocalStorage;
const exec = require('child_process').exec;

global.document = jsdom('');
global.window = document.defaultView;
global.DOMParser = DOMParser;
global.XMLHttpRequest = XMLHttpRequest;
global.window.localStorage = new LocalStorage('./localStorage');
global.window.sessionStorage = new LocalStorage('./sessionStorage');
global.window.exec = exec;

const coverageDir = process.env.COVERAGE_DIR;
const testFilter = process.env.TEST_FILTER;

let getSourcePaths = (root) => {
    let paths = [];
    fs.readdirSync(root).forEach((file) => {
        let fullPath = path.join(root, file);
        if (fs.statSync(fullPath).isDirectory() && fullPath.indexOf('Test') === -1) {
            paths = paths.concat(getSourcePaths(fullPath));
        } else if(fullPath.indexOf('.js') !== -1) {
            paths.push(fullPath.replace('src/ts/', '').replace('.js', ''));
        }
    });
    return paths;
};

let getTestPaths = (root, filter) => {
    let paths = [];
    fs.readdirSync(root).forEach((file) => {
        let fullPath = path.join(root, file);
        if (fs.statSync(fullPath).isDirectory() && fullPath.indexOf('Test/' + filter) !== -1) {
            paths = paths.concat(getTestPaths(fullPath, filter));
        } else if(fullPath.indexOf('.js') !== -1) {
            paths.push(fullPath.replace('src/ts/', '').replace('.js', ''));
        }
    });
    return paths;
};

System.config({
    baseURL: 'src/ts',
    map: {
        'mocha': './node_modules/mocha/mocha.js',
        'sinon': './node_modules/sinon/pkg/sinon.js',
        'chai': './node_modules/chai/chai.js',
        'text': './node_modules/systemjs-plugin-text/text.js',
        'es6-promise': './node_modules/es6-promise/dist/es6-promise.js'
    },
    meta: {
        'mocha': {
            format: 'global'
        },
        '*.html': {
            loader: 'text'
        },
        '*.xml': {
            loader: 'text'
        },
        '*.json': {
            loader: 'text'
        }
    },
    packages: {
        '.': {
            defaultExtension: 'js'
        }
    },
    paths: {
        '*.html': './src/*.html',
        '*.xml': './src/*.xml',
        '*.json': './src/*.json'
    }
});

let runner = new Mocha({
    ui: 'bdd',
    checkLeaks: true,
    fullTrace: true
});
runner.suite.emit('pre-require', global, 'global-mocha-context', runner);

if(coverageDir) {
    let instrumenter = new Istanbul.Instrumenter();

    let SystemTranslate = System.translate;
    System.translate = (load) => {
        return SystemTranslate.call(System, load).then(source => {
            if(load.address.substr(0, System.baseURL.length) !== System.baseURL) {
                return source;
            }
            if(load.address.match(/src\/ts\/Test/)) {
                return source;
            }
            return instrumenter.instrumentSync(source, 'src/ts/' + load.address.substr(System.baseURL.length));
        });
    };
}

const sourcePaths = getSourcePaths('src/ts');
const testPaths = getTestPaths('src/ts/Test', testFilter);

Promise.all(sourcePaths.concat(testPaths).map((testPath) => {
    return System.import(testPath);
})).then(() => {
    return new Promise((resolve, reject) => {
        runner.run((failures) => {
            failures ? reject(failures) : resolve();
        });
    });
}).then(() => {
    if(coverageDir) {
        fs.writeFileSync(coverageDir + '/coverage.json', JSON.stringify(__coverage__));
    }
}).catch(console.error.bind(console));
