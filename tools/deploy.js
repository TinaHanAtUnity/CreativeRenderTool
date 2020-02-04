const releases = require('./releases');
const childProcess = require('child_process');

module.exports = {
    deployBranch: function (branch) {

        if (!branch) {
            throw new Error('Invalid branch: ' + branch);
        }

        let branchList = [branch];
        const releaseVersion = releases.getReleaseVersion(branch);

        if (releaseVersion) {
            branchList = releaseVersion.native;
        }

        const executeShell = (command) => {
            try {
                return childProcess.execSync(command);
            } catch (error) {
                throw new Error('Failed Deployment');
            }
        };

        return branchList.forEach(branch => {
            const result = executeShell(`( cd deploy && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-prd/webview/${branch} ) && ( cd deploy-china && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-cn-prd/webview/${branch} ) && aws s3 sync deploy s3://unityads-cdn-origin/webview/${branch}/ --acl public-read`);
            console.log(result);
        });
    }
}