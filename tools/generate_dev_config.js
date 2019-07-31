const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const generateConfig = (configFile, htmlFile) => {
    if (htmlFile) {
        return sha256HashFile(htmlFile).then((hash) => writeConfig(configFile, hash));
    }
    return writeConfig(configFile, null);
};

const writeConfig = (path, hash) => {
    return fs.promises.writeFile(path, JSON.stringify({
        url: `http://${getExternalIP()}:8000/dist/index.html`,
        hash: hash
    }));
};

const getExternalIP = () => {
    const ifaces = Array.prototype.slice.apply(Object.values(os.networkInterfaces())).flat();
    return ifaces.find(i => !i.internal && i.family === 'IPv4').address;
};

const sha256HashFile = (file) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const fileStream = fs.ReadStream(file);
        fileStream.on('error', reject);
        fileStream.on('data', chunk => hash.update(chunk));
        fileStream.on('end', () => {
            resolve(hash.digest('hex'));
        });
    });
};

module.exports = generateConfig;
