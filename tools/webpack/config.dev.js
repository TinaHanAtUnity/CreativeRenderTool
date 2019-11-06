const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./config.common');

const HtmlWebPackPlugin = require('html-webpack-plugin');

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
        new HtmlWebPackPlugin({
            template: './src/dev-index.webpack.html',
            filename: './index.html',
            inject: 'body'
        }),
    ],
};

module.exports = merge(common, development);
