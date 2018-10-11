import plugins from './rollup.config.plugins';
import istanbul from 'rollup-plugin-istanbul';

export default {
    input: 'build/test/Unit.js',
    output: {
        name: 'Unit',
        file: 'build/test/CoverageBundle.js',
        format: 'iife',
        interop: false,
        globals: {
            chai: 'chai'
        },
        sourcemap: 'inline'
    },
    plugins: plugins.concat([
        istanbul({
            include: [
                'build/src/ts/Core/**/*.js'
            ]
        })
    ]),
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
