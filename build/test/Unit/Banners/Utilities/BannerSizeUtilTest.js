import { BannerSizeUtil } from 'Banners/Utilities/BannerSizeUtil';
import { assert } from 'chai';
class ErrorLogger {
    constructor() {
        this.message = '';
    }
    logError(message) {
        this.message = message;
        return Promise.resolve();
    }
}
describe('BannerSizeUtil', () => {
    describe('getBannerSizeFromWidthAndHeight', () => {
        const tests = [
            {
                input: {
                    w: 729,
                    h: 90
                },
                expectedOutput: {
                    w: 728,
                    h: 90
                },
                expectedMessage: ''
            },
            {
                input: {
                    w: 728,
                    h: 91
                },
                expectedOutput: {
                    w: 728,
                    h: 90
                },
                expectedMessage: ''
            },
            {
                input: {
                    w: 728,
                    h: 90
                },
                expectedOutput: {
                    w: 728,
                    h: 90
                },
                expectedMessage: ''
            },
            {
                input: {
                    w: 727,
                    h: 90
                },
                expectedOutput: {
                    w: 468,
                    h: 60
                },
                expectedMessage: ''
            },
            {
                input: {
                    w: 728,
                    h: 89
                },
                expectedOutput: {
                    w: 468,
                    h: 60
                },
                expectedMessage: ''
            },
            {
                input: {
                    w: 468,
                    h: 60
                },
                expectedOutput: {
                    w: 468,
                    h: 60
                },
                expectedMessage: ''
            },
            {
                input: {
                    w: 467,
                    h: 60
                },
                expectedOutput: {
                    w: 320,
                    h: 50
                },
                expectedMessage: ''
            },
            {
                input: {
                    w: 468,
                    h: 59
                },
                expectedOutput: {
                    w: 320,
                    h: 50
                },
                expectedMessage: ''
            },
            {
                input: {
                    w: 320,
                    h: 50
                },
                expectedOutput: {
                    w: 320,
                    h: 50
                },
                expectedMessage: ''
            },
            {
                input: {
                    w: 319,
                    h: 50
                },
                expectedOutput: undefined,
                expectedMessage: 'Invalid Banner size of 319(width) 50(height) was given to Unity Ads Sdk, resulted in no fill'
            },
            {
                input: {
                    w: 320,
                    h: 49
                },
                expectedOutput: undefined,
                expectedMessage: 'Invalid Banner size of 320(width) 49(height) was given to Unity Ads Sdk, resulted in no fill'
            }
        ];
        tests.forEach(t => {
            it(`getBannerSizeFromWidthAndHeight should output ${JSON.stringify(t.expectedOutput)} for input ${JSON.stringify(t.input)}`, () => {
                const errorLogger = new ErrorLogger();
                const actualOutput = BannerSizeUtil.getBannerSizeFromWidthAndHeight(t.input.w, t.input.h, errorLogger);
                assert.deepEqual(actualOutput, t.expectedOutput);
                assert.equal(errorLogger.message, t.expectedMessage);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyU2l6ZVV0aWxUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Jhbm5lcnMvVXRpbGl0aWVzL0Jhbm5lclNpemVVdGlsVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXFCLGNBQWMsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRXJGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFHOUIsTUFBTSxXQUFXO0lBQWpCO1FBQ1csWUFBTyxHQUFXLEVBQUUsQ0FBQztJQU1oQyxDQUFDO0lBSlUsUUFBUSxDQUFDLE9BQWU7UUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsQ0FBQztDQUNKO0FBRUQsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtJQUU1QixRQUFRLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO1FBQzdDLE1BQU0sS0FBSyxHQUlMO1lBQ0Y7Z0JBQ0ksS0FBSyxFQUFFO29CQUNILENBQUMsRUFBRSxHQUFHO29CQUNOLENBQUMsRUFBRSxFQUFFO2lCQUNSO2dCQUNELGNBQWMsRUFBRTtvQkFDWixDQUFDLEVBQUUsR0FBRztvQkFDTixDQUFDLEVBQUUsRUFBRTtpQkFDUjtnQkFDRCxlQUFlLEVBQUUsRUFBRTthQUN0QjtZQUNEO2dCQUNJLEtBQUssRUFBRTtvQkFDSCxDQUFDLEVBQUUsR0FBRztvQkFDTixDQUFDLEVBQUUsRUFBRTtpQkFDUjtnQkFDRCxjQUFjLEVBQUU7b0JBQ1osQ0FBQyxFQUFFLEdBQUc7b0JBQ04sQ0FBQyxFQUFFLEVBQUU7aUJBQ1I7Z0JBQ0QsZUFBZSxFQUFFLEVBQUU7YUFDdEI7WUFDRDtnQkFDSSxLQUFLLEVBQUU7b0JBQ0gsQ0FBQyxFQUFFLEdBQUc7b0JBQ04sQ0FBQyxFQUFFLEVBQUU7aUJBQ1I7Z0JB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