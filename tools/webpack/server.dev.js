const release = require('./config.dev.js');
const merge = require('webpack-merge');
const ConfigEmitterPlugin = require('./config-emitter-plugin');

const server = {
    plugins: [
        new ConfigEmitterPlugin({
            hash: false
        })
    ]
};

module.exports = merge(release, server);
