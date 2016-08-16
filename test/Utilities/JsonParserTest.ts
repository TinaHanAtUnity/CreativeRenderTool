/// <reference path="../../typings/index.d.ts" />

import 'mocha';
import { assert } from 'chai';

import { JsonParser } from '../../src/ts/Utilities/JsonParser';

describe('JsonParserTest', () => {
    it('should contain error fields', () => {
        try {
            JsonParser.parse('bad content');
        } catch(e) {
            assert.equal(e.failingContent, 'bad content');
            assert.equal(e.name, 'JsonSyntaxError');
        }
    });
});
