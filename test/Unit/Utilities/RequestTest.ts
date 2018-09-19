import { assert } from 'chai';
import { RequestError } from 'Core/Errors/RequestError';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

import { RequestApi } from 'Core/Native/Request';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';

class TestRequestApi extends RequestApi {
    private _retryCount: number = 0;
    private _toggleUrl: boolean = false;

    public get(id: string, url: string, headers: Array<[string, string]>): Promise<string> {
        if(url.indexOf('/cookies') !== -1) {
            const header = headers.find((x) => x[0] === 'COOKIES');
            const cookies = header === undefined ? '' : header[1];
            this.sendSuccessResponse(id, url, cookies, 200, []);
        } else if(url.indexOf('/success') !== -1) {
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
                this.sendFailResponse(id, url, 'Must continue retrying');
            }

            this._retryCount++;
        } else if(url.indexOf('/alwaysRetry') !== -1) {
            this.sendFailResponse(id, url, 'This URL always fails');
        } else if(url.indexOf('/toggle') !== -1) {
            if(this._toggleUrl) {
                this.sendSuccessResponse(id, url, 'Success response', 200, []);
            } else {
                this.sendFailResponse(id, url, 'URL toggled off');
            }
        } else if (url.indexOf('/responsecode') !== -1) {
            const responseCodes = url.match(/2[0-9]{2}/);
            if (responseCodes && responseCodes.length > 0) {
                const responseCode = responseCodes[0];
                this.sendSuccessResponse(id, url, 'Success response', parseInt(responseCode, 10), []);
            } else {
                this.sendFailResponse(id, url, 'Fail response');
            }
        } else if (url.indexOf('/errorresponsecode') !== -1) {
            const responseCodes = url.match(/(4[0-9]{2})|600/);
            if (responseCodes && responseCodes.length > 0) {
                const responseCode = responseCodes[0];
                this.sendSuccessResponse(id, url, '{"error": "Failure response"}', parseInt(responseCode, 10), []);
            }
        }

        return Promise.resolve(id);
    }

    public post(id: string, url: string, body: string, headers: Array<[string, string]>): Promise<string> {
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
                this.sendFailResponse(id, url, 'Must continue retrying');
            }

            this._retryCount++;
        }

        return Promise.resolve(id);
    }

    public head(id: string, url: string, headers: Array<[string, string]>): Promise<string> {
        if (url.indexOf('/responsecode') !== -1) {
            const responseCodes = url.match(/3[0-9]{2}/);
            if (responseCodes && responseCodes.length > 0) {
                const responseCode = responseCodes[0];
                this.sendSuccessResponse(id, url, 'Redirect response', parseInt(responseCode, 10), [['location', 'http://www.example.org/endurl/']]);
            }
        } else if (url.indexOf('/recursiveResponseCode') !== -1) {
            this.sendSuccessResponse(id, url, 'Recursive redirect response', 301, [['location', 'http://www.example.org/recursiveResponseCode/']]);
        } else {
            this.sendSuccessResponse(id, url, 'Success response', 200, []);
        }
        return Promise.resolve(id);
    }

    public setToggleUrl(status: boolean) {
        this._toggleUrl = status;
    }

    private sendSuccessResponse(id: string, url: string, body: string, responseCode: number, headers: Array<[string, string]>) {
        setTimeout(() => {
            this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, body, responseCode, headers]);
        }, 0);
    }

    private sendFailResponse(id: string, url: string, message: string) {
        setTimeout(() => {
            this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, message]);
        }, 0);
    }
}

describe('RequestTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, requestApi: TestRequestApi, request: Request, wakeUpManager: WakeUpManager;
    let focusManager: FocusManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
        const clock = sinon.useFakeTimers();
        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        clock.restore();
        request = new Request(nativeBridge, wakeUpManager);
    });

    it('Request get without headers (expect success)', () => {
        const successUrl: string = 'http://www.example.org/success';
        const successMessage: string = 'Success response';

        return request.get(successUrl).then((response) => {
            assert.equal(successMessage, response.response, 'Did not receive correct response');
        }).catch(error => {
            error = <RequestError>error;
            throw new Error('Get without headers failed: ' + error.message);
        });
    });

    it('Request get without headers (expect failure)', () => {
        const failUrl: string = 'http://www.example.org/fail';
        const failMessage: string = 'Fail response';

        return request.get(failUrl).then(response => {
            throw new Error('Request should have failed but got response: ' + response);
        }).catch(error => {
            error = <RequestError>error;
            assert.equal(failMessage, error.message, 'Did not receive correct error message');
        });
    });

    it('Request get with header', () => {
        const headerUrl: string = 'http://www.example.org/forwardheader';
        const headerField: string = 'X-Test';
        const headerMessage: string = 'Header message';

        return request.get(headerUrl, [[headerField, headerMessage]]).then(response => {
            assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
        }).catch(error => {
            error = <RequestError>error;
            throw new Error('Get with header forwarding failed: ' + error);
        });
    });

    it('Request get with three retries', () => {
        const retryUrl: string = 'http://www.example.org/retry';
        const successMessage: string = 'Success response';
        const retryAttempts: number = 3;
        const retryDelay: number = 10;

        return request.get(retryUrl, [], {
            retries: retryAttempts,
            retryDelay: retryDelay,
            followRedirects: false,
            retryWithConnectionEvents: false
        }).then(response => {
            assert.equal(successMessage, response.response, 'Did not get success message when retrying');
        }).catch(error => {
            error = <RequestError>error;
            throw new Error('Get with retrying failed: ' + error.message);
        });
    });

    it('Request post without headers (expect success)', () => {
        const successUrl: string = 'http://www.example.org/success';
        const successMessage: string = 'Success response';

        return request.post(successUrl, 'Test').then(response => {
            assert.equal(successMessage, response.response, 'Did not receive correct response');
        }).catch(error => {
            error = <RequestError>error;
            throw new Error('Post without headers failed: ' + error.message);
        });
    });

    it('Request post without headers (expect failure)', () => {
        const failUrl: string = 'http://www.example.org/fail';
        const failMessage: string = 'Fail response';

        return request.post(failUrl, 'Test').then(response => {
            throw new Error('Request should have failed but got response: ' + response);
        }).catch(error => {
            error = <RequestError>error;
            assert.equal(failMessage, error.message, 'Did not receive correct error message');
        });
    });

    it('Request post with header', () => {
        const headerUrl: string = 'http://www.example.org/forwardheader';
        const headerField: string = 'X-Test';
        const headerMessage: string = 'Header message';

        return request.post(headerUrl, 'Test', [[headerField, headerMessage]]).then(response => {
            assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
        }).catch(error => {
            error = <RequestError>error;
            throw new Error('Post with header forwarding failed: ' + error.message);
        });
    });

    it('Request post with forwarded body', () => {
        const testUrl: string = 'http://www.example.org/forwardbody';
        const bodyMessage: string = 'Body message';

        return request.post(testUrl, bodyMessage).then(response => {
            assert.equal(bodyMessage, response.response, 'Did not get correctly forwarded body');
        }).catch(error => {
            error = <RequestError>error;
            throw new Error('Post with body forwarding failed: ' + error.message);
        });
    });

    it('Request post with three retries', () => {
        const retryUrl: string = 'http://www.example.org/retry';
        const successMessage: string = 'Success response';
        const retryAttempts: number = 3;
        const retryDelay: number = 10;

        return request.post(retryUrl, 'Test', [], {
            retries: retryAttempts,
            retryDelay: retryDelay,
            followRedirects: false,
            retryWithConnectionEvents: false
        }).then(response => {
            assert.equal(successMessage, response.response, 'Did not get success message when retrying');
        }).catch(error => {
            error = <RequestError>error;
            throw new Error('Post with retrying failed: ' + error.message);
        });
    });

    it('Request should fail after retry attempts', () => {
        const retryUrl: string = 'http://www.example.org/alwaysRetry';
        const retryAttempts: number = 5;
        const retryDelay: number = 10;

        return request.get(retryUrl, [], {
            retries: retryAttempts,
            retryDelay: retryDelay,
            followRedirects: false,
            retryWithConnectionEvents: false
        }).then(response => {
            throw new Error('Should not have received a response');
        }).catch(error => {
            error = <RequestError>error;
            assert.equal('This URL always fails', error.message, 'Error was not correct after retries');
        });
    });

    it('Request should succeed only after connection event', () => {
        const clock = sinon.useFakeTimers();
        const toggleUrl: string = 'http://www.example.org/toggle';
        const successMessage: string = 'Success response';

        requestApi.setToggleUrl(false);

        const promise = request.get(toggleUrl, [], {
            retries: 0,
            retryDelay: 0,
            followRedirects: false,
            retryWithConnectionEvents: true
        }).then((response) => {
            assert.equal(successMessage, response.response, 'Did not receive correct response');
        }).catch(error => {
            error = <RequestError>error;
            throw new Error('Get with connection event failed: ' + error.message);
        });

        requestApi.setToggleUrl(true);
        clock.tick(20 * 60 * 1000);
        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        clock.tick(1);
        clock.restore();

        return promise;
    });

    describe('Request get should succeed for all status codes in the 2xx range', () => {
        for (let i = 200; i <= 206; i++) {
            it('Request get should succeed for response code ' + i.toString(), () => {
                const successUrl: string = 'http://www.example.org/responsecode/' + i.toString();
                const successMessage: string = 'Success response';

                return request.get(successUrl).then((response) => {
                    assert.equal(successMessage, response.response, 'Did not receive correct response');
                }).catch(error => {
                    error = <RequestError>error;
                    throw new Error('Get without headers failed: ' + error.message);
                });
            });
        }
    });

    describe('Request get should fail for all status codes in the 4xx range', () => {
        for (let i = 400; i <= 405; i++) {
            it('Request get should fail for response code ' + i.toString(), () => {
                const failureUrl: string = 'http://www.example.org/errorresponsecode/' + i.toString();
                const reason = 'FAILED_WITH_ERROR_RESPONSE';
                const failureResponse: string = '{"error": "Failure response"}';

                return request.get(failureUrl).then((response) => {
                    assert.fail('Should not resolve');
                }).catch(error => {
                    assert.instanceOf(error, RequestError);
                    error = <RequestError>error;
                    assert.equal(error.message, reason);
                    assert.equal(error.nativeResponse.responseCode, i);
                    assert.equal(error.nativeResponse.response, failureResponse);
                });
            });
        }
    });

    describe('Request get should fail for unknown status codes', () => {
        it('Request get should fail for response code 600', () => {
            const failureUrl: string = 'http://www.example.org/errorresponsecode/' + 600;
            const reason = 'FAILED_WITH_UNKNOWN_RESPONSE_CODE';
            const failureResponse: string = '{"error": "Failure response"}';

            return request.get(failureUrl).then((response) => {
                assert.fail('Should not resolve');
            }).catch(error => {
                assert.instanceOf(error, RequestError);
                error = <RequestError>error;
                assert.equal(error.message, reason);
                assert.equal(error.nativeResponse.responseCode, 600);
                assert.equal(error.nativeResponse.response, failureResponse);
            });
        });
    });

    describe('Request followRedirectChain should redirect for all status codes in the 3xx range', () => {
        for (let i = 300; i <= 308; i++) {
            it('should redirect for response ' + i.toString(), () => {
                const redirectUrl: string = 'http://www.example.org/responsecode/' + i.toString();
                return request.followRedirectChain(redirectUrl).then((url) => {
                    assert.equal('http://www.example.org/endurl/', url);
                }).catch(error => {
                    error = <RequestError>error;
                    throw new Error('Head without headers failed: ' + error.message);
                });

            });
        }

        it('should reject when redirect limit has been reached', () => {
            const redirectUrl: string = 'http://www.example.org/recursiveResponseCode/';
            return request.followRedirectChain(redirectUrl).then((url) => {
                assert.fail('Should not resolve');
            }).catch(error => {
                assert.equal(error.message, 'redirect limit reached');
            });
        });
    });

    describe('Request Cookies', () => {
        afterEach(() => {
            Request.resetCookiesForHost();
        });

        it('get', () => {
            const successUrl: string = 'http://www.example.org/cookies';
            const expectedCookies = 'key1=value1; key2=value2';

            Request.addCookiesForHost('www.example.org', expectedCookies);

            return request.get(successUrl).then((response) => {
                assert.equal(expectedCookies, response.response, 'Did not receive correct response');
            }).catch(error => {
                error = <RequestError>error;
                throw new Error('Get without headers failed: ' + error.message);
            });
        });

        it('get for https', () => {
            const successUrl: string = 'https://www.example.org/cookies';
            const expectedCookies = 'key1=value1; key2=value2';

            Request.addCookiesForHost('www.example.org', expectedCookies);

            return request.get(successUrl).then((response) => {
                assert.equal(expectedCookies, response.response, 'Did not receive correct response');
            }).catch(error => {
                error = <RequestError>error;
                throw new Error('Get without headers failed: ' + error.message);
            });
        });

        it('get multiple cookies', () => {
            const successUrl: string = 'http://www.example.org/cookies';
            const expectedCookies = 'key1=value1; key3=value3';

            Request.addCookiesForHost('www.example.org', 'key1=value1');
            Request.addCookiesForHost('www.example.org', 'key3=value3');

            return request.get(successUrl).then((response) => {
                assert.equal(expectedCookies, response.response, 'Did not receive correct response');
            }).catch(error => {
                error = <RequestError>error;
                throw new Error('Get without headers failed: ' + error.message);
            });
        });

        it('get ignore host', () => {
            const successUrl: string = 'http://www.example.org/cookies';
            const expectedCookies = 'key1=value1';

            Request.addCookiesForHost('www.example.org', 'key1=value1');
            Request.addCookiesForHost('www.not-example.org', 'key3=value3');

            return request.get(successUrl).then((response) => {
                assert.equal(expectedCookies, response.response, 'Did not receive correct response');
            }).catch(error => {
                error = <RequestError>error;
                throw new Error('Get without headers failed: ' + error.message);
            });
        });

        it('get no cookies for host', () => {
            const successUrl: string = 'http://www.example.org/cookies';
            const expectedCookies = '';

            Request.addCookiesForHost('www.google.com', 'key1=value1');
            Request.addCookiesForHost('www.not-example.org', 'key3=value3');

            return request.get(successUrl).then((response) => {
                assert.equal(expectedCookies, response.response, 'Did not receive correct response');
            }).catch(error => {
                error = <RequestError>error;
                throw new Error('Get without headers failed: ' + error.message);
            });
        });
    });
});
