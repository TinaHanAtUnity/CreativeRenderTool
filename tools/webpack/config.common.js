const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const isReleaseBuild = process.env.NODE_ENV === 'production';

const postCssLoaderOptions = {
        ident: 'postcss',
        plugins: () => ([
        autoprefixer({
            browsers: ['last 10 versions'],
        }),
    ]),
};

module.exports = {
    resolve: {
        plugins: [
            new TsconfigPathsPlugin({}),
        ],
        extensions: [
            '.ts',
            '.js',
            '.html',
            '.json',
            '.xml',
            '.css',
            '.styl'
        ]
    },
    module: {
        rules: [
            {
                test: /\.styl$/,
                use: [
                    { loader: isReleaseBuild ? MiniCssExtractPlugin.loader : 'style-loader' },
                    {
                        loader: "css-loader" // translates CSS into CommonJS
                    },
                    {
                        loader: "stylus-loader" // compiles Stylus to CSS
                    }
                ]
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: [/node_modules/, /test/]
            },
            {
                test: /\.js$/,
                exclude: [/node_modules/, /dist/],
                use: [
                    { loader: 'babel-loader' },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    { loader: isReleaseBuild ? MiniCssExtractPlugin.loader : 'style-loader' },
                    { loader: 'css-loader' },
                    { loader: 'postcss-loader', options: postCssLoaderOptions },
                ],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: { minimize: true },
                    },
                ],
            },
            {
                test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                use: 'base64-inline-loader'
            }
        ],
    },
};
