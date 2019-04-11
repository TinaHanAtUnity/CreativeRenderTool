import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';

import { Url } from 'Core/Utilities/Url';
import 'mocha';
import { AdmobUrlQueryParameters } from 'AdMob/Parsers/ProgrammaticAdMobParser';

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

    describe('isValidUrlCharacters', () => {
        it('should validate legal urls', () => {
            assert.isTrue(Url.isValidUrlCharacters('https://www.unity3d.com!$#&-;=?-[]'));
        });

        it('should not validate illegal urls', () => {
            assert.isFalse(Url.isValidUrlCharacters('https://www.unity3d.com/%ZONE%'));
            assert.isFalse(Url.isValidUrlCharacters('https://bs.serving-sys.com/Serving?cn=display&c=23&pl=VAST&pli=19864721&PluID=0&pos=9317&ncu=https://i.w55c.net/cl?t=1&btid=YTdmNGEwZTItZGJmYi00YWJmLTgxYTYtOGQ1Y2QxNDE0YjU0fFRGdVE2WmU1T0p8MTQ4MjQyODcyMTAyNHwxfDBGUkxJUmFKejF8MFJkUlU2cmgyMHwzMGM1ZWY3YS1iNTk0LTRjMzEtODQ1OC02ZmM3YTdjZDQ5MzFfZ2FfR0VOX0VYfDI1ODIzMzd8fHx8MTcuMFB8VVNE&ei=TREMOR&rurl=&ord=2611507143758033&cim=1\n\n\n<SCRIPT  language=\'JavaScript1.1\' SRC=\"https://pixel.adsafeprotected.com/rjss/st/69577/12006978/skeleton.js\"></SCRIPT>\n<NOSCRIPT><IMG SRC=\"https://pixel.adsafeprotected.com/rfw/st/69577/12006977/skeleton.gif\" BORDER=0 WIDTH=1 HEIGHT=1 ALT=\"\"></NOSCRIPT>&cb=1482428721026'));
        });
    });

    describe('isValidProtocol', () => {
        it('should validate legal url protocols', () => {
            assert.isTrue(Url.isValidProtocol('https://www.unity3d.com'), 'https:// is a valid protocol');
            assert.isTrue(Url.isValidProtocol('http://www.unity3d.com'), 'http:// is a valid protocol');
            assert.isTrue(Url.isValidProtocol('itms-apps://www.unity3d.com'), 'itms-apps:// is a valid protocol');
        });

        it('should not validate illegal url protocols', () => {
            assert.isFalse(Url.isValidProtocol('//www.unity3d.com'), 'relative url should not pass valid protocol check');
            assert.isFalse(Url.isValidProtocol('file://www.unity3d.com'), 'file url should not pass valid protocol check');
        });
    });

    describe('isRelativeProtocol', () => {
        it('should return true if it is a relative url', () => {
            assert.isTrue(Url.isRelativeProtocol('//www.unity3d.com'), 'should return true for valid relative path');
            assert.isTrue(Url.isRelativeProtocol('//www.google.com'), 'should return true for valid relative path');
        });

        it('should return false for non relative urls', () => {
            assert.isFalse(Url.isRelativeProtocol('http://www.unity3d.com'));
            assert.isFalse(Url.isRelativeProtocol('https://www.unity3d.com'));
            assert.isFalse(Url.isRelativeProtocol('file://www.unity3d.com'));
        });
    });

    describe('getProtocol', () => {
        it('should get any protocol value', () => {
            assert.equal(Url.getProtocol('http://www.unity3d.com'), 'http:');
            assert.equal(Url.getProtocol('https://www.unity3d.com'), 'https:');
            assert.equal(Url.getProtocol('file://www.unity3d.com'), 'file:');
            // this needs to be written this way because it will be http: when running webview unit tests
            // but will be file: when running hybrid tests.
            const pageProtocol = Url.getProtocol(document.URL);
            const relativeUrlProtocol = Url.getProtocol('//www.unity3d.com');
            assert.equal(relativeUrlProtocol, pageProtocol);
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

    describe('encoding url with params', () => {
        it('should encode unsafe characters in param', () => {
            const url = 'http://test.com?param=#%{}|Hello[]^\\';
            assert.equal(Url.encodeUrlWithQueryParams(url), 'http://test.com?param=%23%25%7B%7D%7CHello%5B%5D%5E%5C', 'Url not encoded as expected');
        });

        it('should not encode already encoded stuff', () => {
            const url = 'http://test.com?param=|Hello|%20|HelloAgain|';
            assert.equal(Url.encodeUrlWithQueryParams(url), 'http://test.com?param=%7CHello%7C%20%7CHelloAgain%7C', 'Url not encoded as expected');
        });

        it('should encode utf8 characters', () => {
            const url = 'http://test.com?param=%7CHello%7C%20%7CHelloAgain%7CFRVideo19unity封面.png';
            assert.equal(Url.encodeUrlWithQueryParams(url), 'http://test.com?param=%7CHello%7C%20%7CHelloAgain%7CFRVideo19unity%E5%B0%81%E9%9D%A2.png', 'Url not encoded as expected');
        });

        it('should encode %', () => {
            const url = 'http://test.com?param=%7C%%7C%25';
            assert.equal(Url.encodeUrlWithQueryParams(url), 'http://test.com?param=%7C%25%7C%25', 'Url not encoded as expected');
        });

        it('should encode % in the end', () => {
            const url = 'http://test.com?param=%';
            assert.equal(Url.encodeUrlWithQueryParams(url), 'http://test.com?param=%25', 'Url not encoded as expected');
        });

        it('should encode % in wrong url escape', () => {
            const url = 'http://test.com?param=%2';
            assert.equal(Url.encodeUrlWithQueryParams(url), 'http://test.com?param=%252', 'Url not encoded as expected');
        });

        it('should encode % in wrong url escape with letters', () => {
            const url = 'http://test.com?param=%wb';
            assert.equal(Url.encodeUrlWithQueryParams(url), 'http://test.com?param=%25wb', 'Url not encoded as expected');
        });

        it('should not cut off if = is given multiple times in query', () => {
            const url = 'https://omax.admarvel.com/rtb/et?p=__pid=c02922366a53a3ef__sid=228693__bid=1251454__evt_name=load__rbid=194__cb=d63301fa-a41d-4d7c-a9ea-1f317ddfd9bf';
            assert.equal(Url.encodeUrlWithQueryParams(url), 'https://omax.admarvel.com/rtb/et?p=__pid=c02922366a53a3ef__sid=228693__bid=1251454__evt_name=load__rbid=194__cb=d63301fa-a41d-4d7c-a9ea-1f317ddfd9bf', 'Url params not encoded as expected');
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

    describe('decodeProtocol', () => {
        it('should replace http%3A%2F%2F with http://', () => {
            const url = Url.decodeProtocol('http%3A%2F%2Fad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz');
            assert.equal(url, 'http://ad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz');
        });

        it('should replace https%3A%2F%2F with https://', () => {
            const url = Url.decodeProtocol('https%3A%2F%2Fad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz');
            assert.equal(url, 'https://ad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz');
        });

        it('should not replace http://', () => {
            const url = Url.decodeProtocol('http://ad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz');
            assert.equal(url, 'http://ad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz');
        });

        it('should not replace https://', () => {
            const url = Url.decodeProtocol('https://ad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz');
            assert.equal(url, 'https://ad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz');
        });
    });

    describe('getQueryParameters', () => {
        it('should get params from Admob Video Urls', () => {
            const mediaUrl = 'https://www.youtube.com/get_video?video_id=AiOZtKQLGW4&ts=1549413290&t=MChfLOuFJXpYeSibNYZyx1--1Rs&gad=1&br=1&itag=22,18';
            const videoId = Url.getQueryParameter(mediaUrl, AdmobUrlQueryParameters.VIDEO_ID);
            assert.equal(videoId, 'AiOZtKQLGW4', 'Video ID incorrect');

            const timestamp = Url.getQueryParameter(mediaUrl, AdmobUrlQueryParameters.TIMESTAMP);
            assert.equal(timestamp, '1549413290', 'Timestamp incorrect');
        });
    });

    describe('getAppStoreUrlTemplates', () => {
        it('should return correct app store url templates', () => {
            const iosStoreTemplates = ['https://itunes.apple.com'];
            assert.deepEqual(Url.getAppStoreUrlTemplates(Platform.IOS), iosStoreTemplates, 'iOS app store templates are not matching');
        });
    });
});
