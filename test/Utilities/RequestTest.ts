import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { RequestApi } from '../../src/ts/Native/Api/Request';
import { Request } from '../../src/ts/Utilities/Request';
import { ResolveApi } from '../../src/ts/Native/Api/Resolve';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';

class TestRequestApi extends RequestApi {
    private _retryCount: number = 0;

    public get(id: string, url: string, headers: [string, string][]): Promise<string> {
        if(url.indexOf('/success') !== -1) {
            this.sendSuccessResponse(id, url, 'Success response', []);
        } else if(url.indexOf('/fail') !== -1) {
            this.sendFailResponse(id, url, 'Fail response');
        } else if(url.indexOf('/forwardheader') !== -1) {
            if(headers[0][0] === 'X-Test') {
                this.sendSuccessResponse(id, url, headers[0][1], []);
            } else {
                this.sendFailResponse(id, url, 'No X-Test header found');
            }
        } else if(url.indexOf('/retry')) {
            if(this._retryCount === 3) {
                this.sendSuccessResponse(id, url, 'Success response', []);
            } else {
                this.sendFailResponse(id, url, 'Must continue retrying');
            }

            this._retryCount++;
        }

        return Promise.resolve(id);
    }

    public post(id: string, url: string, body: string, headers: [string, string][]): Promise<string> {
        if(url.indexOf('/success') !== -1) {
            this.sendSuccessResponse(id, url, 'Success response', []);
        } else if(url.indexOf('/fail') !== -1) {
            this.sendFailResponse(id, url, 'Fail response');
        } else if(url.indexOf('/forwardheader') !== -1) {
            if(headers[0][0] === 'X-Test') {
                this.sendSuccessResponse(id, url, headers[0][1], []);
            } else {
                this.sendFailResponse(id, url, 'No X-Test header found');
            }
        } else if(url.indexOf('/forwardbody') !== -1) {
            this.sendSuccessResponse(id, url, body, []);
        } else if(url.indexOf('/retry')) {
            if(this._retryCount === 3) {
                this.sendSuccessResponse(id, url, 'Success response', []);
            } else {
                this.sendFailResponse(id, url, 'Must continue retrying');
            }

            this._retryCount++;
        }

        return Promise.resolve(id);
    }

    private sendSuccessResponse(id: string, url: string, body: string, headers: [string, string][]) {
        setTimeout(() => { this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, body, 200, headers]); }, 0);
    }

    private sendFailResponse(id: string, url: string, message: string) {
        setTimeout(() => { this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, message]); }, 0);
    }
}

class TestResolveApi extends ResolveApi {

    public resolve(id: string, host: string): Promise<string> {
        if(host.indexOf('fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['RESOLVE', 'FAILED', id, host, 'Error', 'Error message']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['RESOLVE', 'COMPLETE', id, host, '1.2.3.4']);
            }, 0);
        }
        return Promise.resolve(id);
    }

}

describe('RequestTest', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge, requestApi, resolveApi, request;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        requestApi = NativeBridge.Request = new TestRequestApi(nativeBridge);
        resolveApi = NativeBridge.Resolve = new TestResolveApi(nativeBridge);
        request = new Request();
    });

    it('Request get without headers (expect success)', function(done: MochaDone): void {
        let successUrl: string = 'http://www.example.org/success';
        let successMessage: string = 'Success response';

        request.get(successUrl).then((response) => {
            assert.equal(successMessage, response.response, 'Did not receive correct response');
            done();
        }).catch((error) => {
            done(new Error('Get without headers failed: ' + error));
        });
    });

    it('Request get without headers (expect failure)', function(done: MochaDone): void {
        let failUrl: string = 'http://www.example.org/fail';
        let failMessage: string = 'Fail response';

        request.get(failUrl).then(response => {
            done(new Error('Request should have failed but got response: ' + response));
        }).catch((error) => {
            assert.equal(failMessage, error, 'Did not receive correct error message');
            done();
        });
    });

    it('Request get with header', function(done: MochaDone): void {
        let headerUrl: string = 'http://www.example.org/forwardheader';
        let headerField: string = 'X-Test';
        let headerMessage: string = 'Header message';

        request.get(headerUrl, [[headerField, headerMessage]]).then(response => {
            assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
            done();
        }).catch((error) => {
            done(new Error('Get with header forwarding failed: ' + error));
        });
    });

    it('Request get with three retries', function(done: MochaDone): void {
        let retryUrl: string = 'http://www.example.org/retry';
        let successMessage: string = 'Success response';
        let retryAttempts: number = 3;
        let retryDelay: number = 10;

        request.get(retryUrl, [], retryAttempts, retryDelay).then(response => {
            assert.equal(successMessage, response.response, 'Did not get success message when retrying');
            done();
        }).catch((error) => {
            done(new Error('Get with retrying failed: ' + error));
        });
    });

    it('Request post without headers (expect success)', function(done: MochaDone): void {
        let successUrl: string = 'http://www.example.org/success';
        let successMessage: string = 'Success response';

        request.post(successUrl, 'Test').then(response => {
            assert.equal(successMessage, response.response, 'Did not receive correct response');
            done();
        }).catch((error) => {
            done(new Error('Post without headers failed: ' + error));
        });
    });

    it('Request post without headers (expect failure)', function(done: MochaDone): void {
        let failUrl: string = 'http://www.example.org/fail';
        let failMessage: string = 'Fail response';

        request.post(failUrl, 'Test').then(response => {
            done(new Error('Request should have failed but got response: ' + response));
        }).catch((error) => {
            assert.equal(failMessage, error, 'Did not receive correct error message');
            done();
        });
    });

    it('Request post with header', function(done: MochaDone): void {
        let headerUrl: string = 'http://www.example.org/forwardheader';
        let headerField: string = 'X-Test';
        let headerMessage: string = 'Header message';

        request.post(headerUrl, 'Test', [[headerField, headerMessage]]).then(response => {
            assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
            done();
        }).catch((error) => {
            done(new Error('Post with header forwarding failed: ' + error));
        });
    });

    it('Request post with forwarded body', function(done: MochaDone): void {
        let testUrl: string = 'http://www.example.org/forwardbody';
        let bodyMessage: string = 'Body message';

        request.post(testUrl, bodyMessage).then(response => {
            assert.equal(bodyMessage, response.response, 'Did not get correctly forwarded body');
            done();
        }).catch((error) => {
            done(new Error('Post with body forwarding failed: ' + error));
        });
    });

    it('Request post with three retries', function(done: MochaDone): void {
        let retryUrl: string = 'http://www.example.org/retry';
        let successMessage: string = 'Success response';
        let retryAttempts: number = 3;
        let retryDelay: number = 10;

        request.post(retryUrl, 'Test', [], retryAttempts, retryDelay).then(response => {
            assert.equal(successMessage, response.response, 'Did not get success message when retrying');
            done();
        }).catch((error) => {
            done(new Error('Post with retrying failed: ' + error));
        });
    });

    it('Resolve host with success', () => {
        let testHost: string = 'www.example.net';
        let testIp: string = '1.2.3.4';

        return request.resolve(testHost).then(([host, ip]) => {
            assert.equal(testHost, host, 'Hostname does not match the request');
            assert.equal(testIp, ip, 'IP address was not successfully resolved');
        });
    });

    it('Resolve host with failure', () => {
        let failHost: string = 'www.fail.com';
        let expectedError: string = 'Error';
        let expectedErrorMsg: string = 'Error message';

        return request.resolve(failHost).then(() => {
            assert.fail('Failed resolve must not be successful');
        }, ([error, errorMsg]) => {
            assert.equal(expectedError, error, 'Failed resolve error does not match');
            assert.equal(expectedErrorMsg, errorMsg, 'Failed resolve error message does not match');
        });
    });
});
