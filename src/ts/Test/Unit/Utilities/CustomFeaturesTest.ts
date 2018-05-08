import 'mocha';
import { assert } from 'chai';
import { CustomFeatures } from 'Utilities/CustomFeatures';

describe('CustomFeatures', () => {

    describe('isIosVideoCachingEnabled', () => {

        it('should return true if group is 14', () => {
            const enabled = CustomFeatures.isIosVideoCachingEnabled(14);
            assert.isTrue(enabled);
        });

        it('should return true if group is 15', () => {
            const enabled = CustomFeatures.isIosVideoCachingEnabled(15);
            assert.isTrue(enabled);
        });

        it('should return false if group is anything besides 14 and 15', () => {
            for (let i = 0; i <= 100; i++) {
                if (i !== 14 && i !== 15) {
                    const enabled = CustomFeatures.isIosVideoCachingEnabled(i);
                    assert.isFalse(enabled);
                }
            }
        });
    });

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

});
