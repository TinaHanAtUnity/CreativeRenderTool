import 'mocha';
import { assert } from 'chai';
import { Polyfiller } from 'Core/Utilities/Polyfiller';
describe('PolyfillerTest', () => {
    const tests = [{
            testCase: 'With an empty map',
            map: {},
            valuesToTest: [],
            expectedOutcome: true
        }, {
            testCase: 'With a populated map with string keys and incorrect values',
            map: {
                'key': 1
            },
            valuesToTest: [],
            expectedOutcome: false
        }, {
            testCase: 'With a populated map with string keys and correct values',
            map: {
                'key': 1
            },
            valuesToTest: [1],
            expectedOutcome: true
        }, {
            testCase: 'With a populated map with number keys and incorrect values',
            map: {
                key: 1
            },
            valuesToTest: [],
            expectedOutcome: false
        }, {
            testCase: 'With a populated map with number keys and correct values',
            map: {
                key: 1
            },
            valuesToTest: [1],
            expectedOutcome: true
        }, {
            testCase: 'With a populated map and multiple correct values',
            map: {
                key: 1,
                key2: 2,
                key3: 3
            },
            valuesToTest: [1, 2, 3],
            expectedOutcome: true
        }, {
            testCase: 'With a populated map and multiple correct values of complex types',
            map: {
                key: {
                    nestedKey: 1
                },
                key2: {
                    nestedKey2: '1'
                },
                key3: {
                    nestedKey3: {
                        'doublyNestedKey': 1
                    }
                }
            },
            valuesToTest: [{ nestedKey: 1 }, { nestedKey2: '1' }, { nestedKey3: { 'doublyNestedKey': 1 } }],
            expectedOutcome: true
        }, {
            testCase: 'With a populated map and multiple values of complex types with a single incorrect field',
            map: {
                key: {
                    nestedKey: 1
                },
                key2: {
                    nestedKey2: '1'
                },
                key3: {
                    nestedKey3: {
                        'doublyNestedKey': 'BAD KEY TO TEST'
                    }
                }
            },
            valuesToTest: [{ nestedKey: 1 }, { nestedKey2: '1' }, { nestedKey3: { 'doublyNestedKey': 'SHOULD FAIL BECAUSE OF THIS' } }],
            expectedOutcome: false
        }];
    describe('getObjectValuesFunction', () => {
        tests.forEach((t) => {
            it(`${t.testCase}`, () => {
                const assumedValues = Polyfiller.getObjectValuesFunction()(t.map);
                if (t.expectedOutcome) {
                    assert.deepEqual(t.valuesToTest, assumedValues);
                }
                else {
                    assert.notDeepEqual(t.valuesToTest, assumedValues);
                }
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9seWZpbGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9VdGlsaXRpZXMvUG9seWZpbGxlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTlCLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV2RCxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO0lBRTVCLE1BQU0sS0FBSyxHQUtMLENBQUM7WUFDSCxRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLEdBQUcsRUFBRSxFQUFFO1lBQ1AsWUFBWSxFQUFFLEVBQUU7WUFDaEIsZUFBZSxFQUFFLElBQUk7U0FDeEIsRUFBRTtZQUNDLFFBQVEsRUFBRSw0REFBNEQ7WUFDdEUsR0FBRyxFQUFFO2dCQUNELEtBQUssRUFBRSxDQUFDO2FBQ1g7WUFDRCxZQUFZLEVBQUUsRUFBRTtZQUNoQixlQUFlLEVBQUUsS0FBSztTQUN6QixFQUFFO1lBQ0MsUUFBUSxFQUFFLDBEQUEwRDtZQUNwRSxHQUFHLEVBQUU7Z0JBQ0QsS0FBSyxFQUFFLENBQUM7YUFDWDtZQUNELFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQixlQUFlLEVBQUUsSUFBSTtTQUN4QixFQUFFO1lBQ0MsUUFBUSxFQUFFLDREQUE0RDtZQUN0RSxHQUFHLEVBQUU7Z0JBQ0QsR0FBRyxFQUFFLENBQUM7YUFDVDtZQUNELFlBQVksRUFBRSxFQUFFO1lBQ2hCLGVBQWUsRUFBRSxLQUFLO1NBQ3pCLEVBQUU7WUFDQyxRQUFRLEVBQUUsMERBQTBEO1lBQ3BFLEdBQUcsRUFBRTtnQkFDRCxHQUFHLEVBQUUsQ0FBQzthQUNUO1lBQ0QsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLGVBQWUsRUFBRSxJQUFJO1NBQ3hCLEVBQUU7WUFDQyxRQUFRLEVBQUUsa0RBQWtEO1lBQzVELEdBQUcsRUFBRTtnQkFDRCxHQUFHLEVBQUUsQ0FBQztnQkFDTixJQUFJLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEVBQUUsQ0FBQzthQUNWO1lBQ0QsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkIsZUFBZSxFQUFFLElBQUk7U0FDeEIsRUFBRTtZQUNDLFFBQVEsRUFBRSxtRUFBbUU7WUFDN0UsR0FBRyxFQUFFO2dCQUNELEdBQUcsRUFBRTtvQkFDRCxTQUFTLEVBQUUsQ0FBQztpQkFDZjtnQkFDRCxJQUFJLEVBQUU7b0JBQ0YsVUFBVSxFQUFFLEdBQUc7aUJBQ2xCO2dCQUNELElBQUksRUFBRTtvQkFDRixVQUFVLEVBQUU7d0JBQ1IsaUJBQWlCLEVBQUUsQ0FBQztxQkFDdkI7aUJBQ0o7YUFDSjtZQUNELFlBQVksRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMvRixlQUFlLEVBQUUsSUFBSTtTQUN4QixFQUFFO1lBQ0MsUUFBUSxFQUFFLHlGQUF5RjtZQUNuRyxHQUFHLEVBQUU7Z0JBQ0QsR0FBRyxFQUFFO29CQUNELFNBQVMsRUFBRSxDQUFDO2lCQUNmO2dCQUNELElBQUksRUFBRTtvQkFDRixVQUFVLEVBQUUsR0FBRztpQkFDbEI7Z0JBQ0QsSUFBSSxFQUFFO29CQUNGLFVBQVUsRUFBRTt3QkFDUixpQkFBaUIsRUFBRSxpQkFBaUI7cUJBQ3ZDO2lCQUNKO2FBQ0o7WUFDRCxZQUFZLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLGlCQUFpQixFQUFFLDZCQUE2QixFQUFFLEVBQUUsQ0FBQztZQUMzSCxlQUFlLEVBQUUsS0FBSztTQUN6QixDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1FBQ3JDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNoQixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFO2dCQUNyQixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xFLElBQUksQ0FBQyxDQUFDLGVBQWUsRUFBRTtvQkFDbkIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2lCQUNuRDtxQkFBTTtvQkFDSCxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7aUJBQ3REO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==