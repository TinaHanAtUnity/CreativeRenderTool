System.register(["tslib", "mocha", "sinon", "chai", "Utilities/Resolve", "Native/NativeBridge", "Native/Api/Resolve"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, sinon, chai_1, Resolve_1, NativeBridge_1, Resolve_2, TestResolveApi;
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
            function (Resolve_1_1) {
                Resolve_1 = Resolve_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Resolve_2_1) {
                Resolve_2 = Resolve_2_1;
            }
        ],
        execute: function () {
            TestResolveApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestResolveApi, _super);
                function TestResolveApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestResolveApi.prototype.resolve = function (id, host) {
                    var _this = this;
                    if (host.indexOf('fail') !== -1) {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['RESOLVE', 'FAILED', id, host, 'Error', 'Error message']);
                        }, 0);
                    }
                    else {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['RESOLVE', 'COMPLETE', id, host, '1.2.3.4']);
                        }, 0);
                    }
                    return Promise.resolve(id);
                };
                return TestResolveApi;
            }(Resolve_2.ResolveApi));
            describe('ResolveTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge, resolveApi, resolve;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    resolveApi = nativeBridge.Resolve = new TestResolveApi(nativeBridge);
                    resolve = new Resolve_1.Resolve(nativeBridge);
                });
                it('Resolve host with success', function () {
                    var testHost = 'www.example.net';
                    var testIp = '1.2.3.4';
                    return resolve.resolve(testHost).then(function (_a) {
                        var id = _a[0], host = _a[1], ip = _a[2];
                        chai_1.assert.equal(testHost, host, 'Hostname does not match the request');
                        chai_1.assert.equal(testIp, ip, 'IP address was not successfully resolved');
                    });
                });
                it('Resolve host with failure', function () {
                    var failHost = 'www.fail.com';
                    var expectedError = 'Error';
                    var expectedErrorMsg = 'Error message';
                    return resolve.resolve(failHost).then(function () {
                        chai_1.assert.fail('Failed resolve must not be successful');
                    }, function (_a) {
                        var error = _a[0], errorMsg = _a[1];
                        chai_1.assert.equal(expectedError, error, 'Failed resolve error does not match');
                        chai_1.assert.equal(expectedErrorMsg, errorMsg, 'Failed resolve error message does not match');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzb2x2ZVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJSZXNvbHZlVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBUUE7Z0JBQTZCLDBDQUFVO2dCQUF2Qzs7Z0JBZUEsQ0FBQztnQkFiVSxnQ0FBTyxHQUFkLFVBQWUsRUFBVSxFQUFFLElBQVk7b0JBQXZDLGlCQVdDO29CQVZHLElBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTt3QkFDNUIsVUFBVSxDQUFDOzRCQUNQLEtBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO3dCQUM5RixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQ1Q7eUJBQU07d0JBQ0gsVUFBVSxDQUFDOzRCQUNQLEtBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ2pGLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztxQkFDVDtvQkFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQy9CLENBQUM7Z0JBRUwscUJBQUM7WUFBRCxDQUFDLEFBZkQsQ0FBNkIsb0JBQVUsR0FldEM7WUFFRCxRQUFRLENBQUMsYUFBYSxFQUFFO2dCQUNwQixJQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDckMsSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLFlBQTBCLEVBQUUsVUFBMEIsRUFBRSxPQUFnQixDQUFDO2dCQUU3RSxVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQzt3QkFDNUIsZ0JBQWdCLGtCQUFBO3dCQUNoQixjQUFjLGdCQUFBO3FCQUNqQixDQUFDLENBQUM7b0JBRUgsVUFBVSxHQUFHLFlBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3JFLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtvQkFDNUIsSUFBTSxRQUFRLEdBQVcsaUJBQWlCLENBQUM7b0JBQzNDLElBQU0sTUFBTSxHQUFXLFNBQVMsQ0FBQztvQkFFakMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQWM7NEJBQWIsVUFBRSxFQUFFLFlBQUksRUFBRSxVQUFFO3dCQUNoRCxhQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUscUNBQXFDLENBQUMsQ0FBQzt3QkFDcEUsYUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLDBDQUEwQyxDQUFDLENBQUM7b0JBQ3pFLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRTtvQkFDNUIsSUFBTSxRQUFRLEdBQVcsY0FBYyxDQUFDO29CQUN4QyxJQUFNLGFBQWEsR0FBVyxPQUFPLENBQUM7b0JBQ3RDLElBQU0sZ0JBQWdCLEdBQVcsZUFBZSxDQUFDO29CQUVqRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDO3dCQUNsQyxhQUFNLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7b0JBQ3pELENBQUMsRUFBRSxVQUFDLEVBQWlCOzRCQUFoQixhQUFLLEVBQUUsZ0JBQVE7d0JBQ2hCLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO3dCQUMxRSxhQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLFFBQVEsRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDO29CQUM1RixDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=