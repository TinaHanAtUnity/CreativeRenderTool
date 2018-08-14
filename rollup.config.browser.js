import plugins from './rollup.config.plugins';

export default {
    input: 'build/src/ts/Browser.js',
    output: {
        name: 'Browser',
        file: 'build/src/ts/BrowserBundle.js',
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
