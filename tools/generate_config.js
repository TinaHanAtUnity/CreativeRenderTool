const fs = require('fs');
const crypto = require('crypto');
const releases = require('./releases');

if (!process.env.INPUT) {
    throw new Error('Missing INPUT env parameter');
}
const input = process.env.INPUT;

if (!process.env.OUTPUT) {
    throw new Error('Missing OUTPUT env parameter');
}
const output = process.env.OUTPUT;

if (!process.env.BRANCH) {
    throw new Error('Missing BRANCH env parameter');
}
let branch = process.env.BRANCH;

const releaseVersion = releases.getReleaseVersion(branch);

if (releaseVersion) {
    branch = releaseVersion.webview;
}

if (!process.env.COMMIT_ID) {
    throw new Error('Missing COMMIT_ID env parameter');
}
const commitId = process.env.COMMIT_ID;

if (!process.env.TARGET) {
    throw new Error('Missing TARGET env parameter');
}
const target = process.env.TARGET;

const options = {
    encoding: 'utf-8'
};

const hasher = crypto.createHash('sha256');
hasher.update(fs.readFileSync(input, options));
const hash = hasher.digest('hex');

const url = [
    'https://webview.unityads.unity3d.com/webview',
    branch,
    commitId,
    target,
    'index.html'
].join('/');

fs.writeFileSync(output, JSON.stringify({
    url: url,
    hash: hash,
    version: commitId
}), options);

const chinaUrl = [
    'https://webview.unityads.unitychina.cn/webview',
    branch,
    commitId,
    target,
    'index.html'
].join('/');

fs.writeFileSync(output + '.cn', JSON.stringify({
    url: chinaUrl,
    hash: hash,
    version: commitId
}), options);
