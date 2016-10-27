import 'mocha';
import { assert } from 'chai';

import { IosUtils } from 'Utilities/IosUtils';

describe('IosUtilsTest', () => {
    it('isAppSheetBroken should return true with strings 8.0, 8.1, 8.2 and 8.3', () => {
        assert(IosUtils.isAppSheetBroken('8.0'), 'Should return true with string 8.0');
        assert(IosUtils.isAppSheetBroken('8.1'), 'Should return true with string 8.1');
        assert(IosUtils.isAppSheetBroken('8.2'), 'Should return true with string 8.2');
        assert(IosUtils.isAppSheetBroken('8.3'), 'Should return true with string 8.3');

        assert(IosUtils.isAppSheetBroken('8.0.3'), 'Should return true with string 8.0.3');
        assert(IosUtils.isAppSheetBroken('8.0.abc'), 'Should return true with string 8.0.abc');
        assert(IosUtils.isAppSheetBroken('8.2ok'), 'Should return true with string 8.2ok');
        assert(IosUtils.isAppSheetBroken('8.01'), 'Should return true with string 8.01');
    });

    it('isAppSheetBroken should return false with strings (8., 8.4, 9.0 etc.) should not match ', () => {
        assert(!IosUtils.isAppSheetBroken('8'), 'Should return false with string 8');
        assert(!IosUtils.isAppSheetBroken('8.'), 'Should return false with string 8.');
        assert(!IosUtils.isAppSheetBroken('8.4'), 'Should return false with string 9.0');
        assert(!IosUtils.isAppSheetBroken('9.0'), 'Should return false with string 9.0');
        assert(!IosUtils.isAppSheetBroken('7.1'), 'Should return false with string 7.1');
        assert(!IosUtils.isAppSheetBroken('10.0'), 'Should return false with string 10.0');
        assert(!IosUtils.isAppSheetBroken('9.11'), 'Should return false with string 9.11');
        assert(!IosUtils.isAppSheetBroken('abc'), 'Should return false with string abc');
    });
});
