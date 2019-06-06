import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { assert } from 'chai';
import 'mocha';
import { ABGroup } from 'Core/Models/ABGroup';

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
            abGroup: ABGroup;
            expected: boolean;
        }[] = [{
            gameId: '2988443',
            abGroup: 14,
            expected: true
        }, {
            gameId: '2988443',
            abGroup: 16,
            expected: false
        }, {
            gameId: '1234556',
            abGroup: 14,
            expected: false
        }];

        tests.forEach(t => {
            it('should match the expected value', () => {
                const value = CustomFeatures.isTrackedGameUsingLoadApi(t.gameId, t.abGroup);
                assert.equal(value, t.expected);
            });
        });
    });
});
