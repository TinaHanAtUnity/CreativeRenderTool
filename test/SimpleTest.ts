/// <reference path="../typings/tsd.d.ts" />

import { assert } from 'chai';

describe('SimpleTest', () => {

    it('should pass', () => {
        assert.equal(true, true);
    });

    it('should fail', () => {
        assert.equal(true, false);
    });
});
