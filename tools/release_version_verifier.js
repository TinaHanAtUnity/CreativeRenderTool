const map = require('../webview.version.map.json');

module.exports = {
    getReleaseVersion: function(branch) {
        const isReleaseBranch = (element, index, array) => {
            return element.native.includes(branch);
        };

        return map.versions.find(isReleaseBranch);
    }
};
