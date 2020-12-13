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
        const tests = [
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
    describe('isZyngaDealGame', () => {
        const tests = [{
                gameId: '2895988',
                expected: true
            }, {
                gameId: '2988494',
                expected: true // Zynga solitaire
            }, {
                gameId: 'scott',
                expected: false
            }];
        tests.forEach(t => {
            it('should match the expected value', () => {
                const value = CustomFeatures.isZyngaDealGame(t.gameId);
                assert.equal(value, t.expected);
            });
        });
    });
    describe('isFanateeExtermaxGameForLoad', () => {
        const tests = [{
                gameId: '56659',
                expected: true
            }, {
                gameId: '1225669',
                expected: true
            }, {
                gameId: '20721',
                expected: true
            }, {
                gameId: '89611',
                expected: true
            }, {
                gameId: '1781085',
                expected: true
            }, {
                gameId: '12256',
                expected: false
            }, {
                gameId: 'scott',
                expected: false
            }];
        tests.forEach(t => {
            it('should match the expected value', () => {
                const value = CustomFeatures.isFanateeExtermaxGameForLoad(t.gameId);
                assert.equal(value, t.expected);
            });
        });
    });
    describe('check double click start', () => {
        it('should be false for non double click', () => {
            const val = CustomFeatures.isDoubleClickGoogle('doubleclickbygoogle.casdfasfasfd');
            assert.equal(val, false);
        });
        it('should be true for double click starty', () => {
            const val = CustomFeatures.isDoubleClickGoogle('doubleclickbygoogle.com-bboyeah');
            assert.equal(val, true);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tRmVhdHVyZXNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9DdXN0b21GZWF0dXJlc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUvQixRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO0lBRTVCLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDN0IsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtZQUM3QyxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO1lBQzdDLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxtRUFBbUUsRUFBRSxHQUFHLEVBQUU7WUFDekUsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1FBQ3JDLE1BQU0sS0FBSyxHQUlMO1lBQ0Y7Z0JBQ0ksZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLHVCQUF1QixFQUFFLEVBQUU7Z0JBQzNCLGVBQWUsRUFBRSxLQUFLO2FBQ3pCO1lBQ0Q7Z0JBQ0ksZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLHVCQUF1QixFQUFFLEVBQUU7Z0JBQzNCLGVBQWUsRUFBRSxLQUFLO2FBQ3pCO1lBQ0Q7Z0JBQ0ksZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLHVCQUF1QixFQUFFLEdBQUc7Z0JBQzVCLGVBQWUsRUFBRSxJQUFJO2FBQ3hCO1lBQ0Q7Z0JBQ0ksZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLHVCQUF1QixFQUFFLENBQUM7Z0JBQzFCLGVBQWUsRUFBRSxJQUFJO2FBQ3hCO1lBQ0Q7Z0JBQ0ksZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLHVCQUF1QixFQUFFLENBQUM7Z0JBQzFCLGVBQWUsRUFBRSxLQUFLO2FBQ3pCO1lBQ0Q7Z0JBQ0ksZUFBZSxFQUFFLEdBQUc7Z0JBQ3BCLHVCQUF1QixFQUFFLENBQUM7Z0JBQzFCLGVBQWUsRUFBRSxJQUFJO2FBQ3hCO1lBQ0Q7Z0JBQ0ksZUFBZSxFQUFFLEdBQUc7Z0JBQ3BCLHVCQUF1QixFQUFFLEdBQUc7Z0JBQzVCLGVBQWUsRUFBRSxJQUFJO2FBQ3hCO1lBQ0Q7Z0JBQ0ksZUFBZSxFQUFFLEdBQUc7Z0JBQ3BCLHVCQUF1QixFQUFFLENBQUM7Z0JBQzFCLGVBQWUsRUFBRSxJQUFJO2FBQ3hCO1lBQ0Q7Z0JBQ0ksZUFBZSxFQUFFLENBQUMsQ0FBQztnQkFDbkIsdUJBQXVCLEVBQUUsR0FBRztnQkFDNUIsZUFBZSxFQUFFLEtBQUs7YUFDekI7U0FDSixDQUFDO1FBRUYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNkLE1BQU0saUNBQWlDLEdBQUcsQ0FBQyxDQUFDLHVCQUF1QixHQUFHLEdBQUcsQ0FBQztZQUMxRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxlQUFlLFFBQVEsQ0FBQyxDQUFDLGVBQWUsa0RBQWtELENBQUMsQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLEdBQUcsRUFBRTtnQkFDL0ksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7Z0JBQ3RFLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDNUYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7UUFDMUIsRUFBRSxDQUFDLHlDQUF5QyxFQUFFLEdBQUcsRUFBRTtZQUMvQyxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1lBQy9DLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx1RUFBdUUsRUFBRSxHQUFHLEVBQUU7WUFDN0UsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyRCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBQ3BDLEVBQUUsQ0FBQywwREFBMEQsRUFBRSxHQUFHLEVBQUU7WUFDaEUsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsMkRBQTJELEVBQUUsR0FBRyxFQUFFO1lBQ2pFLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvRCxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHdEQUF3RCxFQUFFLEdBQUcsRUFBRTtZQUM5RCxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7WUFDOUMsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDN0IsTUFBTSxLQUFLLEdBR0wsQ0FBQztnQkFDSCxNQUFNLEVBQUUsU0FBUztnQkFDakIsUUFBUSxFQUFFLElBQUk7YUFDakIsRUFBRTtnQkFDQyxNQUFNLEVBQUUsU0FBUztnQkFDakIsUUFBUSxFQUFFLElBQUksQ0FBQyxrQkFBa0I7YUFDcEMsRUFBRTtnQkFDQyxNQUFNLEVBQUUsT0FBTztnQkFDZixRQUFRLEVBQUUsS0FBSzthQUNsQixDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2QsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtnQkFDdkMsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZELE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1FBQzFDLE1BQU0sS0FBSyxHQUdMLENBQUM7Z0JBQ0gsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsUUFBUSxFQUFFLElBQUk7YUFDakIsRUFBRTtnQkFDQyxNQUFNLEVBQUUsU0FBUztnQkFDakIsUUFBUSxFQUFFLElBQUk7YUFDakIsRUFBRTtnQkFDQyxNQUFNLEVBQUUsT0FBTztnQkFDZixRQUFRLEVBQUUsSUFBSTthQUNqQixFQUFFO2dCQUNDLE1BQU0sRUFBRSxPQUFPO2dCQUNmLFFBQVEsRUFBRSxJQUFJO2FBQ2pCLEVBQUU7Z0JBQ0MsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLFFBQVEsRUFBRSxJQUFJO2FBQ2pCLEVBQUU7Z0JBQ0MsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsUUFBUSxFQUFFLEtBQUs7YUFDbEIsRUFBRTtnQkFDQyxNQUFNLEVBQUUsT0FBTztnQkFDZixRQUFRLEVBQUUsS0FBSzthQUNsQixDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2QsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtnQkFDdkMsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7UUFDdEMsRUFBRSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtZQUM1QyxNQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsbUJBQW1CLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUNuRixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7WUFDOUMsTUFBTSxHQUFHLEdBQUcsY0FBYyxDQUFDLG1CQUFtQixDQUFDLGlDQUFpQyxDQUFDLENBQUM7WUFDbEYsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=