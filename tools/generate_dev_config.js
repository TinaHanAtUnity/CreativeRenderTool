const os = require('os');
const fs = require('fs');

const ipAddress = [].concat.apply([], Object.values(os.networkInterfaces()).map(iface => iface.filter(({family, internal}) => family === 'IPv4' && !internal)))[0].address;

fs.writeFileSync('build/dev/config.json', JSON.stringify({
    url: `http://${ipAddress}:8000/build/dev/index.html`,
    hash: null
}), {
    encoding: 'utf-8'
});