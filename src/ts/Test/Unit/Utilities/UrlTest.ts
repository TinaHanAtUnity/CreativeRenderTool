import 'mocha';
import { assert } from 'chai';

import { Url } from 'Utilities/Url';

describe('UrlTest', () => {
    it('should add URL parameters correctly', () => {
        const url: string = Url.addParameters('http://www.google.fi', {test: true});
        assert.equal(url, 'http://www.google.fi?test=true');
    });

    describe('validation', () => {
        it('should validate legal URLs', () => {
            assert.equal(true, Url.isValid('https://www.unity3d.com'), 'valid url was not accepted');
            assert.equal(true, Url.isValid('https://www.example.net/~user/dynamic$test.png'), 'valid url was not accepted');
            assert.equal(true, Url.isValid('http://localhost:8000/build/dev/config.json'), 'valid url was not accepted');
            assert.equal(true, Url.isValid('https://www.unity3d.com/search?foo=bar'), 'valid url was not accepted');
        });

        it('should not validate illegal URLs', () => {
            assert.equal(false, Url.isValid('rtmp://a.rtmp.youtube.com/videolive?ns=yt-live'), 'invalid url was accepted');
            assert.equal(false, Url.isValid('https://example.net/"url".png'), 'invalid url was accepted');
            assert.equal(false, Url.isValid(''), 'invalid url was accepted');
        });
    });
});
