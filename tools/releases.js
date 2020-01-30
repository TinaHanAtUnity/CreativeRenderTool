const map = require('../webview.version.map.json');

module.exports = {
    // Used in generate_config.js, purge.js, and deploy.js
    // Returns true if the input branch exists as an element in the native versions
    getReleaseVersion: function(branch) {
        const isReleaseBranch = (element, index, array) => {
            return element.native.includes(branch);
        };

        return map.versions.find(isReleaseBranch);
    },
    // Will be used in deployment scripts to get the supported webview versions
    getWebviewVersions: function() {
        const webviewVersions = [];
        map.versions.forEach((element) => {
            if (element.webview !== 'development') {
                webviewVersions.push(element.webview);
            }
        });
        return webviewVersions;
    }
};
