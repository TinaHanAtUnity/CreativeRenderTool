/// <reference path="../typings/tsd.d.ts" />

import 'mocha';
import { assert } from 'chai';

import Url from '../src/ts/Utilities/Url';

describe('UrlTest', () => {
    it('should add URL parameters correctly', () => {
        let url: string = Url.addParameters('http://www.google.fi', {test: true});
        assert.equal(url, 'http://www.google.fi?test=true');
    });
});
