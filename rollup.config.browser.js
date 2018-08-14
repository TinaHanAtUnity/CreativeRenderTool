import plugins from './rollup.plugins';

export default {
    input: 'build/src/ts/Browser.js',
    output: {
        name: 'Browser',
        file: 'build/src/ts/BrowserBundle.js',
        format: 'iife',
        interop: false,
        sourcemap: 'inline'
    },
    plugins: plugins
}
