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

    it('should work just like JSON.parse on happy case', () => {
        assert.deepEqual(JsonParser.parse('{}'), {});
        assert.equal(JsonParser.parse('true'), true);
        assert.deepEqual(JsonParser.parse('[1, 5, "false"]'), [1, 5, 'false']);
        assert.equal(JsonParser.parse('null'), null);
    });
});
