import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { assert } from 'chai';
import 'mocha';
import { toAbGroup } from 'Core/Models/ABGroup';
import { Platform } from 'Core/Constants/Platform';
import * as sinon from 'sinon';

// Only for the slider experiment
const invalidABGroup: number = 7;

describe('CustomFeatures', () => {

    describe('isExampleGameId', () => {
        it('should return true if gameId is 14850', () => {
            const value = CustomFeatures.isExampleGameId('14850');
            assert.isTrue(value);
        });

        it('should return true if gameId is 14851', () => {
            const value = CustomFeatures.isExampleGameId('14851');
            assert.isTrue(value);
        });

        it('should return false if gameId is anything besides 14850 and 14851', () => {
            const value = CustomFeatures.isExampleGameId('14852');
            assert.isFalse(value);
        });
    });

    describe('sampleAtGivenPercentage', () => {
        const tests: {
            givenPercentage: number;
            randomCalculatedPercent: number;
            expectedOutcome: boolean;
        }[] = [
            {
                givenPercentage: 0,
                randomCalculatedPercent: 99,
                expectedOutcome: false
            },
            {
                givenPercentage: 1,
                randomCalculatedPercent: 10,
                expectedOutcome: false
            },
            {
                givenPercentage: 1,
                randomCalculatedPercent: 0.9,
                expectedOutcome: true
            },
            {
                givenPercentage: 5,
                randomCalculatedPercent: 4,
                expectedOutcome: true
            },
            {
                givenPercentage: 5,
                randomCalculatedPercent: 6,
                expectedOutcome: false
            },
            {
                givenPercentage: 100,
                randomCalculatedPercent: 0,
                expectedOutcome: true
            },
            {
                givenPercentage: 100,
                randomCalculatedPercent: 100,
                expectedOutcome: true
            },
            {
                givenPercentage: 101,
                randomCalculatedPercent: 0,
                expectedOutcome: true
            },
            {
                givenPercentage: -1,
                randomCalculatedPercent: 100,
                expectedOutcome: false
            }
        ];

        tests.forEach(t => {
            const correctlyFormattedReturnedPercent = t.randomCalculatedPercent / 100;
            it(`should return ${t.expectedOutcome} for ${t.givenPercentage}% when checked against Math.random() returning ${t.randomCalculatedPercent}%`, () => {
                sinon.stub(Math, 'random').returns(correctlyFormattedReturnedPercent);
                assert.equal(CustomFeatures.sampleAtGivenPercent(t.givenPercentage), t.expectedOutcome);
            });
        });
    });

    describe('isTimehopApp', () => {
        it('should return true if gameId is 1300023', () => {
            const value = CustomFeatures.isTimehopApp('1300023');
            assert.isTrue(value);
        });

        it('should return true if gameId is 1300024', () => {
            const value = CustomFeatures.isTimehopApp('1300024');
            assert.isTrue(value);
        });

        it('should return false if gameId is anything besides 1300023 and 1300024', () => {
            const value = CustomFeatures.isTimehopApp('1300025');
            assert.isFalse(value);
        });
    });

    describe('isCloseIconSkipEnabled', () => {
        it('should return true if gameId is 2808037 (Cheetah GameID)', () => {
            const value = CustomFeatures.isCloseIconSkipEnabled('2808037');
            assert.isTrue(value);
        });

        it('should return true if gameId is 2907326 (Bitmango GameID)', () => {
            const value = CustomFeatures.isCloseIconSkipEnabled('2907326');
            assert.isTrue(value);
        });

        it('should return true if gameId is 1558951 (Game7 GameID)', () => {
            const value = CustomFeatures.isCloseIconSkipEnabled('1558951');
            assert.isTrue(value);
        });

        it('should return false if gameId is 99999', () => {
            const value = CustomFeatures.isCloseIconSkipEnabled('99999');
            assert.isFalse(value);
        });
    });

    describe('isPartOfPhaseTwoRollout', () => {
        const tests: {
            gameId: string;
            expected: boolean;
        }[] = [{
            gameId: '2895988', // WWF
            expected: true
        }, {
            gameId: '2988443', // Zynga Solitaire
            expected: true
        }, {
            gameId: 'scott',
            expected: false
        }];

        tests.forEach(t => {
            it('should match the expected value', () => {
                const value = CustomFeatures.isPartOfPhaseTwoLoadRollout(t.gameId);
                assert.equal(value, t.expected);
            });
        });
    });

    describe('isWhiteListedForLoadApi', () => {
        const tests: {
            gameId: string;
            expected: boolean;
        }[] = [{
            gameId: '2988495',
            expected: true
        }, {
            gameId: '2988494',
            expected: true
        }, {
            gameId: '2988443',
            expected: true
        }, {
            gameId: '3054609',
            expected: true
        }, {
            gameId: '3054608',
            expected: true
        }, {
            gameId: '3238965',
            expected: true
        }, {
            gameId: '3238964',
            expected: true
        }, {
            gameId: '3238970',
            expected: true
        }, {
            gameId: '3238971',
            expected: true
        }, {
            gameId: '3238972',
            expected: true
        }, {
            gameId: '3238973',
            expected: true
        }, {
            gameId: '0001111',
            expected: false
        }, {
            gameId: '',
            expected: false
        }, {
            gameId: 'scott',
            expected: false
        }, {
            gameId: '1793545',
            expected: true
        }, {
            gameId: '1793539',
            expected: true
        }, {
            gameId: '3239343',
            expected: true
        }, {
            gameId: '3239342',
            expected: true
        }, {
            gameId: '3095066',
            expected: true
        }, {
            gameId: '3095067',
            expected: true
        }, {
            gameId: '2988442',
            expected: true
        }, {
            gameId: '3248965',
            expected: true
        }, {
            gameId: '3248964',
            expected: true
        }, {
            gameId: '3248964',
            expected: true
        }, {
            gameId: '1580822',
            expected: true
        }, {
            gameId: '1047242',
            expected: true
        }, {
            gameId: '1047241',
            expected: true
        }, {
            gameId: '3131831',
            expected: true
        }, {
            gameId: '3131830',
            expected: true
        }, {
            gameId: '3089601',
            expected: true
        }, {
            gameId: '3089600',
            expected: true
        }, {
            gameId: '3112525',
            expected: true
        }, {
            gameId: '3112524',
            expected: true
        }, {
            gameId: '108057',
            expected: true
        }, {
            gameId: '105361',
            expected: true
        }, {
            gameId: '20721',
            expected: true
        }, {
            gameId: '20723',
            expected: true
        }, {
            gameId: '112873',
            expected: true
        }, {
            gameId: '113115',
            expected: true
        }, {
            gameId: '2784703',
            expected: true
        }, {
            gameId: '3179966',
            expected: true
        }];

        tests.forEach(t => {
            it('should match the expected value', () => {
                const value = CustomFeatures.isWhiteListedForLoadApi(t.gameId);
                assert.equal(value, t.expected);
            });
        });
    });

    describe('isTrackedGameUsingLoadApi', () => {
        const tests: {
            gameId: string;
            expected: boolean;
        }[] = [{
            gameId: '2988443',
            expected: true
        }, {
            gameId: '2988494',
            expected: false
        }, {
            gameId: '1234556',
            expected: false
        }];

        tests.forEach(t => {
            it('should match the expected value', () => {
                const value = CustomFeatures.isTrackedGameUsingLoadApi(t.gameId);
                assert.equal(value, t.expected);
            });
        });
    });

    describe('isSliderEndScreenEnabled', () => {
        it(`should return false for iOS 9.0 if ab group is ${invalidABGroup} and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.`, () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '9.0', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it(`should return false for Android 7.0 if ab group is ${invalidABGroup} and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.`, () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '7.0', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it(`should return false if ab group is ${invalidABGroup} and targetGameAppStoreId is not in the SliderEndScreenTargetGameIds.`, () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '-1', '9.0', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if ab group is 1 and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '547145938', '9.0', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it('should return false if ab group is 1 and targetGameAppStoreId is not in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '-1', '9.0', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if on Android and os version is 4.x', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '4.8', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it('should return false if on iOS and os version is 7.x', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '7.11', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if all conditions do not match', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '-1', '7.9', Platform.IOS);
            assert.isFalse(isEnabled);
        });
    });

    describe('isSliderEndScreenEnabled', () => {
        it(`should return false for iOS 9.0 if ab group is ${invalidABGroup} and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.`, () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '9.0', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it(`should return false for Android 7.0 if ab group is ${invalidABGroup} and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.`, () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '7.0', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it(`should return false if ab group is ${invalidABGroup} and targetGameAppStoreId is not in the SliderEndScreenTargetGameIds.`, () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '-1', '9.0', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if ab group is 1 and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '547145938', '9.0', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it('should return false if ab group is 1 and targetGameAppStoreId is not in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '-1', '9.0', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if on Android and os version is 4.x', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '4.8', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it('should return false if on iOS and os version is 7.x', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '7.11', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if all conditions do not match', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '-1', '7.9', Platform.IOS);
            assert.isFalse(isEnabled);
        });
    });

    describe('isSliderEndScreenEnabled', () => {
        it(`should return false for iOS 9.0 if ab group is ${invalidABGroup} and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.`, () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '9.0', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it(`should return false for Android 7.0 if ab group is ${invalidABGroup} and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.`, () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '7.0', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it(`should return false if ab group is ${invalidABGroup} and targetGameAppStoreId is not in the SliderEndScreenTargetGameIds.`, () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '-1', '9.0', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if ab group is 1 and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '547145938', '9.0', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it('should return false if ab group is 1 and targetGameAppStoreId is not in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '-1', '9.0', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if on Android and os version is 4.x', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '4.8', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it('should return false if on iOS and os version is 7.x', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(invalidABGroup), '547145938', '7.11', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if all conditions do not match', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '-1', '7.9', Platform.IOS);
            assert.isFalse(isEnabled);
        });
    });

    describe('isParallaxEndScreenEnabled', () => {
        const existingGameId = 500010005;
        const enabledAbGroups = [toAbGroup(5), toAbGroup(6)];
        const validScreenSize = {
            width: 3,
            height: 5
        };

        let newInnerHeight: number;
        let newInnerWidth: number;
        let userAgent: string;

        let navigatorStub: any;
        let innerWidthStub: any;
        let innerHeightStub: any;

        beforeEach(() => {
            // use valid useragent and screensize by default
            userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/76.0.253539693 Mobile/16F203 Safari/604.1';
            newInnerHeight = validScreenSize.height;
            newInnerWidth = validScreenSize.width;

            navigatorStub = sinon.stub(navigator, 'userAgent').get(() => userAgent);
            innerWidthStub = sinon.stub(window, 'innerWidth').get(() => newInnerWidth);
            innerHeightStub = sinon.stub(window, 'innerHeight').get(() => newInnerHeight);
        });

        afterEach(() => {
            navigatorStub.restore();
            innerWidthStub.restore();
            innerHeightStub.restore();
        });

        describe('Device model', () => {
            it('should return false on older Samsung devices', () => {
                // A5, A3 2015, A3 2016, Note Edge, Young 2, Galaxy Alpha, Galaxy Grand Prime, Galaxy Ace, S5, S4, Pocket Neo
                const deviceUserAgents = [
                    'Mozilla/5.0 (Linux; Android 5.0.2; SAMSUNG SM-A500FU Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/3.3 Chrome/38.0.2125.102 Mobile Safari/537.36',
                    'Mozilla/5.0 (Linux; Android 5.0.2; SAMSUNG SM-A300FU Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.2 Chrome/59.0.3071.125 Mobile Safari/537.36',
                    'Mozilla/5.0 (Linux; Android 5.1.1; SAMSUNG SM-A310F Build/LMY47X) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/3.5 Chrome/38.0.2125.102 Mobile Safari/537.36',
                    'Mozilla/5.0 (Linux; Android 6.0.1; SM-N910V Build/MMB29M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36',
                    'Mozilla/5.0 (Linux; Android 4.4.2; SM-G130H Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36',
                    'Mozilla/5.0 (Linux; Android 5.0.2; SAMSUNG SM-G850F Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/2.1 Chrome/34.0.1847.76 Mobile Safari/537.36',
                    'Mozilla/5.0 (Linux; U; Android 4.4.4; en-us; G530 Build/JDQ39) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
                    'Mozilla/5.0 (Linux; Android 4.4.2; SM-G310HN Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36',
                    'Mozilla/5.0 (Linux; U; Android 4.4.2; tr-tr; SM-G900 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
                    'Mozilla/5.0 (Linux; U; Android 4.1.1; en-us; GT-I19500 Build/JRO03S) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30',
                    'Mozilla/5.0 (Linux; U; Android 4.1.2; en-gb; GT-S5312 Build/JZO54K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'
                ];

                deviceUserAgents.forEach(deviceUserAgent => {
                    userAgent = deviceUserAgent;
                    const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(enabledAbGroups[0], existingGameId);
                    assert.isFalse(isEnabled);
                });
            });

            it('should return true on newer Samsung devices', () => {
                // S6, S7, S8, S9
                const deviceUserAgents = [
                    'Mozilla/5.0 (Linux; Android 6.0.1; SM-G920S Build/MMB29K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/50.0.2661.86 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/79.0.0.18.71;]',
                    'mozilla/5.0 (linux; android 7.1.1; sm-g930 build/kot49h) applewebkit/537.36 (khtml, like gecko) version/4.0 chrome/30.0.0.0 mobile safari/537.36',
                    'Mozilla/5.0 (Linux; Android 7.0; SM-G950 Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/39.0.0.0 Mobile Safari/537.36',
                    'Mozilla/5.0 (Linux; Android 4.4.2; SM-G960 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.105 Mobile Safari/537.36'
                ];

                deviceUserAgents.forEach(deviceUserAgent => {
                    userAgent = deviceUserAgent;
                    const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(enabledAbGroups[0], existingGameId);
                    assert.isTrue(isEnabled);
                });
            });

            it('should return true if device is iPhone', () => {
                userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/76.0.253539693 Mobile/16F203 Safari/604.1';
                const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(enabledAbGroups[0], existingGameId);
                assert.isTrue(isEnabled);
            });
        });

        describe('Aspect ratio', () => {
            it('should return false if aspect ratio is 4:3', () => {
                newInnerHeight = 4;
                newInnerWidth = 3;
                const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(enabledAbGroups[0], existingGameId);
                assert.isFalse(isEnabled);
            });

            it('should return false if aspect ratio is smaller than 4:3', () => {
                newInnerHeight = 3.5;
                newInnerWidth = 3;
                const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(enabledAbGroups[0], existingGameId);
                assert.isFalse(isEnabled);
            });

            it('should return true if aspect ratio is bigger than 4:3', () => {
                newInnerHeight = 5;
                newInnerWidth = 3;
                const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(enabledAbGroups[0], existingGameId);
                assert.isTrue(isEnabled);
            });
        });

        describe('Game ID', () => {
            it('should return false if there are no assets for the given game ID', () => {
                const nonExistingGameId = -1;
                const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(enabledAbGroups[0], nonExistingGameId);
                assert.isFalse(isEnabled);
            });

            it('should return true if there are assets for the given game ID', () => {
                const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(enabledAbGroups[0], existingGameId);
                assert.isTrue(isEnabled);
            });
        });

        describe('AB group', () => {
            it('should return true if experiment is enabled for the given AB group', () => {
                enabledAbGroups.forEach(abGroup => {
                    const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(abGroup, existingGameId);
                    assert.isTrue(isEnabled);
                });
            });

            it('should return false if experiment is disabled for the given AB group', () => {
                const disabledGroup = toAbGroup(16);
                const isEnabled = CustomFeatures.isParallaxEndScreenEnabled(disabledGroup, existingGameId);
                assert.isFalse(isEnabled);
            });
        });
    });
});
