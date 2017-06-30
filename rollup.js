import include from 'rollup-plugin-includepaths';
import string from 'rollup-plugin-string';
import resolve from 'rollup-plugin-node-resolve';
import html from 'rollup-plugin-html';
import alias from 'rollup-plugin-alias';

export default {
    entry: 'build/release/js/Device.js',
    format: 'iife',
    dest: 'build/release/bundle.js',
    plugins: [
        include({
            paths: [
                'build/release/js',
                'build/release'
            ],
            extensions: ['.js', '.html']
        }),
        html({
            include: '**/*.html',
            htmlMinifierOptions: {
                collapseWhitespace: true,
                collapseBooleanAttributes: true
            }
        }),
        string({
            include: [
                '**/*.xml',
                '**/*.json'
            ]
        }),
        alias({
            'es6-promise': 'node_modules/es6-promise/dist/es6-promise.auto.js'
        }),
        resolve()
    ],
    context: 'window'
};
