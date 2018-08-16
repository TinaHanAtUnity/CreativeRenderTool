import plugins from './rollup.config.plugins';

export default {
    input: 'build/test/Unit.js',
    output: {
        name: 'Hybrid',
        file: 'build/test/UnitBundle.js',
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
    ],
    watch: {
        chokidar: true,
        include: 'build/**',
        clearScreen: false
    }
}
