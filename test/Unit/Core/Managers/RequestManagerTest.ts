import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { AuctionProtocol, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { Url } from 'Core/Utilities/Url';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import 'mocha';
import * as sinon from 'sinon';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(Platform[platform] + ' - RequestManagerTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let request: RequestManager;
        let wakeUpManager: WakeUpManager;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager, platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : undefined);
        });

        describe(('Status code tests'), () => {
            it(('should correct handle 2XX responses'), () => {
                const response1 = RequestManager.is2xxSuccessful(200);
                const response2 = RequestManager.is2xxSuccessful(299);
                const response3 = RequestManager.is2xxSuccessful(300);
                const response4 = RequestManager.is2xxSuccessful(199);

                assert.isTrue(response1);
                assert.isTrue(response2);
                assert.isFalse(response3);
                assert.isFalse(response4);
            });

            it(('should correct handle 3XX responses'), () => {
                const response1 = RequestManager.is3xxRedirect(300);
                const response2 = RequestManager.is3xxRedirect(399);
                const response3 = RequestManager.is3xxRedirect(400);
                const response4 = RequestManager.is3xxRedirect(299);

                assert.isTrue(response1);
                assert.isTrue(response2);
                assert.isFalse(response3);
                assert.isFalse(response4);
            });
        });

        describe(('Auction protocol tests'), () => {
            it(('should set V4 for creative testing'), () => {
                sinon.stub(TestEnvironment, 'get').returns(true);
                RequestManager.setTestAuctionProtocol(undefined);
                RequestManager.configureAuctionProtocol(false);
                const returnedProtocol = RequestManager.getAuctionProtocol();

                assert.equal(returnedProtocol, AuctionProtocol.V4);
            });

            it(('should set V4 in Test mode'), () => {
                sinon.stub(TestEnvironment, 'get').returns(false);
                RequestManager.setTestAuctionProtocol(undefined);
                RequestManager.configureAuctionProtocol(true);
                const returnedProtocol = RequestManager.getAuctionProtocol();

                assert.equal(returnedProtocol, AuctionProtocol.V4);
            });

            it(('should set V4 when using forceAuctionProtocol'), () => {
                sinon.stub(TestEnvironment, 'get').withArgs('forceAuctionProtocol').returns('V4');
                RequestManager.setTestAuctionProtocol(undefined);
                RequestManager.configureAuctionProtocol(false);
                const returnedProtocol = RequestManager.getAuctionProtocol();

                assert.equal(returnedProtocol, AuctionProtocol.V4);
            });

            it(('should set V5 when using forceAuctionProtocol'), () => {
                sinon.stub(TestEnvironment, 'get').withArgs('forceAuctionProtocol').returns('V5');
                RequestManager.setTestAuctionProtocol(undefined);
                RequestManager.configureAuctionProtocol(false);
                const returnedProtocol = RequestManager.getAuctionProtocol();

                assert.equal(returnedProtocol, AuctionProtocol.V5);
            });

            it(('should set V6 when using forceAuctionProtocol'), () => {
                sinon.stub(TestEnvironment, 'get').withArgs('forceAuctionProtocol').returns('V6');
                RequestManager.setTestAuctionProtocol(undefined);
                RequestManager.configureAuctionProtocol(false);
                const returnedProtocol = RequestManager.getAuctionProtocol();

                assert.equal(returnedProtocol, AuctionProtocol.V6);
            });

            it(('should set V6 otherwise'), () => {
                sinon.stub(TestEnvironment, 'get').returns(false);
                RequestManager.setTestAuctionProtocol(undefined);
                RequestManager.configureAuctionProtocol(false);
                const returnedProtocol = RequestManager.getAuctionProtocol();

                assert.equal(returnedProtocol, AuctionProtocol.V6);
            });
        });

        it('Request get without headers (expect success)', () => {
            const successUrl: string = 'http://www.example.org/success';
            const successMessage: string = 'Success response';

            return request.get(successUrl).then((response) => {
                assert.equal(successMessage, response.response, 'Did not receive correct response');
            }).catch(error => {
                // tslint:disable-next-line
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
                // tslint:disable-next-line
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
                // tslint:disable-next-line
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
                // tslint:disable-next-line
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
                // tslint:disable-next-line
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
                // tslint:disable-next-line
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
                // tslint:disable-next-line
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
                // tslint:disable-next-line
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
                // tslint:disable-next-line
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
                // tslint:disable-next-line
                error = <RequestError>error;
                assert.equal('This URL always fails', error.message, 'Error was not correct after retries');
            });
        });

        it('Request should succeed only after connection event', () => {
            const clock = sinon.useFakeTimers();
            const toggleUrl: string = 'http://www.example.org/toggle';
            const successMessage: string = 'Success response';

            backend.Api.Request.setToggleUrl(false);

            const promise = request.get(toggleUrl, [], {
                retries: 0,
                retryDelay: 0,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then((response) => {
                assert.equal(successMessage, response.response, 'Did not receive correct response');
            }).catch(error => {
                // tslint:disable-next-line
                error = <RequestError>error;
                throw new Error('Get with connection event failed: ' + error.message);
            });

            backend.Api.Request.setToggleUrl(true);
            clock.tick(20 * 60 * 1000);
            core.Connectivity.handleEvent('CONNECTED', [true, 0]);
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
                        // tslint:disable-next-line
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
                        // tslint:disable-next-line
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
                    // tslint:disable-next-line
                    error = <RequestError>error;
                    assert.equal(error.message, reason);
                    assert.equal(error.nativeResponse.responseCode, 600);
                    assert.equal(error.nativeResponse.response, failureResponse);
                });
            });
        });

        describe('Request followRedirectChain test', () => {
            it('should redirect for all status codes in the 3xx range', () => {
                for (let i = 300; i <= 308; i++) {
                    it('should redirect for response ' + i.toString(), () => {
                        const redirectUrl: string = 'http://www.example.org/responsecode/' + i.toString();
                        return request.followRedirectChain(redirectUrl).then((url) => {
                            assert.equal('http://www.example.org/endurl/', url);
                        }).catch(error => {
                            // tslint:disable-next-line
                            error = <RequestError>error;
                            throw new Error('Head without headers failed: ' + error.message);
                        });

                    });
                }
            });

            it('should reject when redirect limit has been reached', () => {
                const redirectUrl: string = 'http://www.example.org/recursiveResponseCode/';
                return request.followRedirectChain(redirectUrl).then((url) => {
                    assert.fail('Should not resolve');
                }).catch(error => {
                    assert.equal(error.message, 'redirect limit reached');
                });
            });

            it('Request followRedirectChain should reject when HEAD request is not accepted', () => {
                const redirectUrl: string = 'https://www.example.org/rejectedResponseCode/';
                return request.followRedirectChain(redirectUrl).then((url) => {
                    assert.fail(`${redirectUrl} should not success on HEAD request`);
                }).catch((e) => {
                    assert.equal(e.message, 'Fail response');
                });
            });

            it('should not make HEAD request if requestUrl is given redirectBreaker string format', () => {
                const redirectUrl: string = platform === Platform.ANDROID ? 'https://play.google.com/store/apps/details?id=com.playgendary.tanks' : 'https://itunes.apple.com/app/id490099807?mt=8';
                sinon.spy(request, 'head');
                return request.followRedirectChain(redirectUrl, true, Url.getAppStoreUrlTemplates(platform)).catch(() => {
                    return redirectUrl;
                }).then((url) => {
                    sinon.assert.notCalled(<sinon.SinonSpy>request.head);
                    assert.equal(url, redirectUrl);
                });
            });

            it('should make HEAD request if requestUrl is not given redirect breaker format', () => {
                const redirectUrl: string = platform === Platform.ANDROID ? 'https://google.com' : 'https://apple.com';
                sinon.spy(request, 'head');
                return request.followRedirectChain(redirectUrl, true, Url.getAppStoreUrlTemplates(platform)).catch(() => {
                    return redirectUrl;
                }).then((url) => {
                    sinon.assert.called(<sinon.SinonSpy>request.head);
                    assert.equal(url, redirectUrl);
                });
            });
        });
    });
});
