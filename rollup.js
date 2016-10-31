import includePaths from 'rollup-plugin-includepaths';
import string from 'rollup-plugin-string';
import nodeResolve from 'rollup-plugin-node-resolve';
import html from 'rollup-plugin-html';

export default {
    entry: 'build/release/js/Device.js',
    format: 'iife',
    dest: 'build/release/bundle.js',
    plugins: [
        includePaths({
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
        nodeResolve()
    ],
    context: 'window'
};
