import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { assert } from 'chai';
import 'mocha';
import { toAbGroup } from 'Core/Models/ABGroup';

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
        it('should return true if ab group is 7 and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(7), '547145938');
            assert.isTrue(isEnabled);
        });

        it('should return false if ab group is 7 and targetGameAppStoreId is not in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(7), '-1');
            assert.isFalse(isEnabled);
        });

        it('should return false if ab group is 1 and targetGameAppStoreId is in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '547145938');
            assert.isFalse(isEnabled);
        });

        it('should return false if ab group is 1 and targetGameAppStoreId is not in the SliderEndScreenTargetGameIds.', () => {
            const isEnabled = CustomFeatures.isSliderEndScreenEnabled(toAbGroup(1), '-1');
            assert.isFalse(isEnabled);
        });
    });
});
