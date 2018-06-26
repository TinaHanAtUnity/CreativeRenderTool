import 'mocha';
import { assert } from 'chai';

import { IosUtils } from 'Utilities/IosUtils';

describe('IosUtilsTest', () => {
    it('isAppSheetBroken should return true with strings 8.0, 8.1, 8.2 and 8.3', () => {
        assert.isTrue(IosUtils.isAppSheetBroken('8.0', 'iPhone8,1'), 'Should return true with string 8.0');
        assert.isTrue(IosUtils.isAppSheetBroken('8.1', 'iPhone8,1'), 'Should return true with string 8.1');
        assert.isTrue(IosUtils.isAppSheetBroken('8.2', 'iPhone8,1'), 'Should return true with string 8.2');
        assert.isTrue(IosUtils.isAppSheetBroken('8.3', 'iPhone8,1'), 'Should return true with string 8.3');

        assert.isTrue(IosUtils.isAppSheetBroken('8.0.3', 'iPhone8,1'), 'Should return true with string 8.0.3');
        assert.isTrue(IosUtils.isAppSheetBroken('8.0.abc', 'iPhone8,1'), 'Should return true with string 8.0.abc');
        assert.isTrue(IosUtils.isAppSheetBroken('8.2ok', 'iPhone8,1'), 'Should return true with string 8.2ok');
        assert.isTrue(IosUtils.isAppSheetBroken('8.01', 'iPhone8,1'), 'Should return true with string 8.01');
    });

    it('isAppSheetBroken should return true with any OS Version 7.x string', () => {
        assert.isTrue(IosUtils.isAppSheetBroken('7.0', 'iPhone7,1'), 'Should return true with string 7.0');
        assert.isTrue(IosUtils.isAppSheetBroken('7.0.5', 'iPhone7,1'), 'Should return true with string 7.0.5');
        assert.isTrue(IosUtils.isAppSheetBroken('7.1', 'iPad7,1'), 'Should return true with string 7.1');
        assert.isTrue(IosUtils.isAppSheetBroken('7.2', 'iPhone7,1'), 'Should return true with string 7.2');
        assert.isTrue(IosUtils.isAppSheetBroken('7.6', 'iPhone7,1'), 'Should return true with string 7.6');
        assert.isTrue(IosUtils.isAppSheetBroken('7.9', 'iPhone7,1'), 'Should return true with string 7.9');
        assert.isTrue(IosUtils.isAppSheetBroken('7.9.10', 'iPhone7,1'), 'Should return true with string 7.9.10');
    });

    it('isAppSheetBroken should return false with strings (8., 8.4, 9.0 etc.)', () => {
        assert.isFalse(IosUtils.isAppSheetBroken('8', 'iPhone8,1'), 'Should return false with string 8');
        assert.isFalse(IosUtils.isAppSheetBroken('8..1', 'iPhone8,1'), 'Should return false with string 8..1');
        assert.isFalse(IosUtils.isAppSheetBroken('8!1', 'iPhone8,1'), 'Should return false with string 8!1');
        assert.isFalse(IosUtils.isAppSheetBroken('8.!1', 'iPhone8,1'), 'Should return false with string 8.!1');

        assert.isFalse(IosUtils.isAppSheetBroken('8.', 'iPhone8,1'), 'Should return false with string 8.');
        assert.isFalse(IosUtils.isAppSheetBroken('8.4', 'iPhone8,1'), 'Should return false with string 9.0');
        assert.isFalse(IosUtils.isAppSheetBroken('9.0', 'iPhone8,1'), 'Should return false with string 9.0');
        assert.isFalse(IosUtils.isAppSheetBroken('10.0', 'iPhone8,1'), 'Should return false with string 10.0');
        assert.isFalse(IosUtils.isAppSheetBroken('9.11', 'iPhone8,1'), 'Should return false with string 9.11');
        assert.isFalse(IosUtils.isAppSheetBroken('abc', 'iPhone8,1'), 'Should return false with string abc');
    });

    it('isAppSheetBroken should return true with versions 11.0, 11.1.1, 11.2, 11.2.5 on iPhone', () => {
        assert.isTrue(IosUtils.isAppSheetBroken('11.0', 'iPhone8,1'), 'Should return false with string 11.0');
        assert.isTrue(IosUtils.isAppSheetBroken('11.1.1', 'iPhone8,1'), 'Should return true with string 11.1.1');
        assert.isTrue(IosUtils.isAppSheetBroken('11.2', 'iPhone8,1'), 'Should return true with string 8.2');
        assert.isTrue(IosUtils.isAppSheetBroken('11.2.5', 'iPhone8,1'), 'Should return true with string 11.2.5');
    });

    it('isAppSheetBroken should return false with versions 11.0, 11.1.1, 11.2, 11.2.5 on iPad', () => {
        assert.isFalse(IosUtils.isAppSheetBroken('11.0', 'iPad6,7'), 'Should return false with string 11.0');
        assert.isFalse(IosUtils.isAppSheetBroken('11.1.1', 'iPad6,7'), 'Should return false with string 11.1.1');
        assert.isFalse(IosUtils.isAppSheetBroken('11.2', 'iPad6,7'), 'Should return false with string 11.2');
        assert.isFalse(IosUtils.isAppSheetBroken('11.2.5', 'iPad6,7'), 'Should return false with string 11.2.5');
    });
});
