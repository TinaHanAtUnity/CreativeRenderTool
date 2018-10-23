import { assert } from 'chai';
import { ABGroupBuilder } from 'Core/Models/ABGroup';
import 'mocha';

describe('ABGroupBuilder tests', () => {
    describe('getAbGroup', () => {
        it('should give a valid group for numbers between 0-19', () => {
            for(let i = 0; i < 20; i++) {
                const abGroup = ABGroupBuilder.getAbGroup(i);
                assert.notEqual(abGroup.toNumber(), -1);
                assert.equal(abGroup.toNumber(), i);
            }
        });

        it('should give a valid group for 99', () => {
            const abGroup = ABGroupBuilder.getAbGroup(99);
            assert.notEqual(abGroup.toNumber(), -1);
            assert.equal(abGroup.toNumber(), 99);
        });

        it('should give group none when not valid', () => {
            const abGroup = ABGroupBuilder.getAbGroup(20);
            assert.equal(abGroup.toNumber(), -1);
        });
    });
});
