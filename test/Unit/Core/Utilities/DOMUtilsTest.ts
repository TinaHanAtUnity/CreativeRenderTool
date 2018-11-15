import { assert } from 'chai';

import { DOMUtils } from 'Core/Utilities/DOMUtils';
import 'mocha';

describe('DOMUtilsTest', () => {
    it('should parse xml correctly', () => {
        const doc = DOMUtils.parseFromString('<xml></xml>', 'application/xml');
        assert.isNotNull(doc);
        assert.isNotNull(doc.documentElement);
    });

    it('should parse html correctly', () => {
        const doc = DOMUtils.parseFromString('<html></html>', 'text/html');
        assert.isNotNull(doc);
        assert.isNotNull(doc.documentElement);
    });
});
