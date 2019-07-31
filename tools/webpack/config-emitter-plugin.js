const os = require('os');
const crypto = require('crypto');

class ConfigEmiterPlugin {
    constructor(options) {
        this.options = options;
    }

    getExternalIP() {
        const ifaces = Array.prototype.slice.apply(Object.values(os.networkInterfaces())).flat();
        return ifaces.find(i => !i.internal && i.family === 'IPv4').address;
    }

    hashAsset(asset) {
        const hash = crypto.createHash('sha256');
        hash.update(asset.source());
        return hash.digest('hex');
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync('CompilerEmitterPluginHooks', (compilation, callback) => {
            const config = {
                url: `http://${this.getExternalIP()}:8000/index.html`,
                hash: null
            };

            if (this.options.hash) {
                const asset = this.getIndexHtmlAsset(compilation.assets);
                config.hash = this.hashAsset(asset);
            }

            const configJson = JSON.stringify(config);
            compilation.assets['config.json'] = {
                source: () => configJson,
                size: () => configJson.length,
            };

            callback();
        });
    }

    getIndexHtmlAsset(assetDb) {
        const key = Object.keys(assetDb).find((k) => k.match(/index\.html/));
        return assetDb[key];
    }
}

module.exports = ConfigEmiterPlugin;
