import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { RequestApi } from '../../src/ts/Native/Api/Request';
import { Request } from '../../src/ts/Utilities/Request';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { WakeUpManager } from '../../src/ts/Managers/WakeUpManager';

class TestRequestApi extends RequestApi {
    private _retryCount: number = 0;
    private _toggleUrl: boolean = false;

    public get(id: string, url: string, headers: [string, string][]): Promise<string> {
        if(url.indexOf('/success') !== -1) {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        } else if(url.indexOf('/fail') !== -1) {
            this.sendFailResponse(id, url, 'Fail response');
        } else if(url.indexOf('/forwardheader') !== -1) {
            if(headers[0][0] === 'X-Test') {
                this.sendSuccessResponse(id, url, headers[0][1], 200, []);
            } else {
                this.sendFailResponse(id, url, 'No X-Test header found');
            }
        } else if(url.indexOf('/retry') !== -1) {
            if(this._retryCount === 3) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            } else {
                this.sendSuccessResponse(id, url, 'Must continue retrying', 500, []);
            }

            this._retryCount++;
        } else if(url.indexOf('/alwaysRetry') !== -1) {
            this.sendSuccessResponse(id, url, 'Must continue retrying', 500, []);
        } else if(url.indexOf('/toggle') !== -1) {
            if(this._toggleUrl) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            } else {
                this.sendFailResponse(id, url, 'URL toggled off');
            }
        }

        return Promise.resolve(id);
    }

    public post(id: string, url: string, body: string, headers: [string, string][]): Promise<string> {
        if(url.indexOf('/success') !== -1) {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        } else if(url.indexOf('/fail') !== -1) {
            this.sendFailResponse(id, url, 'Fail response');
        } else if(url.indexOf('/forwardheader') !== -1) {
            if(headers[0][0] === 'X-Test') {
                this.sendSuccessResponse(id, url, headers[0][1], 200, []);
            } else {
                this.sendFailResponse(id, url, 'No X-Test header found');
            }
        } else if(url.indexOf('/forwardbody') !== -1) {
            this.sendSuccessResponse(id, url, body, 200, []);
        } else if(url.indexOf('/retry')) {
            if(this._retryCount === 3) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            } else {
                this.sendSuccessResponse(id, url, 'Must continue retrying', 500, []);
            }

            this._retryCount++;
        }

        return Promise.resolve(id);
    }

    public setToggleUrl(status: boolean) {
        this._toggleUrl = status;
    }

    private sendSuccessResponse(id: string, url: string, body: string, responseCode: number, headers: [string, string][]) {
        setTimeout(() => { this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, body, responseCode, headers]); }, 0);
    }

    private sendFailResponse(id: string, url: string, message: string) {
        setTimeout(() => { this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, message]); }, 0);
    }
}

describe('RequestTest', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge, requestApi, request, wakeUpManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
        let clock = sinon.useFakeTimers();
        wakeUpManager = new WakeUpManager(nativeBridge);
        clock.restore();
        request = new Request(nativeBridge, wakeUpManager);
    });

    it('Request get without headers (expect success)', () => {
        let successUrl: string = 'http://www.example.org/success';
        let successMessage: string = 'Success response';

        return request.get(successUrl).then((response) => {
            assert.equal(successMessage, response.response, 'Did not receive correct response');
        }).catch(error => {
            error = error[1];
            throw new Error('Get without headers failed: ' + error);
        });
    });

    it('Request get without headers (expect failure)', () => {
        let failUrl: string = 'http://www.example.org/fail';
        let failMessage: string = 'Fail response';

        return request.get(failUrl).then(response => {
            throw new Error('Request should have failed but got response: ' + response);
        }).catch(error => {
            error = error[1];
            assert.equal(failMessage, error, 'Did not receive correct error message');
        });
    });

    it('Request get with header', () => {
        let headerUrl: string = 'http://www.example.org/forwardheader';
        let headerField: string = 'X-Test';
        let headerMessage: string = 'Header message';

        return request.get(headerUrl, [[headerField, headerMessage]]).then(response => {
            assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
        }).catch(error => {
            error = error[1];
            throw new Error('Get with header forwarding failed: ' + error);
        });
    });

    it('Request get with three retries', () => {
        let retryUrl: string = 'http://www.example.org/retry';
        let successMessage: string = 'Success response';
        let retryAttempts: number = 3;
        let retryDelay: number = 10;

        return request.get(retryUrl, [], {retries: retryAttempts, retryDelay: retryDelay, followRedirects: false, retryWithConnectionEvents: false}).then(response => {
            assert.equal(successMessage, response.response, 'Did not get success message when retrying');
        }).catch(error => {
            error = error[1];
            throw new Error('Get with retrying failed: ' + error);
        });
    });

    it('Request post without headers (expect success)', () => {
        let successUrl: string = 'http://www.example.org/success';
        let successMessage: string = 'Success response';

        return request.post(successUrl, 'Test').then(response => {
            assert.equal(successMessage, response.response, 'Did not receive correct response');
        }).catch(error => {
            error = error[1];
            throw new Error('Post without headers failed: ' + error);
        });
    });

    it('Request post without headers (expect failure)', () => {
        let failUrl: string = 'http://www.example.org/fail';
        let failMessage: string = 'Fail response';

        return request.post(failUrl, 'Test').then(response => {
            throw new Error('Request should have failed but got response: ' + response);
        }).catch(error => {
            error = error[1];
            assert.equal(failMessage, error, 'Did not receive correct error message');
        });
    });

    it('Request post with header', () => {
        let headerUrl: string = 'http://www.example.org/forwardheader';
        let headerField: string = 'X-Test';
        let headerMessage: string = 'Header message';

        return request.post(headerUrl, 'Test', [[headerField, headerMessage]]).then(response => {
            assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
        }).catch(error => {
            error = error[1];
            throw new Error('Post with header forwarding failed: ' + error);
        });
    });

    it('Request post with forwarded body', () => {
        let testUrl: string = 'http://www.example.org/forwardbody';
        let bodyMessage: string = 'Body message';

        return request.post(testUrl, bodyMessage).then(response => {
            assert.equal(bodyMessage, response.response, 'Did not get correctly forwarded body');
        }).catch(error => {
            error = error[1];
            throw new Error('Post with body forwarding failed: ' + error);
        });
    });

    it('Request post with three retries', () => {
        let retryUrl: string = 'http://www.example.org/retry';
        let successMessage: string = 'Success response';
        let retryAttempts: number = 3;
        let retryDelay: number = 10;

        return request.post(retryUrl, 'Test', [], {retries: retryAttempts, retryDelay: retryDelay, followRedirects: false, retryWithConnectionEvents: false}).then(response => {
            assert.equal(successMessage, response.response, 'Did not get success message when retrying');
        }).catch(error => {
            error = error[1];
            throw new Error('Post with retrying failed: ' + error);
        });
    });

    it('Request should fail after retry attempts', () => {
        let retryUrl: string = 'http://www.example.org/alwaysRetry';
        let retryAttempts: number = 5;
        let retryDelay: number = 10;

        return request.get(retryUrl, 'Test', [], retryAttempts, retryDelay).then(response => {
            throw new Error('Should not have received a response');
        }).catch(error => {
            error = error[1];
            assert.equal('FAILED_AFTER_RETRIES', error, 'Error was not correct after retries');
        });
    });

    it('Request should succeed only after connection event', () => {
        let clock = sinon.useFakeTimers();
        let toggleUrl: string = 'http://www.example.org/toggle';
        let successMessage: string = 'Success response';

        requestApi.setToggleUrl(false);

        let promise = request.get(toggleUrl, [], {retries: 0, retryDelay: 0, followRedirects: false, retryWithConnectionEvents: true}).then((response) => {
            assert.equal(successMessage, response.response, 'Did not receive correct response');
        }).catch(error => {
            error = error[1];
            throw new Error('Get with connection event failed: ' + error);
        });

        requestApi.setToggleUrl(true);
        clock.tick(20 * 60 * 1000);
        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        clock.tick(1);
        clock.restore();

        return promise;
    });
});
