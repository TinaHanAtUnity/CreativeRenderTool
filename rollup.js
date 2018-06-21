import include from 'rollup-plugin-includepaths';
import string from 'rollup-plugin-string';
import html from 'rollup-plugin-html';
import alias from 'rollup-plugin-alias';

export default {
    input: 'build/release/js/Device.js',
    output: {
        format: 'iife',
        file: 'build/release/bundle.js',
        globals: {
            'protobufjs/minimal': 'protobuf',
            'tslib': 'tslib'
        }
    },
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
                '**/*.json',
                '**/*.css'
            ]
        }),
        alias({
            'es6-promise': 'node_modules/es6-promise/dist/es6-promise.auto.js',
            '../../proto/unity_proto.js': 'build/release/js/Proto/unity_proto.js',
            'tslib': 'node_modules/tslib/tslib.es6.js',
        })
    ],
    context: 'window'
};
