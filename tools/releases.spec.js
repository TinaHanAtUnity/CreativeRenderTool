const releases = require('./releases');

describe('releases', () => {

    [
        {
            inputBranch: 'master',
            expectedWebview: 'development',
            expectedNative: ['master']
        },
        {
            inputBranch: '3.0.1',
            expectedWebview: '3.0.1',
            expectedNative: ['3.0.1', '3.0.1-rc2']
        },
        {
            inputBranch: 'feature/scott',
            expectedWebview: 'feature/scott',
            expectedNative: ['feature/scott']
        }
    ].forEach((test) => {

        describe('getSupportedWebviewVersion', () => {
            it(`should return ${test.getSupportedWebviewVersion} with input ${test.inputBranch}`, () => {
                expect(releases.getSupportedWebviewVersion(test.inputBranch)).toEqual(test.expectedWebview);
            });
        });

        describe('getSupportedNativeVersions', () => {
            it(`should return ${test.expectedNative.toString()} with input ${test.inputBranch}`, () => {
                expect(releases.getSupportedNativeVersions(test.inputBranch)).toEqual(test.expectedNative);
            });
        });

    });
});
