const deploy = require('./deploy');
const childProcess = require('child_process');

describe('deploy', () => {
    describe('deployBranch', () => {
        describe('calling with webview branch 3.0.1', () => {
            describe('when execSync does not throw error', () => {
                beforeEach(() => {
                    return deploy.deployBranch('3.0.1');
                });
    
                it('should call execSync twice', () => {
                    expect(childProcess.execSync).toBeCalledTimes(2);
                });
    
                it('should call execSync the first time with the proper commands', () => {
                    expect(childProcess.execSync.mock.calls[0]).toEqual(['( cd deploy && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-prd/webview/3.0.1 ) && ( cd deploy-china && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-cn-prd/webview/3.0.1 ) && aws s3 sync deploy s3://unityads-cdn-origin/webview/3.0.1/ --acl public-read']);
                });

                it('should call execSync the second time with the proper commands', () => {
                    expect(childProcess.execSync.mock.calls[1]).toEqual(['( cd deploy && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-prd/webview/3.0.1-rc2 ) && ( cd deploy-china && gsutil -m cp -r -z "html, json" -a public-read . gs://unity-ads-webview-cn-prd/webview/3.0.1-rc2 ) && aws s3 sync deploy s3://unityads-cdn-origin/webview/3.0.1-rc2/ --acl public-read']);
                });
            });
        });

        describe('calling with webview branch master', () => {
            describe('when execSync does not throw error', () => {
                beforeEach(() => {
                    return deploy.deployBranch('master');
                });
    
                it('should call execSync once', () => {
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
                    expect(() => deploy.deployBranch('master')).toThrowError('Failed Deployment');
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
