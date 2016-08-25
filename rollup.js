import includePaths from 'rollup-plugin-includepaths';
import string from 'rollup-plugin-string';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    entry: 'build/release/js/src/ts/Main.js',
    format: 'iife',
    dest: 'build/release/js/Main.js',
    plugins: [
        string({
            include: '**/*.html'
        }),
        includePaths({
            paths: [
                'build/release/js/src/ts',
                'build/release/html'
            ]
        }),
        nodeResolve()
    ],
    context: 'window'
};
