const path = require('path');
const generateDevConfig = require('../generate_dev_config');

class ConfigEmiterPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.done.tapAsync('ConfigEmitterPluginHooks', (stats, cb) => {
            const configPath = path.join(stats.compilation.outputOptions.path, 'config.json');
            const htmlPath = !!this.options.hash ? path.join(stats.compilation.outputOptions.path, 'index.html') : null;
            generateDevConfig(configPath, htmlPath).finally(cb);
        });
    }
}

module.exports = ConfigEmiterPlugin;
