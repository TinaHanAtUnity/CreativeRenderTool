import { assert } from 'chai';
import 'mocha';
import { Color } from 'Core/Utilities/Color';

describe('Color Test', () => {
    it('should parse hex colors correctly', () => {
        assert.equal(Color.hexToRgba('#df80b8'), {r: 223, g: 128, b: 184, a: 255}, 'Color was parsed incorrectly');
        assert.equal(Color.hexToRgba('#0c36d4'), {r: 12, g: 54, b: 212, a: 255}, 'Color was parsed incorrectly');
        assert.equal(Color.hexToRgba('a6ca5c'), {r: 166, g: 202, b: 92, a: 255}, 'Color was parsed incorrectly');
        assert.equal(Color.hexToRgba('#9d72a9ca'), {r: 157, g: 114, b: 169, a: 202}, 'Color was parsed incorrectly');
        assert.equal(Color.hexToRgba('6d4488e2'), {r: 109, g: 68, b: 136, a: 226}, 'Color was parsed incorrectly');
    });

    it('should convert css rgba colors from hex colors correctly', () => {
        assert.equal(Color.hexToCssRgba('#df80b8'), 'rgba(223, 128, 184, 1)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('#0c36d4'), 'rgba(12, 54, 212, 1)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('a6ca5c'), 'rgba(166, 202, 92, 1)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('#9d72a9ca'), 'rgba(157, 114, 169, 0.792)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('6d4488e2'), 'rgba(109, 68, 136, 0.886)', 'Color was converted incorrectly');
    });
});
