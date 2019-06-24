import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { assert } from 'chai';
import 'mocha';
import { toAbGroup } from 'Core/Models/ABGroup';
import { Platform } from 'Core/Constants/Platform';

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

    describe('isSliderEndScreenEnabled', () => {
        it('should return true for iOS 9.0 if ab group is 7 and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(7), '547145938', '9.0', Platform.IOS);
            assert.isTrue(isEnabled);
        });

        it('should return true for Android 7.0 if ab group is 7 and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(7), '547145938', '7.0', Platform.ANDROID);
            assert.isTrue(isEnabled);
        });

        it('should return false if ab group is 7 and targetGameAppStoreId is not in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(7), '-1', '9.0', Platform.IOS);
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
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(7), '547145938', '4.8', Platform.ANDROID);
            assert.isFalse(isEnabled);
        });

        it('should return false if on iOS and os version is 7.x', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(7), '547145938', '7.11', Platform.IOS);
            assert.isFalse(isEnabled);
        });

        it('should return false if all conditions do not match', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '-1', '7.9', Platform.IOS);
            assert.isFalse(isEnabled);
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
            gameId: 'scott',
            expected: false
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
});
