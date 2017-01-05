if(!process.env.AWS_KEY) {
    throw new Error('Missing AWS_KEY env variable');
}

if(!process.env.AWS_SECRET) {
    throw new Error('Missing AWS_SECRET env variable');
}

if(!process.env.BRANCH) {
    throw new Error('Missing BRANCH env parameter');
}
let branch = process.env.BRANCH;
if(branch === '2.0.6') {
    branch = 'master';
} else if(branch === 'master') {
    branch = 'development';
}

const http = require('http');
const https = require('https');
http.globalAgent.maxSockets = https.globalAgent.maxSockets = 20;

const s3 = require('s3');
const client = s3.createClient({
    s3Options: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
        region: 'us-east-1'
    }
});

const upload = (prefix) => {
    return new Promise((resolve, reject) => {
        const uploader = client.uploadDir({
            localDir: 'build',
            s3Params: {
                Prefix: prefix,
                Bucket: 'unityads-cdn-origin'
            }
        });
        uploader.on('end', () => {
            resolve();
        });
        uploader.on('error', (error) => {
            reject(error);
        });
        uploader.on('fileUploadStart', function() {
            console.dir(arguments);
        });
    });
};

upload(['webview', branch, ''].join('/'));


