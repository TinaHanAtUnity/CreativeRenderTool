import { assert } from 'chai';
import { toAbGroup, FakeEnabledABTest, FakeDisabledABTest } from 'Core/Models/ABGroup';
import 'mocha';

describe('ABGroupTests', () => {
    const validGroups = [...Array(20).keys()];

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

    describe('FakeDisabledABTest tests', () => {
        it('should return false for all A/B groups', () => {
            for (const i of validGroups) {
                assert.isFalse(FakeDisabledABTest.isValid(toAbGroup(i)));
            }
            assert.isFalse(FakeDisabledABTest.isValid(99));
            assert.isFalse(FakeDisabledABTest.isValid(-1));
        });
    });
});
