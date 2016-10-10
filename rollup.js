import includePaths from 'rollup-plugin-includepaths';
import string from 'rollup-plugin-string';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    entry: 'build/release/js/Main.js',
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
        string({
            include: '**/*.html'
        }),
        nodeResolve()
    ],
    context: 'window'
};
