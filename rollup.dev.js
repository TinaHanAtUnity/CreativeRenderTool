import includePaths from 'rollup-plugin-includepaths';
import string from 'rollup-plugin-string';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    entry: 'build/dev/js/src/ts/Main.js',
    format: 'iife',
    dest: 'build/dev/js/Main.js',
    plugins: [
        string({
            include: '**/*.html'
        }),
        includePaths({
            paths: [
                'build/dev/js/src/ts',
                'build/dev/html'
            ]
        }),
        nodeResolve()
    ],
    context: 'window'
};
