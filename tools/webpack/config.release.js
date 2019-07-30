const path = require('path');
const merge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const HtmlWebPackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const common = require('./config.common');

const runBundleAnalyzer = process.env.ANALYZE !== undefined;

const plugins = [
    new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[name].[contenthash].css',
    }),
    new HtmlWebPackPlugin({
        template: './src/prod-index.html',
        filename: './index.html',
        inject: 'body',
        inlineSource: '.(js|css)$',
    }),
    new HtmlWebpackInlineSourcePlugin()
    // runBundleAnalyzer && new BundleAnalyzerPlugin(),
].filter(truthy => truthy);

const production = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        app: [
            '@babel/polyfill',
            path.join(process.cwd(), './src/ts/Device.ts'),
        ],
    },
    output: {
        filename: '[name].[hash:8].js',
        publicPath: '/',
        path: path.resolve(process.cwd(), './dist'),
    },
    module: {
        // rules: [
        //     {
        //         test: /\.js$/,
        //         exclude: [/node_modules/, /dist/],
        //         use: [
        //             { loader: 'eslint-loader' },
        //         ],
        //         enforce: 'pre',
        //     },
        // ],
    },
    plugins,
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'initial',
                },
            },
        },
    },
    stats: 'errors-only',
};

module.exports = merge(common, production);
