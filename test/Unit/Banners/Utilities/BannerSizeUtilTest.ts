import { IBannerDimensions, BannerSizeUtil } from 'Banners/Utilities/BannerSizeUtil';

import { assert } from 'chai';
import { IErrorLogger } from 'Core/Native/Sdk';

class ErrorLogger implements IErrorLogger {
    public message: string = '';

    public logError(message: string): Promise<void> {
        this.message = message;
        return Promise.resolve();
    }
}

describe('BannerSizeUtil', () => {

    describe('getBannerSizeFromWidthAndHeight', () => {
        const tests: {
            input: IBannerDimensions;
            expectedOutput: IBannerDimensions;
            expectedMessage: string;
        }[] = [
            { // width greater than 728
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
            { // height greater than 90
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
            { // width less than 728
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
            { // height less than 90
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
            { // width less than 468
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
            { // height less than 60
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
            { // width less than 320
                input: {
                    w: 319,
                    h: 50
                },
                expectedOutput: {
                    w: 320,
                    h: 50
                },
                expectedMessage: 'Invalid Banner size of 319(width) 50(height) was given to Unity Ads Sdk, defaulting to minimum size 320x50'
            },
            { // height less than 50
                input: {
                    w: 320,
                    h: 49
                },
                expectedOutput: {
                    w: 320,
                    h: 50
                },
                expectedMessage: 'Invalid Banner size of 320(width) 49(height) was given to Unity Ads Sdk, defaulting to minimum size 320x50'
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
