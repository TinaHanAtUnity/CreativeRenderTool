import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { assert } from 'chai';
import 'mocha';

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

    describe('isMixedPlacementExperiment', () => {
        it('should return true if gameId is 1543512', () => {
            const value = CustomFeatures.isMixedPlacementExperiment('1543512');
            assert.isTrue(value);
        });

        it('should return true if gameId is 1003628', () => {
            const value = CustomFeatures.isMixedPlacementExperiment('1003628');
            assert.isTrue(value);
        });

        it('should return true if gameId is 1042745', () => {
            const value = CustomFeatures.isMixedPlacementExperiment('1042745');
            assert.isTrue(value);
        });

        it('should return true if gameId is 1543513', () => {
            const value = CustomFeatures.isMixedPlacementExperiment('1543513');
            assert.isTrue(value);
        });

        it('should return false if gameId is anything besides 1543512 and 1003628', () => {
            const value = CustomFeatures.isMixedPlacementExperiment('asdfasdf');
            assert.isFalse(value);
        });
    });
});
