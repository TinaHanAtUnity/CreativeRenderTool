import { assert } from 'chai';
import { toAbGroup, FakeEnabledABTest, FakeDisabledABTest, FilteredABTest, FakeZyngaFilteredABTest, FakeReverseABTest, FakeZyngaFilteredReverseABTest } from 'Core/Models/ABGroup';
import 'mocha';

describe('ABGroupTests', () => {
    const validGroups = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

    describe('toAbGroup', () => {
        it('should return test A/B group for number 99', () => {
            assert.equal(toAbGroup(99), 99);
        });

        it('should return a valid group for numbers between 0-19', () => {
            assert.equal(toAbGroup(validGroups[0]), 0);
            for (const i of validGroups) {
                assert.equal(toAbGroup(i), i);
            }
            assert.equal(toAbGroup(validGroups[validGroups.length - 1]), 19);
        });

        it('should return invalid group', () => {
            assert.equal(toAbGroup(-1), -1);
            assert.equal(toAbGroup(20), -1);
        });
    });

    describe('FakeEnabledABTest', () => {
        it('should return true for A/B groups 16 and 17', () => {
            assert.isTrue(FakeEnabledABTest.isValid(toAbGroup(16)));
            assert.isTrue(FakeEnabledABTest.isValid(toAbGroup(17)));
        });

        it('should return false for other A/B groups', () => {
            const invalidGroups = validGroups.filter(v => v !== 16 && v !== 17);
            for (const i of invalidGroups) {
                assert.isFalse(FakeEnabledABTest.isValid(toAbGroup(i)));
            }
        });
    });

    describe('FakeReverseABTest', () => {
        it('should return false for A/B groups 16 and 17', () => {
            assert.isFalse(FakeReverseABTest.isValid(toAbGroup(16)));
            assert.isFalse(FakeReverseABTest.isValid(toAbGroup(17)));
        });

        it('should return true for other A/B groups', () => {
            const invalidGroups = validGroups.filter(v => v !== 16 && v !== 17);
            for (const i of invalidGroups) {
                assert.isTrue(FakeReverseABTest.isValid(toAbGroup(i)));
            }
        });
    });

    describe('FakeDisabledABTest tests', () => {
        it('should return false for all A/B groups', () => {
            for (const i of validGroups) {
                assert.isFalse(FakeDisabledABTest.isValid(toAbGroup(i)));
            }
            assert.isFalse(FakeDisabledABTest.isValid(99));
            assert.isFalse(FakeDisabledABTest.isValid(-1));
        });
    });

    describe('FilteredABTest tests', () => {
        beforeEach(() => {
            FilteredABTest.setup('', undefined);
        });

        it('excluded organization ID, should return false for all A/B groups', () => {
            FilteredABTest.setup('', '3418765');

            for (const i of validGroups) {
                assert.isFalse(FakeZyngaFilteredABTest.isValid(toAbGroup(i)));
            }
            assert.isFalse(FakeZyngaFilteredABTest.isValid(99));
            assert.isFalse(FakeZyngaFilteredABTest.isValid(-1));
        });

        it('should return true for A/B groups 16 and 17', () => {
            assert.isTrue(FakeZyngaFilteredABTest.isValid(toAbGroup(16)));
            assert.isTrue(FakeZyngaFilteredABTest.isValid(toAbGroup(17)));
        });

        it('should return false for other A/B groups', () => {
            const invalidGroups = validGroups.filter(v => v !== 16 && v !== 17);
            for (const i of invalidGroups) {
                assert.isFalse(FakeZyngaFilteredABTest.isValid(toAbGroup(i)));
            }
        });
    });

    describe('ZyngaFilteredReverseABTest tests', () => {
        beforeEach(() => {
            FilteredABTest.setup('', undefined);
        });

        it('set Zynga organization ID, should return false for all A/B groups', () => {
            FilteredABTest.setup('', '3418765');

            for (const i of validGroups) {
                assert.isFalse(FakeZyngaFilteredReverseABTest.isValid(toAbGroup(i)));
            }
            assert.isFalse(FakeZyngaFilteredReverseABTest.isValid(99));
            assert.isFalse(FakeZyngaFilteredReverseABTest.isValid(-1));
        });

        it('should return false for A/B groups 16 and 17', () => {
            assert.isFalse(FakeZyngaFilteredReverseABTest.isValid(toAbGroup(16)));
            assert.isFalse(FakeZyngaFilteredReverseABTest.isValid(toAbGroup(17)));
        });

        it('should return true for other A/B groups', () => {
            const reversedGroups = validGroups.filter(v => v !== 16 && v !== 17);
            for (const i of reversedGroups) {
                assert.isTrue(FakeZyngaFilteredReverseABTest.isValid(toAbGroup(i)));
            }
        });
    });
});
