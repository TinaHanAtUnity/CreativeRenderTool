import 'mocha';
import { assert } from 'chai';

import { Url } from 'Utilities/Url';

describe('UrlTest', () => {

    it('should parse URL correctly', () => {
        const url = 'http://www.google.fi:8000/path/to/file.txt?search=true#hash123';
        const parsedUrl = Url.parse(url);
        assert.equal(parsedUrl.pathname, '/path/to/file.txt', 'Path was parsed incorrectly');
        assert.equal(parsedUrl.hash, '#hash123', 'Hash was parsed incorrectly');
        assert.equal(parsedUrl.host, 'www.google.fi:8000', 'Host was parsed incorrectly');
        assert.equal(parsedUrl.hostname, 'www.google.fi', 'Hostname was parsed incorrectly');
        assert.equal(parsedUrl.port, 8000, 'Port was parsed incorrectly');
        assert.equal(parsedUrl.protocol, 'http:', 'Protocol was parsed incorrectly');
        assert.equal(parsedUrl.search, '?search=true', 'Query string was parsed incorrectly');
    });

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
            assert.equal(true, Url.isValid('https://www.example.net/unsafe/characters/{}|\\^~[]`'), 'valid url with unsafe (but legal) characters was not accepted');
        });

        it('should not validate illegal URLs', () => {
            assert.equal(false, Url.isValid('rtmp://a.rtmp.youtube.com/videolive?ns=yt-live'), 'invalid url was accepted');
            assert.equal(false, Url.isValid('https://example.net/"url".png'), 'invalid url was accepted');
            assert.equal(false, Url.isValid(''), 'invalid url was accepted');
            assert.equal(false, Url.isValid('https://bs.serving-sys.com/Serving?cn=display&c=23&pl=VAST&pli=19864721&PluID=0&pos=9317&ncu=https://i.w55c.net/cl?t=1&btid=YTdmNGEwZTItZGJmYi00YWJmLTgxYTYtOGQ1Y2QxNDE0YjU0fFRGdVE2WmU1T0p8MTQ4MjQyODcyMTAyNHwxfDBGUkxJUmFKejF8MFJkUlU2cmgyMHwzMGM1ZWY3YS1iNTk0LTRjMzEtODQ1OC02ZmM3YTdjZDQ5MzFfZ2FfR0VOX0VYfDI1ODIzMzd8fHx8MTcuMFB8VVNE&ei=TREMOR&rurl=&ord=2611507143758033&cim=1\n\n\n<SCRIPT  language=\'JavaScript1.1\' SRC=\"https://pixel.adsafeprotected.com/rjss/st/69577/12006978/skeleton.js\"></SCRIPT>\n<NOSCRIPT><IMG SRC=\"https://pixel.adsafeprotected.com/rfw/st/69577/12006977/skeleton.gif\" BORDER=0 WIDTH=1 HEIGHT=1 ALT=\"\"></NOSCRIPT>&cb=1482428721026'), 'invalid url was accepted');
        });
    });
});
