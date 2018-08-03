System.register(["mocha", "chai", "Utilities/Url", "Constants/Platform"], function (exports_1, context_1) {
    "use strict";
    var chai_1, Url_1, Platform_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (Url_1_1) {
                Url_1 = Url_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            }
        ],
        execute: function () {
            describe('UrlTest', function () {
                it('should parse URL correctly', function () {
                    var url = 'http://www.google.fi:8000/path/to/file.txt?search=true#hash123';
                    var parsedUrl = Url_1.Url.parse(url);
                    chai_1.assert.equal(parsedUrl.pathname, '/path/to/file.txt', 'Path was parsed incorrectly');
                    chai_1.assert.equal(parsedUrl.hash, '#hash123', 'Hash was parsed incorrectly');
                    chai_1.assert.equal(parsedUrl.host, 'www.google.fi:8000', 'Host was parsed incorrectly');
                    chai_1.assert.equal(parsedUrl.hostname, 'www.google.fi', 'Hostname was parsed incorrectly');
                    chai_1.assert.equal(parsedUrl.port, 8000, 'Port was parsed incorrectly');
                    chai_1.assert.equal(parsedUrl.protocol, 'http:', 'Protocol was parsed incorrectly');
                    chai_1.assert.equal(parsedUrl.search, '?search=true', 'Query string was parsed incorrectly');
                });
                it('should add URL parameters correctly', function () {
                    var url = Url_1.Url.addParameters('http://www.google.fi', { test: true });
                    chai_1.assert.equal(url, 'http://www.google.fi?test=true');
                });
                [
                    ['http://www.google.fi?&param1=125&param2=test', 'param2', 'http://www.google.fi?&param1=125'],
                    ['http://www.google.fi?&param1=125&param2=test', 'param1', 'http://www.google.fi?&param2=test'],
                    ['http://www.google.fi?&param1=125&param2=test&param3=true', 'param2', 'http://www.google.fi?&param1=125&param3=true'],
                    ['http://www.google.fi?&param1=125', 'param1', 'http://www.google.fi?']
                ].forEach(function (_a) {
                    var originalUrl = _a[0], parameter = _a[1], expected = _a[2];
                    it("should remove " + parameter + " from " + originalUrl, function () {
                        var url = Url_1.Url.removeQueryParameter(originalUrl, parameter);
                        chai_1.assert.equal(url, expected);
                    });
                });
                describe('validation', function () {
                    it('should validate legal URLs', function () {
                        chai_1.assert.equal(true, Url_1.Url.isValid('https://www.unity3d.com'), 'valid url was not accepted');
                        chai_1.assert.equal(true, Url_1.Url.isValid('https://www.example.net/~user/dynamic$test.png'), 'valid url was not accepted');
                        chai_1.assert.equal(true, Url_1.Url.isValid('http://localhost:8000/build/dev/config.json'), 'valid url was not accepted');
                        chai_1.assert.equal(true, Url_1.Url.isValid('https://www.unity3d.com/search?foo=bar'), 'valid url was not accepted');
                        chai_1.assert.equal(true, Url_1.Url.isValid('https://www.example.net/unsafe/characters/{}|\\^~[]`'), 'valid url with unsafe (but legal) characters was not accepted');
                    });
                    it('should not validate illegal URLs', function () {
                        chai_1.assert.equal(false, Url_1.Url.isValid('rtmp://a.rtmp.youtube.com/videolive?ns=yt-live'), 'invalid url was accepted, test 1');
                        chai_1.assert.equal(false, Url_1.Url.isValid('https://example.net/"url".png'), 'invalid url was accepted, test 2');
                        chai_1.assert.equal(false, Url_1.Url.isValid(''), 'invalid url was accepted, test 3');
                        chai_1.assert.equal(false, Url_1.Url.isValid('https://bs.serving-sys.com/Serving?cn=display&c=23&pl=VAST&pli=19864721&PluID=0&pos=9317&ncu=https://i.w55c.net/cl?t=1&btid=YTdmNGEwZTItZGJmYi00YWJmLTgxYTYtOGQ1Y2QxNDE0YjU0fFRGdVE2WmU1T0p8MTQ4MjQyODcyMTAyNHwxfDBGUkxJUmFKejF8MFJkUlU2cmgyMHwzMGM1ZWY3YS1iNTk0LTRjMzEtODQ1OC02ZmM3YTdjZDQ5MzFfZ2FfR0VOX0VYfDI1ODIzMzd8fHx8MTcuMFB8VVNE&ei=TREMOR&rurl=&ord=2611507143758033&cim=1\n\n\n<SCRIPT  language=\'JavaScript1.1\' SRC=\"https://pixel.adsafeprotected.com/rjss/st/69577/12006978/skeleton.js\"></SCRIPT>\n<NOSCRIPT><IMG SRC=\"https://pixel.adsafeprotected.com/rfw/st/69577/12006977/skeleton.gif\" BORDER=0 WIDTH=1 HEIGHT=1 ALT=\"\"></NOSCRIPT>&cb=1482428721026'), 'invalid url was accepted, test 4');
                    });
                });
                describe('encoding', function () {
                    it('should encode unsafe characters', function () {
                        var url = 'http://test.com?param=|Hello[]^\\';
                        chai_1.assert.equal(Url_1.Url.encode(url), 'http://test.com?param=%7CHello%5B%5D%5E%5C', 'Url not encoded as expected');
                    });
                    it('should not encode already encoded stuff', function () {
                        var url = 'http://test.com?param=|Hello|%20|HelloAgain|';
                        chai_1.assert.equal(Url_1.Url.encode(url), 'http://test.com?param=%7CHello%7C%20%7CHelloAgain%7C', 'Url not encoded as expected');
                    });
                    it('should encode utf8 characters', function () {
                        var url = 'http://test.com?param=%7CHello%7C%20%7CHelloAgain%7C/FRVideo19unity封面.png';
                        chai_1.assert.equal(Url_1.Url.encode(url), 'http://test.com?param=%7CHello%7C%20%7CHelloAgain%7C/FRVideo19unity%E5%B0%81%E9%9D%A2.png', 'Url not encoded as expected');
                    });
                    it('should encode %', function () {
                        var url = 'http://test.com?param=%7C%%7C%25';
                        chai_1.assert.equal(Url_1.Url.encode(url), 'http://test.com?param=%7C%25%7C%25', 'Url not encoded as expected');
                    });
                    it('should encode % in the end', function () {
                        var url = 'http://test.com?param=%';
                        chai_1.assert.equal(Url_1.Url.encode(url), 'http://test.com?param=%25', 'Url not encoded as expected');
                    });
                    it('should encode % in wrong url escape', function () {
                        var url = 'http://test.com?param=%2';
                        chai_1.assert.equal(Url_1.Url.encode(url), 'http://test.com?param=%252', 'Url not encoded as expected');
                    });
                    it('should encode % in wrong url escape with letters', function () {
                        var url = 'http://test.com?param=%wb';
                        chai_1.assert.equal(Url_1.Url.encode(url), 'http://test.com?param=%25wb', 'Url not encoded as expected');
                    });
                });
                describe('validating UTF-8', function () {
                    it('should allow unicode utf-8 characters', function () {
                        var url = 'https://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                        chai_1.assert.isTrue(Url_1.Url.isValid(url), 'Should allow unicode characters, test 1');
                        url = 'https://cdn.unityads.unity3d.com/assets/f28676c2-5feb-4aa7-94fb-70c9c901cd57/800×600.png';
                        chai_1.assert.isTrue(Url_1.Url.isValid(url), 'Should allow unicode characters, test 2');
                    });
                });
                describe('whitelisting IOS', function () {
                    it('should return true', function () {
                        ['itunes', 'itms', 'itmss', 'http', 'https'].forEach(function (protocol) {
                            var url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                            chai_1.assert.isTrue(Url_1.Url.isProtocolWhitelisted(url, Platform_1.Platform.IOS), "for protocol " + protocol);
                        });
                    });
                    it('should return false', function () {
                        ['market', 'tcp', 'bla'].forEach(function (protocol) {
                            var url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                            chai_1.assert.isFalse(Url_1.Url.isProtocolWhitelisted(url, Platform_1.Platform.IOS), "for protocol " + protocol);
                        });
                    });
                });
                describe('whitelisting ANDROID', function () {
                    it('should return true', function () {
                        ['market', 'http', 'https'].forEach(function (protocol) {
                            var url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                            chai_1.assert.isTrue(Url_1.Url.isProtocolWhitelisted(url, Platform_1.Platform.ANDROID), "for protocol " + protocol);
                        });
                    });
                    it('should return false', function () {
                        ['itunes', 'itmss', 'itms', 'bla'].forEach(function (protocol) {
                            var url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                            chai_1.assert.isFalse(Url_1.Url.isProtocolWhitelisted(url, Platform_1.Platform.ANDROID), "for protocol " + protocol);
                        });
                    });
                });
                describe('whitelisting TEST', function () {
                    it('should always return false', function () {
                        ['market', 'http', 'https', 'itmss', 'itunes', 'itms'].forEach(function (protocol) {
                            var url = protocol + '://cdn-highwinds.unityads.unity3d.com/assets/29587943-3ee9-4490-a181-de372e9c7097/FRVideo19unity封面.png';
                            chai_1.assert.isFalse(Url_1.Url.isProtocolWhitelisted(url, Platform_1.Platform.TEST), "for protocol " + protocol);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXJsVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlVybFRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQU1BLFFBQVEsQ0FBQyxTQUFTLEVBQUU7Z0JBRWhCLEVBQUUsQ0FBQyw0QkFBNEIsRUFBRTtvQkFDN0IsSUFBTSxHQUFHLEdBQUcsZ0VBQWdFLENBQUM7b0JBQzdFLElBQU0sU0FBUyxHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2pDLGFBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO29CQUNyRixhQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLDZCQUE2QixDQUFDLENBQUM7b0JBQ3hFLGFBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO29CQUNsRixhQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLGlDQUFpQyxDQUFDLENBQUM7b0JBQ3JGLGFBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztvQkFDbEUsYUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO29CQUM3RSxhQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7Z0JBQzFGLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRTtvQkFDdEMsSUFBTSxHQUFHLEdBQVcsU0FBRyxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxFQUFDLElBQUksRUFB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