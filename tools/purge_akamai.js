'use strict';

var fs = require('fs');
var path = require('path');
var akamai = require('akamai');

var akamaiUser = process.env.AKAMAI_USERNAME;
var akamaiPass = process.env.AKAMAI_PASSWORD;

var branch = process.env.TRAVIS_BRANCH;

var getBuildPaths = function(root) {
    var paths = [];
    fs.readdirSync(root).forEach(function(file) {
        var fullPath = path.join(root, file);
        if(fs.statSync(fullPath).isDirectory()) {
            paths = paths.concat(getBuildPaths(fullPath));
        } else {
            paths.push(fullPath);
        }
    });
    return paths;
};

var cdnHost = 'https://cdn.unityads.unity3d.com';
var cdnRoot = '/webview/' + branch;

var paths = getBuildPaths('build').map(function(path) {
    return cdnHost + cdnRoot + path.replace('build', '');
});

akamai.purge(akamaiUser, akamaiPass, paths, {action: 'invalidate'}).then(function(response) {
    console.dir(response);
}).catch(function(error) {
    console.dir(error);
});