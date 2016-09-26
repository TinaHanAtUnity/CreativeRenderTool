'use strict';

var fs = require('fs');
var path = require('path');
var akamai = require('akamai');

var akamaiUser = process.env.AKAMAI_USERNAME;
var akamaiPass = process.env.AKAMAI_PASSWORD;

var branch = process.env.TRAVIS_BRANCH;
if(!branch) {
    throw new Error('Invalid branch: ' + branch);
}
var commit = process.env.TRAVIS_COMMIT;
if(!commit) {
    throw new Error('Invalid commit: ' + commit);
}

var getBuildPaths = function(root) {
    var paths = [];
    fs.readdirSync(root).forEach(function(file) {
        var fullPath = path.join(root, file);
        if(fullPath.indexOf(commit) === -1) {
            if(fs.statSync(fullPath).isDirectory()) {
                paths = paths.concat(getBuildPaths(fullPath));
            } else {
                paths.push(fullPath);
            }
        }
    });
    return paths;
};

var cdnConfigHost = 'https://config.unityads.unity3d.com';
var cdnWebViewHost = 'https://webview.unityads.unity3d.com';
var cdnRoot = '/webview/' + branch;

var pickHost = function(path) {
    if(path.match(/config\.json/)) {
        return cdnConfigHost;
    }
    return cdnWebViewHost;
};

var paths = getBuildPaths('build').map(function(path) {
    return pickHost(path) + cdnRoot + path.replace('build', '');
});

console.log('Starting Akamai purge of: ');
console.dir(paths);
akamai.purge(akamaiUser, akamaiPass, paths, {action: 'invalidate'}).then(function(response) {
    console.log('Progress URI: ' + response.progressUri);
    console.log('Estimated seconds until completion: ' + response.estimatedSeconds);
    var pingStatus = function() {
        response.status().then(function(status) {
            if(!status.completionTime) {
                console.log('Status: ' + status.purgeStatus);
                setTimeout(pingStatus, status.pingAfterSeconds * 1000);
            } else {
                console.log('Purge complete, took ' + (new Date(status.completionTime) - new Date(status.submissionTime)) / 1000 + ' seconds.');
            }
        }).catch(function(error) {
            console.dir(error);
        });
    };
    pingStatus();
}).catch(function(error) {
    console.dir(error);
});
