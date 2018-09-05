import plugins from './rollup.config.plugins';

export default {
    input: 'build/test/Integration.js',
    output: {
        name: 'Integration',
        file: 'build/test/IntegrationBundle.js',
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
