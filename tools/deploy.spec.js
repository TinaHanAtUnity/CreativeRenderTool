const deploy = require('./deploy');
const childProcess = require('child_process');

describe('deploy', () => {
    describe('deployBranch', () => {

        beforeEach(() => {
            childProcess.execSync = jest.fn();
        });

        describe('calling with webview branch: master', () => {

            let branch = 'master'

            describe('when execSync does not throw error', () => {
                beforeEach(() => {
                    return deploy.deployBranch(branch);
                });
    
                it('should call execSync', () => {
                    expect(childProcess.execSync).toBeCalledTimes(1);
                });
    
                it('should call execSync with the proper commands', () => {
                    expect(childProcess.execSync.mock.calls[0]).toEqual(['( cd deploy && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-prd/webview/master ) && ( cd deploy-china && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-cn-prd/webview/master ) && aws s3 sync deploy s3://unityads-cdn-origin/webview/master/ --acl public-read']);
                });
            });

            describe('when execSync throws an error', () => {
                beforeEach(() => {
                    childProcess.execSync = jest.fn().mockImplementation(() => { throw new Error() });
                });
    
                it('should throw error', () => {
                    expect(() => deploy.deployBranch(branch)).toThrowError('Failed Deployment');
                });
            });
        });

        describe('calling with undefined branch', () => {
            it('should throw error', () => {
                expect(() => deploy.deployBranch()).toThrowError('Invalid branch: ' + undefined);
            });

            it('should not call execSync', () => {
                expect(childProcess.execSync).not.toBeCalled();
            });
        });
    });
});
