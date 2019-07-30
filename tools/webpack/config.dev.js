const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./config.common');
const fs = require('fs');
const os = require('os');

const HtmlWebPackPlugin = require('html-webpack-plugin');

const getExternalIP = () => {
    const ifaces = Array.prototype.slice.apply(Object.values(os.networkInterfaces())).flat();
    return ifaces.find(i => !i.internal && i.family === 'IPv4').address;
};

class ConfigEmiterPlugin {
    constructor() {
        // Do nothing.
    }

    apply(compiler) {
        compiler.hooks.done.tapAsync('ConfigEmitterPluginHooks', (stats, cb) => {
            const fileName = path.join(stats.compilation.outputOptions.path, 'config.json');
            const ip = getExternalIP();

            fs.promises.mkdir(stats.compilation.outputOptions.path)
            .catch(_ => {})
            .then(() => {
                return fs.promises.writeFile(fileName, JSON.stringify({
                    url: `http://${ip}:8000/index.html`,
                    hash: null
                }));
            })
            .catch(console.error)
            .finally(cb);
        });
    }
}

const development = {
    mode: 'development',
    devtool: 'cheap-module-inline-source-map',
    entry: {
        app: [
            '@babel/polyfill',
            path.join(process.cwd(), './src/ts/Device.ts'),
        ],
    },
    output: {
        publicPath: '/',
        path: path.resolve(process.cwd(), './dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /dist/],
                use: [
                    {loader: 'eslint-loader', options: {emitWarning: true}},
                ],
                enforce: 'pre',
            },
        ],
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new ConfigEmiterPlugin(),
        new HtmlWebPackPlugin({
            template: './src/dev-index.html',
            filename: './index.html',
            inject: 'body'
        }),
    ],
};

module.exports = merge(common, development);
