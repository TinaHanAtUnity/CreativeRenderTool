const fs = require('fs');
const path = require('path');
const Mocha = require('mocha');
const System = require('systemjs');
const Istanbul = require('istanbul');
const jsdom = require('jsdom').jsdom;

global.document = jsdom('');
global.window = document.defaultView;

let getPaths = (root) => {
    let paths = [];
    fs.readdirSync(root).forEach((file) => {
        let fullPath = path.join(root, file);
        if (fs.statSync(fullPath).isDirectory()) {
            paths = paths.concat(getPaths(fullPath));
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
        'xmldom': './node_modules/xmldom/dom-parser.js',
        'es6-promise': './node_modules/es6-promise/dist/es6-promise.js'
    },
    meta: {
        'mocha': {
            format: 'global'
        },
        '*.html': {
            loader: 'text'
        }
    },
    packages: {
        '.': {
            defaultExtension: 'js'
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

Promise.all(getPaths('src/ts').map((testPath) => {
    return System.import(testPath);
})).then(() => {
    return new Promise((resolve, reject) => {
        runner.run((failures) => {
            failures ? reject(failures) : resolve();
        });
    });
}).then(() => {
    fs.mkdirSync(process.env.COVERAGE_DIR);
    fs.writeFileSync(process.env.COVERAGE_DIR + '/coverage.json', JSON.stringify(__coverage__));
}).catch(console.error.bind(console));
