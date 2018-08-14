import plugins from './rollup.plugins';
import istanbul from 'rollup-plugin-istanbul';

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
    plugins: plugins.concat([
        istanbul({
            include: [
                'build/src/ts/**/*.js'
            ]
        })
    ]),
    external: [
        'mocha',
        'chai'
    ]
}
