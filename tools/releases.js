const map = require('../webview.version.map.json');

module.exports = {
    // Used in purge.js and deploy.js
    // Returns an array of supported native versions for the input branch, otherwise returns the input as a single element array
    getSupportedNativeVersions: function(branch) {
        const isReleaseBranch = (element) => {
            return element.native.includes(branch);
        };

        const foundElement = map.versions.find(isReleaseBranch);
        return foundElement ? foundElement.native : [branch];
    },
    // Used in generate_config.js
    // Returns a string representing the supporting webview version for the input branch, otherwise returns the input
    getSupportedWebviewVersion: function(branch) {
        const isReleaseBranch = (element) => {
            return element.native.includes(branch);
        };

        const foundElement = map.versions.find(isReleaseBranch);
        return foundElement ? foundElement.webview : branch;
    },
    // Currently Unused 
    // Will be used in deployment scripts to get all supported webview release versions
    getAllSupportedWebviewVersions: function() {
        const webviewVersions = [];
        map.versions.forEach((element) => {
            if (element.webview !== 'development') {
                webviewVersions.push(element.webview);
            }
        });
        return webviewVersions;
    }
};
