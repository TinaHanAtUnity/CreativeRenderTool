import { assert } from 'chai';
import 'mocha';
import { StringUtils } from 'Ads/Utilities/StringUtils';

describe('StringUtilsTest', () => {
    it('startWithHTMLTag', () => {
        const s1 = '<script src=\"https://abcd.com\">hello world</script>';
        assert.equal(StringUtils.startWithHTMLTag(s1), true, 'Should return true when a string starts as any html tag');

        const s2 = 'window.open(\'hello\')';
        assert.equal(StringUtils.startWithHTMLTag(s2), false, 'Should return false when a string is not wrapped with any html tag');
    });
});
