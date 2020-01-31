const releases = require('./releases');
const childProcess = require('child_process');

let branch = process.env.TRAVIS_BRANCH;
if (!branch) {
    throw new Error('Invalid branch: ' + branch);
}

let branchList = [branch];
const releaseVersion = releases.getReleaseVersion(branch);

if (releaseVersion) {
    branchList = releaseVersion.native;
}

const executeShell = (command) => {
    childProcess.execSync(command, (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (stdout) {
            throw new Error('Failed deployment');
        }
    });
};

return branchList.forEach(branch => {
    executeShell(`( cd deploy && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-prd/webview/${branch} )`);
    executeShell(`( cd deploy-china && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-cn-prd/webview/${branch} )`);
    executeShell(`aws s3 sync deploy s3://unityads-cdn-origin/webview/${branch}/ --acl public-read`);    
});
