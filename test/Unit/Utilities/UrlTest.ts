import { assert } from 'chai';
import { Platform } from 'Common/Constants/Platform';

import { Url } from 'Core/Utilities/Url';
import 'mocha';

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

    [
        ['http://www.google.fi?&param1=125&param2=test', 'param2', 'http://www.google.fi?&param1=125'],
        ['http://www.google.fi?&param1=125&param2=test', 'param1', 'http://www.google.fi?&param2=test'],
        ['http://www.google.fi?&param1=125&param2=test&param3=true', 'param2', 'http://www.google.fi?&param1=125&param3=true'],
        ['http://www.google.fi?&param1=125', 'param1', 'http://www.google.fi?']
    ].forEach(([originalUrl, parameter, expected]) => {
        it(`should remove ${parameter} from ${originalUrl}`, () => {
            const url: string = Url.removeQueryParameter(originalUrl, parameter);
            assert.equal(url, expected);
        });
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
            assert.equal(false, Url.isValid('rtmp://a.rtmp.youtube.com/videolive?ns=yt-live'), 'invalid url was accepted, test 1');
            assert.equal(false, Url.isValid('https://example.net/"url".png'), 'invalid url was accepted, test 2');
            assert.equal(false, Url.isValid(''), 'invalid url was accepted, test 3');
            assert.equal(false, Url.isValid('https://bs.serving-sys.com/Serving?cn=display&c=23&pl=VAST&pli=19864721&PluID=0&pos=9317&ncu=https://i.w55c.net/cl?t=1&btid=YTdmNGEwZTItZGJmYi00YWJmLTgxYTYtOGQ1Y2QxNDE0YjU0fFRGdVE2WmU1T0p8MTQ4MjQyODcyMTAyNHwxfDBGUkxJUmFKejF8MFJkUlU2cmgyMHwzMGM1ZWY3YS1iNTk0LTRjMzEtODQ1OC02ZmM3YTdjZDQ5MzFfZ2FfR0VOX0VYfDI1ODIzMzd8fHx8MTcuMFB8VVNE&ei=TREMOR&rurl=&ord=2611507143758033&cim=1\n\n\n<SCRIPT  language=\'JavaScript1.1\' SRC=\"https://pixel.adsafeprotected.com/rjss/st/69577/12006978/skeleton.js\"></SCRIPT>\n<NOSCRIPT><IMG SRC=\"https://pixel.adsafeprotected.com/rfw/st/69577/12006977/skeleton.gif\" BORDER=0 WIDTH=1 HEIGHT=1 ALT=\"\"></NOSCRIPT>&cb=1482428721026'), 'invalid url was accepted, test 4');
        });
    });

    describe('encoding', () => {
        it('should encode unsafe characters', () => {
            const url = 'http://test.com?param=|Hello[]^\\';
            assert.equal(Url.encode(url), 'http://test.com?param=%7CHello%5B%5D%5E%5C', 'Url not encoded as expected');
        });

        it('should not encode already encoded stuff', () => {
            const url = 'http://test.com?param=|Hello|%20|HelloAgain|';
            assert.equal(Url.encode(url), 'http://test.com?param=%7CHello%7C%20%7CHelloAgain%7C', 'Url not encoded as expected');
        });

        it('should encode utf8 characters', () => {
            const url = 'http://test.com?param=%7CHello%7C%20%7CHelloAgain%7C/FRVideo19unity封面.png';
            assert.equal(Url.encode(url), 'http://test.com?param=%7CHello%7C%20%7CHelloAgain%7C/FRVideo19unity%E5%B0%81%E9%9D%A2.png', 'Url not encoded as expected');
        });

        it('should encode %', () => {
            const url = 'http://test.com?param=%7C%%7C%25';
            assert.equal(Url.encode(url), 'http://test.com?param=%7C%25%7C%25', 'Url not encoded as expected');
        });

        it('should encode % in the end', () => {
            const url = 'http://test.com?param=%';
            assert.equal(Url.encode(url), 'http://test.com?param=%25', 'Url not encoded as expected');
        });

        it('should encode % in wrong url escape', () => {
            const url = 'http://test.com?param=%2';
            assert.equal(Url.encode(url), 'http://test.com?param=%252', 'Url not encoded as expected');
        });

        it('should encode % in wrong url escape with letters', () => {
            const url = 'http://test.com?param=%wb';
            assert.equal(Url.encode(url), 'http://test.com?param=%25wb', 'Url not encoded as expected');
        });
    });

    describe('validating UTF-8', () => {
        it('should allow unicode utf-8 characters', () => {
            let url = 'https://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
            assert.isTrue(Url.isValid(url), 'Should allow unicode characters, test 1');
            url = 'https://cdn.unityads.unity3d.com/assets/f28676c2-5feb-4aa7-94fb-70c9c901cd57/800×600.png';
            assert.isTrue(Url.isValid(url), 'Should allow unicode characters, test 2');
        });
    });

    describe('whitelisting IOS', () => {
        it('should return true', () => {
            ['itunes', 'itms', 'itmss', 'http', 'https'].forEach((protocol) => {
                const url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                assert.isTrue(Url.isProtocolWhitelisted(url, Platform.IOS), `for protocol ${protocol}`);
          });
        });
        it('should return false', () => {
            ['market', 'tcp', 'bla'].forEach((protocol) => {
                const url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                assert.isFalse(Url.isProtocolWhitelisted(url, Platform.IOS), `for protocol ${protocol}`);
          });
        });
    });

    describe('whitelisting ANDROID', () => {
        it('should return true', () => {
            ['market', 'http', 'https'].forEach((protocol) => {
                const url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                assert.isTrue(Url.isProtocolWhitelisted(url, Platform.ANDROID), `for protocol ${protocol}`);
          });
        });
        it('should return false', () => {
            ['itunes', 'itmss', 'itms', 'bla'].forEach((protocol) => {
                const url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                assert.isFalse(Url.isProtocolWhitelisted(url, Platform.ANDROID), `for protocol ${protocol}`);
          });
        });
    });

    describe('whitelisting TEST', () => {
        it('should always return false', () => {
            ['market', 'http', 'https', 'itmss', 'itunes', 'itms'].forEach((protocol) => {
                const url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                assert.isFalse(Url.isProtocolWhitelisted(url, Platform.TEST), `for protocol ${protocol}`);
          });
        });
    });
});
