import include from 'rollup-plugin-includepaths';
import string from 'rollup-plugin-string';
import html from 'rollup-plugin-html';
import alias from 'rollup-plugin-alias';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import istanbul from 'rollup-plugin-istanbul';

export default [
    sourcemaps(),
    include({
        paths: [
            'build/src',
            'build/src/ts',
            'build/test'
        ]
    }),
    resolve({
        browser: true,
        only: [
            /protobufjs/,
            /tslib/,
            /sinon/
        ]
    }),
    commonjs({
        sourceMap: false,
        namedExports: {
            'node_modules/protobufjs/minimal.js': [
                'util',
                'Reader',
                'Writer',
                'roots'
            ]
        }
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
        '../../proto/unity_proto.js': 'src/proto/unity_proto.js',
    }),
    istanbul({
        exclude: [
            'node_modules/**/*.js',
            'build/test/**/*.js'
        ]
    })
]


