import 'mocha';
import { assert } from 'chai';

import { JsonParser } from 'Utilities/JsonParser';

describe('JsonParserTest', () => {
    it('should contain diagnostic fields', () => {
        try {
            JsonParser.parse('bad content');
        } catch(e) {
            // tslint:disable:no-string-literal
            assert.equal(e.diagnostic['json'], 'bad content');
            // tslint:enable:no-string-literal
        }
    });

    it('should work just like JSON.parse on happy case', () => {
        assert.deepEqual(JsonParser.parse('{}'), {});
        assert.equal(JsonParser.parse('true'), true);
        assert.deepEqual(JsonParser.parse('[1, 5, "false"]'), [1, 5, 'false']);
        assert.equal(JsonParser.parse('null'), null);
    });
});
