import 'mocha';
import { assert } from 'chai';

import { Url } from 'Utilities/Url';

describe('UrlTest', () => {
    it('should add URL parameters correctly', () => {
        const url: string = Url.addParameters('http://www.google.fi', {test: true});
        assert.equal(url, 'http://www.google.fi?test=true');
    });
});
