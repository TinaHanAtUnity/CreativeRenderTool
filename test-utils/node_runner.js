const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');
const System = require('systemjs');
const Istanbul = require('istanbul');
const { JSDOM } = require('jsdom');
const DOMParser = require('xmldom').DOMParser;
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const LocalStorage = require('node-localstorage').LocalStorage;
const exec = require('child_process').exec;
const spawn = require('child_process').spawnSync;

const { document } = new JSDOM('').window;

class CustomDOMParser {
    parseFromString(markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            return new JSDOM(markup).window.document;
        } else {
            return DOMParser.prototype.parseFromString.apply(new DOMParser(), arguments);
        }
    };
}

global.document = document;
global.window = document.defaultView;
global.HTMLElement = global.window.HTMLElement;
global.DOMParser = CustomDOMParser;
global.XMLHttpRequest = XMLHttpRequest;
global.window.localStorage = new LocalStorage('./localStorage');
global.window.sessionStorage = new LocalStorage('./sessionStorage');
global.window.exec = exec;
global.navigator = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Mobile/14F89'
}

const coverageDir = process.env.COVERAGE_DIR;
const testFilter = process.env.TEST_FILTER;
const isolated = process.env.ISOLATED;

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
        if (fs.statSync(fullPath).isDirectory()) {
            paths = paths.concat(getTestPaths(fullPath, filter));
        } else if(fullPath.match(filter) && fullPath.indexOf('.js') !== -1) {
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
        'es6-promise': './node_modules/es6-promise/dist/es6-promise.auto.js',
        'null': './test-utils/null-plugin.js',
        'long': './node_modules/protobufjs/node_modules/long/dist/long.js',
        'protobufjs/minimal': './node_modules/protobufjs/dist/minimal/protobuf.js'
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
        },
        '*.css': {
            loader: 'null'
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
        '*.json': './src/*.json',
        '*.css': './src/*.css'
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
            if(load.address.match(/src\/ts\/Native\/Backend/)) {
                return source;
            }
            return instrumenter.instrumentSync(source, 'src/ts/' + load.address.substr(System.baseURL.length));
        });
    };
}

process.on('unhandledRejection', (error, promise) => {
    console.error(error);
    process.exit(1);
});

const sourcePaths = getSourcePaths('src/ts');
const testPaths = getTestPaths('src/ts/Test', testFilter);

if(isolated) {
    testPaths.forEach((testPath) => {
        let env = process.env;
        delete env.ISOLATED;
        env.TEST_FILTER = testPath;

        const test = spawn('node', ['test-utils/node_runner.js'], {
            cwd: process.cwd(),
            env: env,
            stdio: 'inherit'
        });

        if(test.status !== 0) {
            if(test.error) {
                console.error(error);
            }
            process.exit(test.status);
        }
    });
} else {
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
    }).catch(error => {
        console.error(error);
        process.exit(1);
    });
}
