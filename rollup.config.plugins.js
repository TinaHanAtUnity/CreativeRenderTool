import include from 'rollup-plugin-includepaths';
import string from 'rollup-plugin-string';
import html from 'rollup-plugin-html';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import json from 'rollup-plugin-json';

export default [
    sourcemaps(),
    include({
        paths: [
            'build/src',
            'build/src/ts',
            'build/test',
            'build/src/proto'
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
            '**/*.css'
        ]
    }),
    json({
        include: [
            '**/*.json'
        ],
        namedExports: false
    })
];


