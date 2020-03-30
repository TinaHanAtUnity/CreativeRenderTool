/**
 * This file is called from the jest.config.js. It's currently called from the setupFiles
 * field and is run before every test file.
 */

require('../src/ts/Ads/Utilities/__mocks__/SDKMetrics').MockMetrics();
require('child_process').execSync = jest.fn();
const canvas = require('canvas');

global.Image = canvas.Image;

if (canvas.Image.prototype.addEventListener === undefined) {
    canvas.Image.prototype.addEventListener = function(type, callback) {
        if (type === 'load') {
            this.onload = callback;
            return;
        }
        if (type === 'error') {
            this.onerror = callback;
            return;
        }
        throw new Error(`addEventListener not supported with event ${type}`);
    };
}

const createElement = document.createElement;
document.createElement = function(tagName, options){
    if (tagName === 'canvas') {
        return canvas.createCanvas(100, 100);
    }
    return createElement.apply(document, arguments);
};

global.console = { log: jest.fn() };
