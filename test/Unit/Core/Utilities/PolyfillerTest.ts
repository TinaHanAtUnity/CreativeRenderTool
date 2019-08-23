import 'mocha';
import { assert } from 'chai';

import { Polyfiller } from 'Core/Utilities/Polyfiller';

describe('PolyfillerTest', () => {

    const tests: {
        testCase: string;
        map: { [key: string]: unknown } | { [key: number]: unknown }; // Key values are limited to string/number
        valuesToTest: unknown[];
        expectedOutcome: boolean;
    }[] = [{
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
        valuesToTest: [1, 2, 3], // Unfortunately, deepEqual requires a certain order, so moving values out of order breaks the test
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
        valuesToTest: [{nestedKey: 1}, {nestedKey2: '1'}, {nestedKey3: {'doublyNestedKey': 1}}],
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
        valuesToTest: [{nestedKey: 1}, {nestedKey2: '1'}, {nestedKey3: {'doublyNestedKey': 'SHOULD FAIL BECAUSE OF THIS'}}],
        expectedOutcome: false
    }];

    describe('getObjectValuesFunction', () => {
        tests.forEach((t) => {
            it(`${t.testCase}`, () => {
                const assumedValues = Polyfiller.getObjectValuesFunction()(t.map);
                if (t.expectedOutcome) {
                    assert.deepEqual(t.valuesToTest, assumedValues);
                } else {
                    assert.notDeepEqual(t.valuesToTest, assumedValues);
                }
            });
        });
    });
});
