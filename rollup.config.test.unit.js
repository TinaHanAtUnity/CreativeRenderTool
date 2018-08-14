import plugins from './rollup.plugins';
import istanbul from 'rollup-plugin-istanbul';

export default {
    input: 'build/test/Unit.js',
    output: {
        name: 'Unit',
        file: 'build/test/UnitBundle.js',
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
