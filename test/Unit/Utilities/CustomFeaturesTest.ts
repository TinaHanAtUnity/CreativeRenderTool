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

    describe('isAlwaysAutobatching', () => {
        it('should return true for gameId 1448666', () => {
            const value = CustomFeatures.isAlwaysAutobatching('1448666');
            assert.isTrue(value);
        });

        it('should return false if gameId is anything besides 1448666', () => {
            const value = CustomFeatures.isAlwaysAutobatching('14851');
            assert.isFalse(value);
        });
    });
});
