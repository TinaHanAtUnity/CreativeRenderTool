const map = require('../webview.version.map.json');

module.exports = {
    // Used in generate_config.js, purge.js, and deploy.js
    // Returns the webview/native version element if found, otherwise returns undefined
    getReleaseVersion: function(branch) {
        const isReleaseBranch = (element) => {
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
