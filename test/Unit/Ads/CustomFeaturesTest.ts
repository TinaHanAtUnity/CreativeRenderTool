import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

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

    describe('sampleAtGivenPercentage', () => {
        const tests: {
            givenPercentage: number;
            randomCalculatedPercent: number;
            expectedOutcome: boolean;
        }[] = [
            {
                givenPercentage: 0,
                randomCalculatedPercent: 99,
                expectedOutcome: false
            },
            {
                givenPercentage: 1,
                randomCalculatedPercent: 10,
                expectedOutcome: false
            },
            {
                givenPercentage: 1,
                randomCalculatedPercent: 0.9,
                expectedOutcome: true
            },
            {
                givenPercentage: 5,
                randomCalculatedPercent: 4,
                expectedOutcome: true
            },
            {
                givenPercentage: 5,
                randomCalculatedPercent: 6,
                expectedOutcome: false
            },
            {
                givenPercentage: 100,
                randomCalculatedPercent: 0,
                expectedOutcome: true
            },
            {
                givenPercentage: 100,
                randomCalculatedPercent: 100,
                expectedOutcome: true
            },
            {
                givenPercentage: 101,
                randomCalculatedPercent: 0,
                expectedOutcome: true
            },
            {
                givenPercentage: -1,
                randomCalculatedPercent: 100,
                expectedOutcome: false
            }
        ];

        tests.forEach(t => {
            const correctlyFormattedReturnedPercent = t.randomCalculatedPercent / 100;
            it(`should return ${t.expectedOutcome} for ${t.givenPercentage}% when checked against Math.random() returning ${t.randomCalculatedPercent}%`, () => {
                sinon.stub(Math, 'random').returns(correctlyFormattedReturnedPercent);
                assert.equal(CustomFeatures.sampleAtGivenPercent(t.givenPercentage), t.expectedOutcome);
            });
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

    describe('isZyngaWordsWithFriends', () => {
        const tests: {
            gameId: string;
            expected: boolean;
        }[] = [{
            gameId: '2895988', // WWF
            expected: true
        }, {
            gameId: 'scott',
            expected: false
        }];

        tests.forEach(t => {
            it('should match the expected value', () => {
                const value = CustomFeatures.isZyngaWordsWithFriends(t.gameId);
                assert.equal(value, t.expected);
            });
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
            gameId: '3054609',
            expected: true
        }, {
            gameId: '3054608',
            expected: true
        }, {
            gameId: '3238965',
            expected: true
        }, {
            gameId: '3238964',
            expected: true
        }, {
            gameId: '3238970',
            expected: true
        }, {
            gameId: '3238971',
            expected: true
        }, {
            gameId: '3238972',
            expected: true
        }, {
            gameId: '3238973',
            expected: true
        }, {
            gameId: '0001111',
            expected: false
        }, {
            gameId: '',
            expected: false
        }, {
            gameId: 'scott',
            expected: false
        }, {
            gameId: '1793545',
            expected: true
        }, {
            gameId: '1793539',
            expected: true
        }, {
            gameId: '3239343',
            expected: true
        }, {
            gameId: '3239342',
            expected: true
        }, {
            gameId: '3095066',
            expected: true
        }, {
            gameId: '3095067',
            expected: true
        }, {
            gameId: '2988442',
            expected: true
        }, {
            gameId: '3248965',
            expected: true
        }, {
            gameId: '3248964',
            expected: true
        }, {
            gameId: '3248964',
            expected: true
        }, {
            gameId: '1580822',
            expected: true
        }, {
            gameId: '1047242',
            expected: true
        }, {
            gameId: '1047241',
            expected: true
        }, {
            gameId: '3131831',
            expected: true
        }, {
            gameId: '3131830',
            expected: true
        }, {
            gameId: '3089601',
            expected: true
        }, {
            gameId: '3089600',
            expected: true
        }, {
            gameId: '3112525',
            expected: true
        }, {
            gameId: '3112524',
            expected: true
        }, {
            gameId: '108057',
            expected: true
        }, {
            gameId: '105361',
            expected: true
        }, {
            gameId: '20721',
            expected: true
        }, {
            gameId: '20723',
            expected: true
        }, {
            gameId: '112873',
            expected: true
        }, {
            gameId: '113115',
            expected: true
        }, {
            gameId: '2784703',
            expected: true
        }, {
            gameId: '3179966',
            expected: true
        }];

        tests.forEach(t => {
            it('should match the expected value', () => {
                const value = CustomFeatures.isWhiteListedForLoadApi(t.gameId);
                assert.equal(value, t.expected);
            });
        });
    });
});
