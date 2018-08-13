import plugins from './rollup.plugins';

export default {
    input: 'build/test/All.js',
    output: {
        name: 'Test',
        file: 'build/test/Bundle.js',
        format: 'iife',
        interop: false,
        globals: {
            chai: 'chai'
        },
        sourcemap: 'inline'
    },
    plugins: plugins,
    external: [
        'mocha',
        'chai'
    ]
}
