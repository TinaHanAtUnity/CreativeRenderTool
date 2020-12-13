import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
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
        const url = Url.addParameters('http://www.google.fi', { test: true });
        assert.equal(url, 'http://www.google.fi?test=true');
    });
    it('should add URL parameters correctly with hashbang', () => {
        const url = Url.addParameters('http://www.google.fi', { test: true }, true);
        assert.equal(url, 'http://www.google.fi#test=true');
    });
    it('should add URL parameters correctly with hashbang on existing URL with hashbang', () => {
        const url = Url.addParameters('http://www.google.fi#test=true', { secondTest: true }, true);
        assert.equal(url, 'http://www.google.fi#test=true&secondTest=true');
    });
    [
        ['http://www.google.fi?&param1=125&param2=test', 'param2', 'http://www.google.fi?&param1=125'],
        ['http://www.google.fi?&param1=125&param2=test', 'param1', 'http://www.google.fi?&param2=test'],
        ['http://www.google.fi?&param1=125&param2=test&param3=true', 'param2', 'http://www.google.fi?&param1=125&param3=true'],
        ['http://www.google.fi?&param1=125', 'param1', 'http://www.google.fi?']
    ].forEach(([originalUrl, parameter, expected]) => {
        it(`should remove ${parameter} from ${originalUrl}`, () => {
            const url = Url.removeQueryParameter(originalUrl, parameter);
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
            assert.equal(false, Url.isValid('http://example.net/"url".png'), 'invalid url was accepted, test 5');
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
    describe('getAppStoreUrlTemplates', () => {
        it('should return correct app store url templates', () => {
            const iosStoreTemplates = ['https://itunes.apple.com'];
            assert.deepEqual(Url.getAppStoreUrlTemplates(Platform.IOS), iosStoreTemplates, 'iOS app store templates are not matching');
        });
    });
    describe('isInternalTrackingProtocol', () => {
        const tests = [{
                testCase: 'should work with a properly formatted internal tracking url',
                url: 'https://tracking.prd.mz.internal.unity3d.com/queryparams',
                expectedOutcome: true
            }, {
                testCase: 'should fail because of http only',
                url: 'http://tracking.prd.mz.internal.unity3d.com/queryparams',
                expectedOutcome: false
            }, {
                testCase: 'should fail if only contained within the url sting',
                url: 'www.safedk-sucks-https://tracking.prd.mz.internal.unity3d.com/queryparams',
                expectedOutcome: false
            }];
        tests.forEach((t) => {
            it(t.testCase, () => {
                assert.equal(Url.isInternalPTSTrackingProtocol(t.url), t.expectedOutcome);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXJsVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9Db3JlL1V0aWxpdGllcy9VcmxUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN6QyxPQUFPLE9BQU8sQ0FBQztBQUVmLFFBQVEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO0lBRXJCLEVBQUUsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7UUFDbEMsTUFBTSxHQUFHLEdBQUcsZ0VBQWdFLENBQUM7UUFDN0UsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztRQUNyRixNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLDZCQUE2QixDQUFDLENBQUM7UUFDeEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFLDZCQUE2QixDQUFDLENBQUM7UUFDbEYsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztRQUNsRSxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7UUFDN0UsTUFBTSxD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