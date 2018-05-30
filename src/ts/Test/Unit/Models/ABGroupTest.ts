import 'mocha';
import { assert } from 'chai';
import { getAbGroup, GdprBaseAbTest, PlayableEndScreenHideDelayDisabledAbTest } from 'Models/ABGroup';

describe('ABGroup tests', () => {

    describe('getAbGroup', () => {
        it('should give a valid group for numbers between 0-19', () => {
            for(let i = 0; i < 20; i++) {
                const abGroup = getAbGroup(i);
                assert.notEqual(abGroup.toNumber(), -1);
                assert.equal(abGroup.toNumber(), i);
            }
        });

        it('should give a valid group for 99', () => {
            const abGroup = getAbGroup(99);
            assert.notEqual(abGroup.toNumber(), -1);
            assert.equal(abGroup.toNumber(), 99);
        });

        it('should give group none when not valid', () => {
            const abGroup = getAbGroup(20);
            assert.equal(abGroup.toNumber(), -1);
        });
    });

    describe('GdprBaseAbTest.isValid', () => {
        it('should return true for group 16', () => {
            const abGroup = getAbGroup(16);
            assert.isTrue(GdprBaseAbTest.isValid(abGroup));
        });

        it('should return true for group 17', () => {
            const abGroup = getAbGroup(17);
            assert.isTrue(GdprBaseAbTest.isValid(abGroup));
        });

        it('should return false for all groups not 16 and 17', () => {
            for (let i = -1; i < 100; i++) {
                if (i !== 16 && i !== 17) {
                    const abGroup = getAbGroup(i);
                    assert.isFalse(GdprBaseAbTest.isValid(abGroup));
                }
            }
        });
    });

    describe('PlayableEndScreenHideDelayDisabledAbTest.isValid', () => {
        it('should return true for group 18', () => {
            const abGroup = getAbGroup(18);
            assert.isTrue(PlayableEndScreenHideDelayDisabledAbTest.isValid(abGroup));
        });

        it('should return true for group 19', () => {
            const abGroup = getAbGroup(19);
            assert.isTrue(PlayableEndScreenHideDelayDisabledAbTest.isValid(abGroup));
        });

        it('should return false for all groups not 18 and 19', () => {
            for (let i = -1; i < 100; i++) {
                if (i !== 18 && i !== 19) {
                    const abGroup = getAbGroup(i);
                    assert.isFalse(PlayableEndScreenHideDelayDisabledAbTest.isValid(abGroup));
                }
            }
        });
    });
});
