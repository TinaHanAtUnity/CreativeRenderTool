const release = require('./config.release.js');
const merge = require('webpack-merge');
const ConfigEmitterPlugin = require('./config-emitter-plugin');

const server = {
    plugins: [
        new ConfigEmitterPlugin({
            hash: true
        })
    ]
};

module.exports = merge(release, server);
