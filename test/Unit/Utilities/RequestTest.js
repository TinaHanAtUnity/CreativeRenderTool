System.register(["tslib", "mocha", "sinon", "chai", "Native/Api/Request", "Utilities/Request", "Native/NativeBridge", "Managers/WakeUpManager", "Errors/RequestError", "Managers/FocusManager"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, sinon, chai_1, Request_1, Request_2, NativeBridge_1, WakeUpManager_1, RequestError_1, FocusManager_1, TestRequestApi;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (Request_2_1) {
                Request_2 = Request_2_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (RequestError_1_1) {
                RequestError_1 = RequestError_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            }
        ],
        execute: function () {
            TestRequestApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestRequestApi, _super);
                function TestRequestApi() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this._retryCount = 0;
                    _this._toggleUrl = false;
                    return _this;
                }
                TestRequestApi.prototype.get = function (id, url, headers) {
                    if (url.indexOf('/success') !== -1) {
                        this.sendSuccessResponse(id, url, 'Success response', 200, []);
                    }
                    else if (url.indexOf('/fail') !== -1) {
                        this.sendFailResponse(id, url, 'Fail response');
                    }
                    else if (url.indexOf('/forwardheader') !== -1) {
                        if (headers[0][0] === 'X-Test') {
                            this.sendSuccessResponse(id, url, headers[0][1], 200, []);
                        }
                        else {
                            this.sendFailResponse(id, url, 'No X-Test header found');
                        }
                    }
                    else if (url.indexOf('/retry') !== -1) {
                        if (this._retryCount === 3) {
                            this.sendSuccessResponse(id, url, 'Success response', 200, []);
                        }
                        else {
                            this.sendFailResponse(id, url, 'Must continue retrying');
                        }
                        this._retryCount++;
                    }
                    else if (url.indexOf('/alwaysRetry') !== -1) {
                        this.sendFailResponse(id, url, 'This URL always fails');
                    }
                    else if (url.indexOf('/toggle') !== -1) {
                        if (this._toggleUrl) {
                            this.sendSuccessResponse(id, url, 'Success response', 200, []);
                        }
                        else {
                            this.sendFailResponse(id, url, 'URL toggled off');
                        }
                    }
                    else if (url.indexOf('/responsecode') !== -1) {
                        var responseCodes = url.match(/2[0-9]{2}/);
                        if (responseCodes && responseCodes.length > 0) {
                            var responseCode = responseCodes[0];
                            this.sendSuccessResponse(id, url, 'Success response', parseInt(responseCode, 10), []);
                        }
                        else {
                            this.sendFailResponse(id, url, 'Fail response');
                        }
                    }
                    else if (url.indexOf('/errorresponsecode') !== -1) {
                        var responseCodes = url.match(/(4[0-9]{2})|600/);
                        if (responseCodes && responseCodes.length > 0) {
                            var responseCode = responseCodes[0];
                            this.sendSuccessResponse(id, url, '{"error": "Failure response"}', parseInt(responseCode, 10), []);
                        }
                    }
                    return Promise.resolve(id);
                };
                TestRequestApi.prototype.post = function (id, url, body, headers) {
                    if (url.indexOf('/success') !== -1) {
                        this.sendSuccessResponse(id, url, 'Success response', 200, []);
                    }
                    else if (url.indexOf('/fail') !== -1) {
                        this.sendFailResponse(id, url, 'Fail response');
                    }
                    else if (url.indexOf('/forwardheader') !== -1) {
                        if (headers[0][0] === 'X-Test') {
                            this.sendSuccessResponse(id, url, headers[0][1], 200, []);
                        }
                        else {
                            this.sendFailResponse(id, url, 'No X-Test header found');
                        }
                    }
                    else if (url.indexOf('/forwardbody') !== -1) {
                        this.sendSuccessResponse(id, url, body, 200, []);
                    }
                    else if (url.indexOf('/retry')) {
                        if (this._retryCount === 3) {
                            this.sendSuccessResponse(id, url, 'Success response', 200, []);
                        }
                        else {
                            this.sendFailResponse(id, url, 'Must continue retrying');
                        }
                        this._retryCount++;
                    }
                    return Promise.resolve(id);
                };
                TestRequestApi.prototype.head = function (id, url, headers) {
                    if (url.indexOf('/responsecode') !== -1) {
                        var responseCodes = url.match(/3[0-9]{2}/);
                        if (responseCodes && responseCodes.length > 0) {
                            var responseCode = responseCodes[0];
                            this.sendSuccessResponse(id, url, 'Redirect response', parseInt(responseCode, 10), [['location', 'http://www.example.org/endurl/']]);
                        }
                    }
                    else if (url.indexOf('/recursiveResponseCode') !== -1) {
                        this.sendSuccessResponse(id, url, 'Recursive redirect response', 301, [['location', 'http://www.example.org/recursiveResponseCode/']]);
                    }
                    else {
                        this.sendSuccessResponse(id, url, 'Success response', 200, []);
                    }
                    return Promise.resolve(id);
                };
                TestRequestApi.prototype.setToggleUrl = function (status) {
                    this._toggleUrl = status;
                };
                TestRequestApi.prototype.sendSuccessResponse = function (id, url, body, responseCode, headers) {
                    var _this = this;
                    setTimeout(function () {
                        _this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, body, responseCode, headers]);
                    }, 0);
                };
                TestRequestApi.prototype.sendFailResponse = function (id, url, message) {
                    var _this = this;
                    setTimeout(function () {
                        _this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, message]);
                    }, 0);
                };
                return TestRequestApi;
            }(Request_1.RequestApi));
            describe('RequestTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge, requestApi, request, wakeUpManager;
                var focusManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
                    var clock = sinon.useFakeTimers();
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    clock.restore();
                    request = new Request_2.Request(nativeBridge, wakeUpManager);
                });
                it('Request get without headers (expect success)', function () {
                    var successUrl = 'http://www.example.org/success';
                    var successMessage = 'Success response';
                    return request.get(successUrl).then(function (response) {
                        chai_1.assert.equal(successMessage, response.response, 'Did not receive correct response');
                    }).catch(function (error) {
                        error = error;
                        throw new Error('Get without headers failed: ' + error.message);
                    });
                });
                it('Request get without headers (expect failure)', function () {
                    var failUrl = 'http://www.example.org/fail';
                    var failMessage = 'Fail response';
                    return request.get(failUrl).then(function (response) {
                        throw new Error('Request should have failed but got response: ' + response);
                    }).catch(function (error) {
                        error = error;
                        chai_1.assert.equal(failMessage, error.message, 'Did not receive correct error message');
                    });
                });
                it('Request get with header', function () {
                    var headerUrl = 'http://www.example.org/forwardheader';
                    var headerField = 'X-Test';
                    var headerMessage = 'Header message';
                    return request.get(headerUrl, [[headerField, headerMessage]]).then(function (response) {
                        chai_1.assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
                    }).catch(function (error) {
                        error = error;
                        throw new Error('Get with header forwarding failed: ' + error);
                    });
                });
                it('Request get with three retries', function () {
                    var retryUrl = 'http://www.example.org/retry';
                    var successMessage = 'Success response';
                    var retryAttempts = 3;
                    var retryDelay = 10;
                    return request.get(retryUrl, [], {
                        retries: retryAttempts,
                        retryDelay: retryDelay,
                        followRedirects: false,
                        retryWithConnectionEvents: false
                    }).then(function (response) {
                        chai_1.assert.equal(successMessage, response.response, 'Did not get success message when retrying');
                    }).catch(function (error) {
                        error = error;
                        throw new Error('Get with retrying failed: ' + error.message);
                    });
                });
                it('Request post without headers (expect success)', function () {
                    var successUrl = 'http://www.example.org/success';
                    var successMessage = 'Success response';
                    return request.post(successUrl, 'Test').then(function (response) {
                        chai_1.assert.equal(successMessage, response.response, 'Did not receive correct response');
                    }).catch(function (error) {
                        error = error;
                        throw new Error('Post without headers failed: ' + error.message);
                    });
                });
                it('Request post without headers (expect failure)', function () {
                    var failUrl = 'http://www.example.org/fail';
                    var failMessage = 'Fail response';
                    return request.post(failUrl, 'Test').then(function (response) {
                        throw new Error('Request should have failed but got response: ' + response);
                    }).catch(function (error) {
                        error = error;
                        chai_1.assert.equal(failMessage, error.message, 'Did not receive correct error message');
                    });
                });
                it('Request post with header', function () {
                    var headerUrl = 'http://www.example.org/forwardheader';
                    var headerField = 'X-Test';
                    var headerMessage = 'Header message';
                    return request.post(headerUrl, 'Test', [[headerField, headerMessage]]).then(function (response) {
                        chai_1.assert.equal(headerMessage, response.response, 'Did not get correctly forwarded header response');
                    }).catch(function (error) {
                        error = error;
                        throw new Error('Post with header forwarding failed: ' + error.message);
                    });
                });
                it('Request post with forwarded body', function () {
                    var testUrl = 'http://www.example.org/forwardbody';
                    var bodyMessage = 'Body message';
                    return request.post(testUrl, bodyMessage).then(function (response) {
                        chai_1.assert.equal(bodyMessage, response.response, 'Did not get correctly forwarded body');
                    }).catch(function (error) {
                        error = error;
                        throw new Error('Post with body forwarding failed: ' + error.message);
                    });
                });
                it('Request post with three retries', function () {
                    var retryUrl = 'http://www.example.org/retry';
                    var successMessage = 'Success response';
                    var retryAttempts = 3;
                    var retryDelay = 10;
                    return request.post(retryUrl, 'Test', [], {
                        retries: retryAttempts,
                        retryDelay: retryDelay,
                        followRedirects: false,
                        retryWithConnectionEvents: false
                    }).then(function (response) {
                        chai_1.assert.equal(successMessage, response.response, 'Did not get success message when retrying');
                    }).catch(function (error) {
                        error = error;
                        throw new Error('Post with retrying failed: ' + error.message);
                    });
                });
                it('Request should fail after retry attempts', function () {
                    var retryUrl = 'http://www.example.org/alwaysRetry';
                    var retryAttempts = 5;
                    var retryDelay = 10;
                    return request.get(retryUrl, [], {
                        retries: retryAttempts,
                        retryDelay: retryDelay,
                        followRedirects: false,
                        retryWithConnectionEvents: false
                    }).then(function (response) {
                        throw new Error('Should not have received a response');
                    }).catch(function (error) {
                        error = error;
                        chai_1.assert.equal('This URL always fails', error.message, 'Error was not correct after retries');
                    });
                });
                it('Request should succeed only after connection event', function () {
                    var clock = sinon.useFakeTimers();
                    var toggleUrl = 'http://www.example.org/toggle';
                    var successMessage = 'Success response';
                    requestApi.setToggleUrl(false);
                    var promise = request.get(toggleUrl, [], {
                        retries: 0,
                        retryDelay: 0,
                        followRedirects: false,
                        retryWithConnectionEvents: true
                    }).then(function (response) {
                        chai_1.assert.equal(successMessage, response.response, 'Did not receive correct response');
                    }).catch(function (error) {
                        error = error;
                        throw new Error('Get with connection event failed: ' + error.message);
                    });
                    requestApi.setToggleUrl(true);
                    clock.tick(20 * 60 * 1000);
                    nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
                    clock.tick(1);
                    clock.restore();
                    return promise;
                });
                describe('Request get should succeed for all status codes in the 2xx range', function () {
                    var _loop_1 = function (i) {
                        it('Request get should succeed for response code ' + i.toString(), function () {
                            var successUrl = 'http://www.example.org/responsecode/' + i.toString();
                            var successMessage = 'Success response';
                            return request.get(successUrl).then(function (response) {
                                chai_1.assert.equal(successMessage, response.response, 'Did not receive correct response');
                            }).catch(function (error) {
                                error = error;
                                throw new Error('Get without headers failed: ' + error.message);
                            });
                        });
                    };
                    for (var i = 200; i <= 206; i++) {
                        _loop_1(i);
                    }
                });
                describe('Request get should fail for all status codes in the 4xx range', function () {
                    var _loop_2 = function (i) {
                        it('Request get should fail for response code ' + i.toString(), function () {
                            var failureUrl = 'http://www.example.org/errorresponsecode/' + i.toString();
                            var reason = 'FAILED_WITH_ERROR_RESPONSE';
                            var failureResponse = '{"error": "Failure response"}';
                            return request.get(failureUrl).then(function (response) {
                                chai_1.assert.fail('Should not resolve');
                            }).catch(function (error) {
                                chai_1.assert.instanceOf(error, RequestError_1.RequestError);
                                error = error;
                                chai_1.assert.equal(error.message, reason);
                                chai_1.assert.equal(error.nativeResponse.responseCode, i);
                                chai_1.assert.equal(error.nativeResponse.response, failureResponse);
                            });
                        });
                    };
                    for (var i = 400; i <= 405; i++) {
                        _loop_2(i);
                    }
                });
                describe('Request get should fail for unknown status codes', function () {
                    it('Request get should fail for response code 600', function () {
                        var failureUrl = 'http://www.example.org/errorresponsecode/' + 600;
                        var reason = 'FAILED_WITH_UNKNOWN_RESPONSE_CODE';
                        var failureResponse = '{"error": "Failure response"}';
                        return request.get(failureUrl).then(function (response) {
                            chai_1.assert.fail('Should not resolve');
                        }).catch(function (error) {
                            chai_1.assert.instanceOf(error, RequestError_1.RequestError);
                            error = error;
                            chai_1.assert.equal(error.message, reason);
                            chai_1.assert.equal(error.nativeResponse.responseCode, 600);
                            chai_1.assert.equal(error.nativeResponse.response, failureResponse);
                        });
                    });
                });
                describe('Request followRedirectChain should redirect for all status codes in the 3xx range', function () {
                    var _loop_3 = function (i) {
                        it('should redirect for response ' + i.toString(), function () {
                            var redirectUrl = 'http://www.example.org/responsecode/' + i.toString();
                            return request.followRedirectChain(redirectUrl).then(function (url) {
                                chai_1.assert.equal('http://www.example.org/endurl/', url);
                            }).catch(function (error) {
                                error = error;
                                throw new Error('Head without headers failed: ' + error.message);
                            });
                        });
                    };
                    for (var i = 300; i <= 308; i++) {
                        _loop_3(i);
                    }
                    it('should reject when redirect limit has been reached', function () {
                        var redirectUrl = 'http://www.example.org/recursiveResponseCode/';
                        return request.followRedirectChain(redirectUrl).then(function (url) {
                            chai_1.assert.fail('Should not resolve');
                        }).catch(function (error) {
                            chai_1.assert.equal(error.message, 'redirect limit reached');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJSZXF1ZXN0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBV0E7Z0JBQTZCLDBDQUFVO2dCQUF2QztvQkFBQSxxRUEwR0M7b0JBekdXLGlCQUFXLEdBQVcsQ0FBQyxDQUFDO29CQUN4QixnQkFBVSxHQUFZLEtBQUssQ0FBQzs7Z0JBd0d4QyxDQUFDO2dCQXRHVSw0QkFBRyxHQUFWLFVBQVcsRUFBVSxFQUFFLEdBQVcsRUFBRSxPQUFnQztvQkFDaEUsSUFBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUMvQixJQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7cUJBQ2xFO3lCQUFNLElBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsZUFBZSxDQUFDLENBQUM7cUJBQ25EO3lCQUFNLElBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUM1QyxJQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7NEJBQzNCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7eUJBQzdEOzZCQUFNOzRCQUNILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLHdCQUF3QixDQUFDLENB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