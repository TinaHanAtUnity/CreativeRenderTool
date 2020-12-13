import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestError } from 'Core/Errors/RequestError';
import { AuctionProtocol, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { Url } from 'Core/Utilities/Url';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import 'mocha';
import * as sinon from 'sinon';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(Platform[platform] + ' - RequestManagerTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let request;
        let wakeUpManager;
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
            const successUrl = 'http://www.example.org/success';
            const successMessage = 'Success response';
            return request.get(successUrl).then((response) => {
                assert.equal(successMessage, response.response, 'Did not receive correct response');
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                throw new Error('Get without headers failed: ' + error.message);
            });
        });
        it('Request get without headers (expect failure)', () => {
            const failUrl = 'http://www.example.org/fail';
            const failMessage = 'Fail response';
            return request.get(failUrl).then(response => {
                throw new Error('Request should have failed but got response: ' + response);
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                assert.equal(failMessage, error.message, 'Did not receive correct error message');
            });
        });
        it('Request get with header', () => {
            const headerUrl = 'http://www.example.org/forwardheader';
            const headerField = 'X-Test';
            const headerMessage = 'Header message';
            return request.get(headerUrl, [[headerField, headerMessage]]).then(response => {
                assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                throw new Error('Get with header forwarding failed: ' + error);
            });
        });
        it('Request get with three retries', () => {
            const retryUrl = 'http://www.example.org/retry';
            const successMessage = 'Success response';
            const retryAttempts = 3;
            const retryDelay = 10;
            return request.get(retryUrl, [], {
                retries: retryAttempts,
                retryDelay: retryDelay,
                followRedirects: false,
                retryWithConnectionEvents: false
            }).then(response => {
                assert.equal(successMessage, response.response, 'Did not get success message when retrying');
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                throw new Error('Get with retrying failed: ' + error.message);
            });
        });
        it('Request post without headers (expect success)', () => {
            const successUrl = 'http://www.example.org/success';
            const successMessage = 'Success response';
            return request.post(successUrl, 'Test').then(response => {
                assert.equal(successMessage, response.response, 'Did not receive correct response');
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                throw new Error('Post without headers failed: ' + error.message);
            });
        });
        it('Request post without headers (expect failure)', () => {
            const failUrl = 'http://www.example.org/fail';
            const failMessage = 'Fail response';
            return request.post(failUrl, 'Test').then(response => {
                throw new Error('Request should have failed but got response: ' + response);
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                assert.equal(failMessage, error.message, 'Did not receive correct error message');
            });
        });
        it('Request post with header', () => {
            const headerUrl = 'http://www.example.org/forwardheader';
            const headerField = 'X-Test';
            const headerMessage = 'Header message';
            return request.post(headerUrl, 'Test', [[headerField, headerMessage]]).then(response => {
                assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                throw new Error('Post with header forwarding failed: ' + error.message);
            });
        });
        it('Request post with forwarded body', () => {
            const testUrl = 'http://www.example.org/forwardbody';
            const bodyMessage = 'Body message';
            return request.post(testUrl, bodyMessage).then(response => {
                assert.equal(bodyMessage, response.response, 'Did not get correctly forwarded body');
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                throw new Error('Post with body forwarding failed: ' + error.message);
            });
        });
        it('Request post with three retries', () => {
            const retryUrl = 'http://www.example.org/retry';
            const successMessage = 'Success response';
            const retryAttempts = 3;
            const retryDelay = 10;
            return request.post(retryUrl, 'Test', [], {
                retries: retryAttempts,
                retryDelay: retryDelay,
                followRedirects: false,
                retryWithConnectionEvents: false
            }).then(response => {
                assert.equal(successMessage, response.response, 'Did not get success message when retrying');
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                throw new Error('Post with retrying failed: ' + error.message);
            });
        });
        it('Request should fail after retry attempts', () => {
            const retryUrl = 'http://www.example.org/alwaysRetry';
            const retryAttempts = 5;
            const retryDelay = 10;
            return request.get(retryUrl, [], {
                retries: retryAttempts,
                retryDelay: retryDelay,
                followRedirects: false,
                retryWithConnectionEvents: false
            }).then(response => {
                throw new Error('Should not have received a response');
            }).catch(error => {
                // tslint:disable-next-line
                error = error;
                assert.equal('This URL always fails', error.message, 'Error was not correct after retries');
            });
        });
        it('Request should succeed only after connection event', () => {
            const clock = sinon.useFakeTimers();
            const toggleUrl = 'http://www.example.org/toggle';
            const successMessage = 'Success response';
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
                error = error;
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
                    const successUrl = 'http://www.example.org/responsecode/' + i.toString();
                    const successMessage = 'Success response';
                    return request.get(successUrl).then((response) => {
                        assert.equal(successMessage, response.response, 'Did not receive correct response');
                    }).catch(error => {
                        // tslint:disable-next-line
                        error = error;
                        throw new Error('Get without headers failed: ' + error.message);
                    });
                });
            }
        });
        describe('Request get should fail for all status codes in the 4xx range', () => {
            for (let i = 400; i <= 405; i++) {
                it('Request get should fail for response code ' + i.toString(), () => {
                    const failureUrl = 'http://www.example.org/errorresponsecode/' + i.toString();
                    const reason = 'FAILED_WITH_ERROR_RESPONSE';
                    const failureResponse = '{"error": "Failure response"}';
                    return request.get(failureUrl).then((response) => {
                        assert.fail('Should not resolve');
                    }).catch(error => {
                        assert.instanceOf(error, RequestError);
                        // tslint:disable-next-line
                        error = error;
                        assert.equal(error.message, reason);
                        assert.equal(error.nativeResponse.responseCode, i);
                        assert.equal(error.nativeResponse.response, failureResponse);
                    });
                });
            }
        });
        describe('Request get should fail for unknown status codes', () => {
            it('Request get should fail for response code 600', () => {
                const failureUrl = 'http://www.example.org/errorresponsecode/' + 600;
                const reason = 'FAILED_WITH_UNKNOWN_RESPONSE_CODE';
                const failureResponse = '{"error": "Failure response"}';
                return request.get(failureUrl).then((response) => {
                    assert.fail('Should not resolve');
                }).catch(error => {
                    assert.instanceOf(error, RequestError);
                    // tslint:disable-next-line
                    error = error;
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
                        const redirectUrl = 'http://www.example.org/responsecode/' + i.toString();
                        return request.followRedirectChain(redirectUrl).then((url) => {
                            assert.equal('http://www.example.org/endurl/', url);
                        }).catch(error => {
                            // tslint:disable-next-line
                            error = error;
                            throw new Error('Head without headers failed: ' + error.message);
                        });
                    });
                }
            });
            it('should reject when redirect limit has been reached', () => {
                const redirectUrl = 'http://www.example.org/recursiveResponseCode/';
                return request.followRedirectChain(redirectUrl).then((url) => {
                    assert.fail('Should not resolve');
                }).catch(error => {
                    assert.equal(error.message, 'redirect limit reached');
                });
            });
            it('Request followRedirectChain should reject when HEAD request is not accepted', () => {
                const redirectUrl = 'https://www.example.org/rejectedResponseCode/';
                return request.followRedirectChain(redirectUrl).then((url) => {
                    assert.fail(`${redirectUrl} should not success on HEAD request`);
                }).catch((e) => {
                    assert.equal(e.message, 'Fail response');
                });
            });
            it('should not make HEAD request if requestUrl is given redirectBreaker string format', () => {
                const redirectUrl = platform === Platform.ANDROID ? 'https://play.google.com/store/apps/details?id=com.playgendary.tanks' : 'https://itunes.apple.com/app/id490099807?mt=8';
                sinon.spy(request, 'head');
                return request.followRedirectChain(redirectUrl, true, Url.getAppStoreUrlTemplates(platform)).catch(() => {
                    return redirectUrl;
                }).then((url) => {
                    sinon.assert.notCalled(request.head);
                    assert.equal(url, redirectUrl);
                });
            });
            it('should make HEAD request if requestUrl is not given redirect breaker format', () => {
                const redirectUrl = platform === Platform.ANDROID ? 'https://google.com' : 'https://apple.com';
                sinon.spy(request, 'head');
                return request.followRedirectChain(redirectUrl, true, Url.getAppStoreUrlTemplates(platform)).catch(() => {
                    return redirectUrl;
                }).then((url) => {
                    sinon.assert.called(request.head);
                    assert.equal(url, redirectUrl);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdE1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0NvcmUvTWFuYWdlcnMvUmVxdWVzdE1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQy9FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU1RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRS9CLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1FBQ3hELElBQUksT0FBZ0IsQ0FBQztRQUNyQixJQUFJLFlBQTBCLENBQUM7UUFDL0IsSUFBSSxJQUFjLENBQUM7UUFDbkIsSUFBSSxPQUF1QixDQUFDO1FBQzVCLElBQUksYUFBNEIsQ0FBQztRQUVqQyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzdDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxPQUFPLEdBQUcsSUFBSSxjQUFjLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsUUFBUSxLQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDckosQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEdBQUcsRUFBRTtZQUNqQyxFQUFFLENBQUMsQ0FBQyxxQ0FBcUMsQ0FBQyxFQUFFLEdBQUcsRUFBRTtnQkFDN0MsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFdEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxDQUFDLHFDQUFxQyxDQUFDLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVwRCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN6QixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMxQixNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLEdBQUcsRUFBRTtZQUN0QyxFQUFFLENBQUMsQ0FBQyxvQ0FBb0MsQ0FBQyxFQUFFLEdBQUcsRUFBRTtnQkFDNUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqRCxjQUFjLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pELGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFFN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLEdBQUcsRUFBRTtnQkFDcEMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsRCxjQUFjLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pELGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFFN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsQ0FBQywrQ0FBK0MsQ0FBQyxFQUFFLEdBQUcsRUFBRTtnQkFDdkQsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsRixjQUFjLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pELGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFFN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsQ0FBQywrQ0FBK0MsQ0FBQyxFQUFFLEdBQUcsRUFBRTtnQkFDdkQsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsRixjQUFjLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pELGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFFN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsQ0FBQywrQ0FBK0MsQ0FBQyxFQUFFLEdBQUcsRUFBRTtnQkFDdkQsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNsRixjQUFjLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pELGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFFN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLEdBQUcsRUFBRTtnQkFDakMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsRCxjQUFjLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2pELGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztnQkFFN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw4Q0FBOEMsRUFBRSxHQUFHLEVBQUU7WUFDcEQsTUFBTSxVQUFVLEdBQVcsZ0NBQWdDLENBQUM7WUFDNUQsTUFBTSxjQUFjLEdBQVcsa0JBQWtCLENBQUM7WUFFbEQsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUM3QyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLGtDQUFrQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNiLDJCQUEyQjtnQkFDM0IsS0FBSyxHQUFpQixLQUFLLENBQUM7Z0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsOENBQThDLEVBQUUsR0FBRyxFQUFFO1lBQ3BELE1BQU0sT0FBTyxHQUFXLDZCQUE2QixDQUFDO1lBQ3RELE1BQU0sV0FBVyxHQUFXLGVBQWUsQ0FBQztZQUU1QyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN4QyxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBQ2hGLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDYiwyQkFBMkI7Z0JBQzNCLEtBQUssR0FBaUIsS0FBSyxDQUFDO2dCQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7WUFDdEYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7WUFDL0IsTUFBTSxTQUFTLEdBQVcsc0NBQXNDLENBQUM7WUFDakUsTUFBTSxXQUFXLEdBQVcsUUFBUSxDQUFDO1lBQ3JDLE1BQU0sYUFBYSxHQUFXLGdCQUFnQixDQUFDO1lBRS9DLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMxRSxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLGlEQUFpRCxDQUFDLENBQUM7WUFDdEcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNiLDJCQUEyQjtnQkFDM0IsS0FBSyxHQUFpQixLQUFLLENBQUM7Z0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7WUFDdEMsTUFBTSxRQUFRLEdBQVcsOEJBQThCLENBQUM7WUFDeEQsTUFBTSxjQUFjLEdBQVcsa0JBQWtCLENBQUM7WUFDbEQsTUFBTSxhQUFhLEdBQVcsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sVUFBVSxHQUFXLEVBQUUsQ0FBQztZQUU5QixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRTtnQkFDN0IsT0FBTyxFQUFFLGFBQWE7Z0JBQ3RCLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixlQUFlLEVBQUUsS0FBSztnQkFDdEIseUJBQXlCLEVBQUUsS0FBSzthQUNuQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNmLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztZQUNqRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2IsMkJBQTJCO2dCQUMzQixLQUFLLEdBQWlCLEtBQUssQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7WUFDckQsTUFBTSxVQUFVLEdBQVcsZ0NBQWdDLENBQUM7WUFDNUQsTUFBTSxjQUFjLEdBQVcsa0JBQWtCLENBQUM7WUFFbEQsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3BELE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2IsMkJBQTJCO2dCQUMzQixLQUFLLEdBQWlCLEtBQUssQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7WUFDckQsTUFBTSxPQUFPLEdBQVcsNkJBQTZCLENBQUM7WUFDdEQsTUFBTSxXQUFXLEdBQVcsZUFBZSxDQUFDO1lBRTVDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBQ2hGLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDYiwyQkFBMkI7Z0JBQzNCLEtBQUssR0FBaUIsS0FBSyxDQUFDO2dCQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7WUFDdEYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7WUFDaEMsTUFBTSxTQUFTLEdBQVcsc0NBQXNDLENBQUM7WUFDakUsTUFBTSxXQUFXLEdBQVcsUUFBUSxDQUFDO1lBQ3JDLE1BQU0sYUFBYSxHQUFXLGdCQUFnQixDQUFDO1lBRS9DLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbkYsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxpREFBaUQsQ0FBQyxDQUFDO1lBQ3RHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDYiwyQkFBMkI7Z0JBQzNCLEtBQUssR0FBaUIsS0FBSyxDQUFDO2dCQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1RSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtZQUN4QyxNQUFNLE9BQU8sR0FBVyxvQ0FBb0MsQ0FBQztZQUM3RCxNQUFNLFdBQVcsR0FBVyxjQUFjLENBQUM7WUFFM0MsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3RELE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztZQUN6RixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2IsMkJBQTJCO2dCQUMzQixLQUFLLEdBQWlCLEtBQUssQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUUsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7WUFDdkMsTUFBTSxRQUFRLEdBQVcsOEJBQThCLENBQUM7WUFDeEQsTUFBTSxjQUFjLEdBQVcsa0JBQWtCLENBQUM7WUFDbEQsTUFBTSxhQUFhLEdBQVcsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sVUFBVSxHQUFXLEVBQUUsQ0FBQztZQUU5QixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7Z0JBQ3RDLE9BQU8sRUFBRSxhQUFhO2dCQUN0QixVQUFVLEVBQUUsVUFBVTtnQkFDdEIsZUFBZSxFQUFFLEtBQUs7Z0JBQ3RCLHlCQUF5QixFQUFFLEtBQUs7YUFDbkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDZixNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLDJDQUEyQyxDQUFDLENBQUM7WUFDakcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNiLDJCQUEyQjtnQkFDM0IsS0FBSyxHQUFpQixLQUFLLENBQUM7Z0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsMENBQTBDLEVBQUUsR0FBRyxFQUFFO1lBQ2hELE1BQU0sUUFBUSxHQUFXLG9DQUFvQyxDQUFDO1lBQzlELE1BQU0sYUFBYSxHQUFXLENBQUMsQ0FBQztZQUNoQyxNQUFNLFVBQVUsR0FBVyxFQUFFLENBQUM7WUFFOUIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUU7Z0JBQzdCLE9BQU8sRUFBRSxhQUFhO2dCQUN0QixVQUFVLEVBQUUsVUFBVTtnQkFDdEIsZUFBZSxFQUFFLEtBQUs7Z0JBQ3RCLHlCQUF5QixFQUFFLEtBQUs7YUFDbkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDZixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNiLDJCQUEyQjtnQkFDM0IsS0FBSyxHQUFpQixLQUFLLENBQUM7Z0JBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1lBQ2hHLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsb0RBQW9ELEVBQUUsR0FBRyxFQUFFO1lBQzFELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQyxNQUFNLFNBQVMsR0FBVywrQkFBK0IsQ0FBQztZQUMxRCxNQUFNLGNBQWMsR0FBVyxrQkFBa0IsQ0FBQztZQUVsRCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFeEMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFO2dCQUN2QyxPQUFPLEVBQUUsQ0FBQztnQkFDVixVQUFVLEVBQUUsQ0FBQztnQkFDYixlQUFlLEVBQUUsS0FBSztnQkFDdEIseUJBQXlCLEVBQUUsSUFBSTthQUNsQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ2pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztZQUN4RixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2IsMkJBQTJCO2dCQUMzQixLQUFLLEdBQWlCLEtBQUssQ0FBQztnQkFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUUsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFaEIsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsa0VBQWtFLEVBQUUsR0FBRyxFQUFFO1lBQzlFLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdCLEVBQUUsQ0FBQywrQ0FBK0MsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFO29CQUNwRSxNQUFNLFVBQVUsR0FBVyxzQ0FBc0MsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ2pGLE1BQU0sY0FBYyxHQUFXLGtCQUFrQixDQUFDO29CQUVsRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQzdDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztvQkFDeEYsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUNiLDJCQUEyQjt3QkFDM0IsS0FBSyxHQUFpQixLQUFLLENBQUM7d0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNwRSxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQzthQUNOO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsK0RBQStELEVBQUUsR0FBRyxFQUFFO1lBQzNFLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdCLEVBQUUsQ0FBQyw0Q0FBNEMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFO29CQUNqRSxNQUFNLFVBQVUsR0FBVywyQ0FBMkMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3RGLE1BQU0sTUFBTSxHQUFHLDRCQUE0QixDQUFDO29CQUM1QyxNQUFNLGVBQWUsR0FBVywrQkFBK0IsQ0FBQztvQkFFaEUsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO3dCQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7b0JBQ3RDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDYixNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQzt3QkFDdkMsMkJBQTJCO3dCQUMzQixLQUFLLEdBQWlCLEtBQUssQ0FBQzt3QkFDNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUNuRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO29CQUNqRSxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQzthQUNOO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsa0RBQWtELEVBQUUsR0FBRyxFQUFFO1lBQzlELEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JELE1BQU0sVUFBVSxHQUFXLDJDQUEyQyxHQUFHLEdBQUcsQ0FBQztnQkFDN0UsTUFBTSxNQUFNLEdBQUcsbUNBQW1DLENBQUM7Z0JBQ25ELE1BQU0sZUFBZSxHQUFXLCtCQUErQixDQUFDO2dCQUVoRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDdEMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNiLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUN2QywyQkFBMkI7b0JBQzNCLEtBQUssR0FBaUIsS0FBSyxDQUFDO29CQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3BDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ3JELE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQ2pFLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7WUFDOUMsRUFBRSxDQUFDLHVEQUF1RCxFQUFFLEdBQUcsRUFBRTtnQkFDN0QsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDN0IsRUFBRSxDQUFDLCtCQUErQixHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLEVBQUU7d0JBQ3BELE1BQU0sV0FBVyxHQUFXLHNDQUFzQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDbEYsT0FBTyxPQUFPLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7NEJBQ3pELE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQ3hELENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTs0QkFDYiwyQkFBMkI7NEJBQzNCLEtBQUssR0FBaUIsS0FBSyxDQUFDOzRCQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDckUsQ0FBQyxDQUFDLENBQUM7b0JBRVAsQ0FBQyxDQUFDLENBQUM7aUJBQ047WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvREFBb0QsRUFBRSxHQUFHLEVBQUU7Z0JBQzFELE1BQU0sV0FBVyxHQUFXLCtDQUErQyxDQUFDO2dCQUM1RSxPQUFPLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2IsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLHdCQUF3QixDQUFDLENBQUM7Z0JBQzFELENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsNkVBQTZFLEVBQUUsR0FBRyxFQUFFO2dCQUNuRixNQUFNLFdBQVcsR0FBVywrQ0FBK0MsQ0FBQztnQkFDNUUsT0FBTyxPQUFPLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7b0JBQ3pELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLHFDQUFxQyxDQUFDLENBQUM7Z0JBQ3JFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztnQkFDN0MsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxtRkFBbUYsRUFBRSxHQUFHLEVBQUU7Z0JBQ3pGLE1BQU0sV0FBVyxHQUFXLFFBQVEsS0FBSyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxxRUFBcUUsQ0FBQyxDQUFDLENBQUMsK0NBQStDLENBQUM7Z0JBQ3BMLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQixPQUFPLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7b0JBQ3BHLE9BQU8sV0FBVyxDQUFDO2dCQUN2QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDWixLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBaUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDbkMsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw2RUFBNkUsRUFBRSxHQUFHLEVBQUU7Z0JBQ25GLE1BQU0sV0FBVyxHQUFXLFFBQVEsS0FBSyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUM7Z0JBQ3ZHLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMzQixPQUFPLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7b0JBQ3BHLE9BQU8sV0FBVyxDQUFDO2dCQUN2QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDWixLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBaUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDbkMsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9