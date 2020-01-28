const versionMap = require('../webview.version.map.json');

modules.exports = {
    getNativeVersions: function(branch) {
        const isReleaseBranch = (element, index, array) => {
            return element.native.includes(branch)
        };

        const releaseBranch = map.versions.find(isRelease);
        return releaseBranch ? releaseBranch.native : [];
    }
}
