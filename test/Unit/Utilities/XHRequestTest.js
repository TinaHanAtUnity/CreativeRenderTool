System.register(["tslib", "mocha", "chai", "sinon", "Utilities/XHRequest"], function (exports_1, context_1) {
    "use strict";
    var _this, tslib_1, chai_1, sinon, XHRequest_1;
    _this = this;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (XHRequest_1_1) {
                XHRequest_1 = XHRequest_1_1;
            }
        ],
        execute: function () {
            describe('XHRequestTest', function () {
                var server;
                beforeEach(function () {
                    server = sinon.fakeServer.create({
                        autoRespond: true,
                        autoRespondAfter: 5
                    });
                });
                afterEach(function () {
                    server.restore();
                });
                [
                    [200, {}, 'OK'],
                    [299, {}, 'Status code 299']
                ].forEach(function (params) {
                    return it("should give an OK response for status code " + params[0], function () {
                        server.respondWith('GET', 'https://api.unity3d.com/test', params);
                        return XHRequest_1.XHRequest.get('https://api.unity3d.com/test').then(function (responseText) {
                            chai_1.assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                            chai_1.assert.equal(params[2], responseText);
                        });
                    });
                });
                [
                    [199, {}, 'Status code 199'],
                    [300, {}, 'Bad Request'],
                    [404, {}, 'File not found'],
                    [500, {}, 'Server Error'] // Common HTTP error code
                ].forEach(function (params) {
                    return it("should fail from bad response for status code " + params[0], function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var err_1;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    server.respondWith('GET', 'https://api.unity3d.com/test', params);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, XHRequest_1.XHRequest.get('https://api.unity3d.com/test')];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_1 = _a.sent();
                                    chai_1.assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                                    chai_1.assert.isTrue(err_1 instanceof Error, 'Did not fail from the file not being found');
                                    chai_1.assert.equal(err_1.toString(), "Error: Request failed with status code " + params[0]);
                                    return [2 /*return*/];
                                case 4:
                                    chai_1.assert.fail('Promise was not rejected');
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
                // Test skipped since is not faking XMLHttpRequest properly.
                xit('should give an OK response from the file', function () {
                    server.respondWith('GET', 'file:///path/to/file.txt', [0, {}, 'File content']);
                    return XHRequest_1.XHRequest.get('file:///path/to/file.txt').then(function (responseText) {
                        chai_1.assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                        chai_1.assert.equal('File content', responseText);
                    });
                });
                it('should fail from file:// with status not 0', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var err_2;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                server.respondWith('GET', /\/path\/to\/file.txt$/, [300, {}, 'Text']);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, XHRequest_1.XHRequest.get('file:///path/to/file.txt')];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_2 = _a.sent();
                                chai_1.assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                                chai_1.assert.isTrue(err_2 instanceof Error, 'Did not fail from the error');
                                chai_1.assert.equal(err_2.toString(), 'Error: Request failed with status code 300');
                                return [2 /*return*/];
                            case 4:
                                chai_1.assert.fail('Promise was not rejected');
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should fail from network error', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var promise, err_3;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                promise = XHRequest_1.XHRequest.get('https://api.unity3d.com/test');
                                chai_1.assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                                // Simulating network error
                                server.requests[0].error();
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, promise];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_3 = _a.sent();
                                chai_1.assert.isTrue(err_3 instanceof Error, 'Did not fail from the error');
                                chai_1.assert.equal(err_3.toString(), 'Error: Error ocurred while executing request: status - 0');
                                return [2 /*return*/];
                            case 4:
                                chai_1.assert.fail('Promise was not rejected');
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should fail from abort', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var promise, xhr, err_4;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                promise = XHRequest_1.XHRequest.get('https://api.unity3d.com/test');
                                chai_1.assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                                xhr = server.requests[0];
                                xhr.abort();
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, promise];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_4 = _a.sent();
                                chai_1.assert.isTrue(err_4 instanceof Error, 'Did not fail from the error');
                                chai_1.assert.equal(err_4.toString(), 'Error: Request was aborted');
                                return [2 /*return*/];
                            case 4:
                                chai_1.assert.fail('Promise was not rejected');
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should fail from timeout error', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var promise, xhr, err_5;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                promise = XHRequest_1.XHRequest.get('https://api.unity3d.com/test');
                                xhr = server.requests[0];
                                xhr.timedOut = true; // Accessing internal sinon variable to trigger timeout. HACK!
                                xhr.respond(200, {}, '');
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, promise];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                err_5 = _a.sent();
                                chai_1.assert.isTrue(err_5 instanceof Error, 'Did not fail from the error');
                                chai_1.assert.equal(err_5.toString(), 'Error: Request timed out');
                                return [2 /*return*/];
                            case 4:
                                chai_1.assert.fail('Promise was not rejected');
                                return [2 /*return*/];
                        }
                    });
                }); });
                it('should call open with GET', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var openSpy, err_6;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                openSpy = sinon.spy(XMLHttpRequest.prototype, 'open');
                                server.respondWith('GET', 'https://api.unity3d.com/test', [200, {}, 'OK']);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, 4, 5]);
                                return [4 /*yield*/, XHRequest_1.XHRequest.get('https://api.unity3d.com/test')];
                            case 2:
                                _a.sent();
                                return [3 /*break*/, 5];
                            case 3:
                                err_6 = _a.sent();
                                return [3 /*break*/, 5];
                            case 4:
                                // Restoring 'open' method even in error case
                                openSpy.restore();
                                return [7 /*endfinally*/];
                            case 5:
                                chai_1.assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                                chai_1.assert.isTrue(openSpy.called, 'Did not call function open'); // Checking if actually did a call
                                chai_1.assert.equal(openSpy.firstCall.args[0], 'GET', 'Did not call function open with GET');
                                return [2 /*return*/];
                        }
                    });
                }); });
                // Checking if we are calling decodeURIComponent or not.
                [
                    ['https://api.unity3d.com/test', 'https://api.unity3d.com/test'],
                    ['https://api.unity3d.com/test%3Fx%3Dtest', 'https://api.unity3d.com/test?x=test']
                ].forEach(function (_a) {
                    var url = _a[0], decodedUrl = _a[1];
                    return it('should correctly decode url ' + decodedUrl, function () {
                        server.respondWith('GET', decodedUrl, [200, {}, 'data']);
                        return XHRequest_1.XHRequest.get(url).then(function () {
                            chai_1.assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWEhSZXF1ZXN0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlhIUmVxdWVzdFRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFLQSxRQUFRLENBQUMsZUFBZSxFQUFFO2dCQUV0QixJQUFJLE1BQTZCLENBQUM7Z0JBRWxDLFVBQVUsQ0FBQztvQkFDUCxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7d0JBQzdCLFdBQVcsRUFBRSxJQUFJO3dCQUNqQixnQkFBZ0IsRUFBRSxDQUFDO3FCQUN0QixDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDO29CQUNOLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDckIsQ0FBQyxDQUFDLENBQUM7Z0JBRUg7b0JBQ0ksQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztvQkFDZixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsaUJBQWlCLENBQUM7aUJBQy9CLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTTtvQkFDYixPQUFBLEVBQUUsQ0FBQyxnREFBOEMsTUFBTSxDQUFDLENBQUMsQ0FBRyxFQUFFO3dCQUMxRCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSw4QkFBOEIsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFFbEUsT0FBTyxxQkFBUyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFlBQVk7NEJBQ25FLGFBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLHlEQUF5RCxDQUFDLENBQUM7NEJBQ25HLGFBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO3dCQUMxQyxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUM7Z0JBUEYs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