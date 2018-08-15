import plugins from './rollup.config.plugins';

export default {
    input: 'build/src/ts/Device.js',
    output: {
        name: 'Device',
        file: 'build/src/ts/Bundle.js',
        format: 'iife',
        interop: false,
        sourcemap: 'inline'
    },
    plugins: plugins,
    watch: {
        chokidar: true,
        include: 'build/src/**',
        clearScreen: false
    }
}
