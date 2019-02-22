import { assert } from 'chai';
import 'mocha';
import { TimeUtils } from 'Ads/Utilities/TimeUtils';

describe('TimeUtilsTest', () => {
    it('getNextUTCDayDeltaSeconds', () => {
        const t1 = new Date('07 Feb 2019 21:00:00 UTC');
        assert.equal(TimeUtils.getNextUTCDayDeltaSeconds(t1.getTime()), 3 * 60 * 60, 'Should return 3hrs difference for next UTC day from 2/7/2019 21:00 UTC');

        const t2 = new Date('07 Feb 2019 21:00:00 PST');
        assert.equal(TimeUtils.getNextUTCDayDeltaSeconds(t2.getTime()), 19 * 60 * 60, 'Should return 19hrs difference for next UTC day for 2/7/2019 21:00 PST');
    });
});
