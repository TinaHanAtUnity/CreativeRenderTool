import { assert } from 'chai';
import 'mocha';
import { Color } from 'Core/Utilities/Color';

describe('Color Test', () => {
    it('should parse hex colors correctly', () => {

        assert.deepEqual(Color.hexToColor('#df80b8'), { r: 223, g: 128, b: 184, a: 255 }, 'Color was parsed incorrectly');
        assert.deepEqual(Color.hexToColor('#0c36d4'), { r: 12, g: 54, b: 212, a: 255 }, 'Color was parsed incorrectly');
        assert.deepEqual(Color.hexToColor('a6ca5c'), { r: 166, g: 202, b: 92, a: 255 }, 'Color was parsed incorrectly');
        assert.deepEqual(Color.hexToColor('#9d72a9ca'), { r: 157, g: 114, b: 169, a: 202 }, 'Color was parsed incorrectly');
        assert.deepEqual(Color.hexToColor('6d4488e2'), { r: 109, g: 68, b: 136, a: 226 }, 'Color was parsed incorrectly');
        assert.deepEqual(Color.hexToColor('789'), { r: 119, g: 136, b: 153, a: 255 }, 'Color was parsed incorrectly');
        assert.deepEqual(Color.hexToColor('36d4'), { r: 51, g: 102, b: 221, a: 68 }, 'Color was parsed incorrectly');
        assert.deepEqual(Color.hexToColor('##0c36d4'), { r: 0, g: 0, b: 0, a: 0 }, 'Invalid color was validated incorrectly');
        assert.deepEqual(Color.hexToColor('48F4c8x'), { r: 0, g: 0, b: 0, a: 0 }, 'Invalid color was validated incorrectly');
        assert.deepEqual(Color.hexToColor(undefined), { r: 0, g: 0, b: 0, a: 0 }, 'Invalid color was validated incorrectly');
    });

    it('should convert css rgba colors from hex colors correctly', () => {
        assert.equal(Color.hexToCssRgba('#df80b8'), 'rgba(223, 128, 184, 1)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('#0c36d4'), 'rgba(12, 54, 212, 1)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('a6ca5c'), 'rgba(166, 202, 92, 1)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('#9d72a9ca'), 'rgba(157, 114, 169, 0.792)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('6d4488e2'), 'rgba(109, 68, 136, 0.886)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('789'), 'rgba(119, 136, 153, 1)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('36d4'), 'rgba(51, 102, 221, 0.267)', 'Color was converted incorrectly');
        assert.equal(Color.hexToCssRgba('##0c36d4'), 'rgba(0, 0, 0, 0)', 'Invalid color was validated incorrectly');
        assert.equal(Color.hexToCssRgba('48F4c8x'), 'rgba(0, 0, 0, 0)', 'Invalid color was validated incorrectly');
        assert.equal(Color.hexToCssRgba(undefined), 'rgba(0, 0, 0, 0)', 'Invalid color was validated incorrectly');
    });

    it('should lerp colors correctly', () => {
        const values = [{
            c1: { r: 109, g: 68, b: 136, a: 226 },
            c2: { r: 223, g: 128, b: 184, a: 255 },
            t: 0.78
        }, {
            c1: { r: 119, g: 136, b: 153, a: 50 },
            c2: { r: 51, g: 102, b: 221, a: 68 },
            t: 0.5
        }, {
            c1: { r: 157, g: 114, b: 169, a: 202 },
            c2: { r: 200, g: 0, b: 5, a: 255 },
            t: 0.01
        }];
        const mixed = [
            { r: 198, g: 115, b: 173, a: 249 },
            { r: 85, g: 119, b: 187, a: 59 },
            { r: 157, g: 113, b: 167, a: 203 }
        ];

        for (let i = 0; i < values.length; i++) {
            const c1 = values[i].c1;
            const c2 = values[i].c2;
            const t = values[i].t;
            assert.deepEqual(Color.lerp(new Color(c1.r, c1.g, c1.b, c1.a), new Color(c2.r, c2.g, c2.b, c2.a), t), mixed[i], 'Colors were lerped incorrectly');
        }
    });
});
