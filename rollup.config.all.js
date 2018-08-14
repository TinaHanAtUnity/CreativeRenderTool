import device from './rollup.config.device';
import browser from './rollup.config.browser';
import unit from './rollup.config.test.unit';
import integration from './rollup.config.test.integration';

export default [
    device,
    browser,
    unit,
    integration
]
