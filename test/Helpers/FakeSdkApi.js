System.register(["tslib", "Native/Api/Sdk"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, Sdk_1, FakeSdkApi;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            }
        ],
        execute: function () {
            // mock of SDK API to ignore native logging calls in tests
            FakeSdkApi = /** @class */ (function (_super) {
                tslib_1.__extends(FakeSdkApi, _super);
                function FakeSdkApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                FakeSdkApi.prototype.logError = function (message) {
                    return Promise.resolve();
                };
                FakeSdkApi.prototype.logWarning = function (message) {
                    return Promise.resolve();
                };
                FakeSdkApi.prototype.logInfo = function (message) {
                    return Promise.resolve();
                };
                FakeSdkApi.prototype.logDebug = function (message) {
                    return Promise.resolve();
                };
                return FakeSdkApi;
            }(Sdk_1.SdkApi));
            exports_1("FakeSdkApi", FakeSdkApi);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZVNka0FwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZha2VTZGtBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7WUFFQSwwREFBMEQ7WUFDMUQ7Z0JBQWdDLHNDQUFNO2dCQUF0Qzs7Z0JBZ0JBLENBQUM7Z0JBZlUsNkJBQVEsR0FBZixVQUFnQixPQUFlO29CQUMzQixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQztnQkFFTSwrQkFBVSxHQUFqQixVQUFrQixPQUFlO29CQUM3QixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQztnQkFFTSw0QkFBTyxHQUFkLFVBQWUsT0FBZTtvQkFDMUIsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzdCLENBQUM7Z0JBRU0sNkJBQVEsR0FBZixVQUFnQixPQUFlO29CQUMzQixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQztnQkFDTCxpQkFBQztZQUFELENBQUMsQUFoQkQsQ0FBZ0MsWUFBTSxHQWdCckMifQ==