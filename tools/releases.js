const map = require('../webview.version.map.json');

module.exports = {
    /**
     * Used in purge.js and deploy.js
     * Returns an array of all native versions supported by the input branch.
     * If there are no additional supported versions, the branch is returned as a single element in an array
     */
    getNativeVersionsSupportedByBranch: function(branch) {
        const isReleaseBranch = (element) => {
            return element.native.includes(branch);
        };

        const foundElement = map.versions.find(isReleaseBranch);
        return foundElement ? foundElement.native : [branch];
    },

    /**
     * Used in generate_config.js
     * Returns a string of the translated webview version for the input branch if it exists
     * If a translated version of the branch does not exist, then the input branch is returned
     */
    getTranslatedWebviewReleaseVersion: function(branch) {
        const isReleaseBranch = (element) => {
            return element.native.includes(branch);
        };

        const foundElement = map.versions.find(isReleaseBranch);
        return foundElement ? foundElement.webview : branch;
    },

    /**
     * Currently unused 
     * Will be used in deployment scripts to get all supported webview release versions
     */
    getAllReleasedWebviewVersions: function() {
        const webviewVersions = [];
        map.versions.forEach((element) => {
            if (element.webview !== 'development') {
                webviewVersions.push(element.webview);
            }
        });
        return webviewVersions;
    }
};
