System.register(["tslib", "AdUnits/AbstractAdUnit"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, AbstractAdUnit_1, TestAdUnit;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (AbstractAdUnit_1_1) {
                AbstractAdUnit_1 = AbstractAdUnit_1_1;
            }
        ],
        execute: function () {
            TestAdUnit = /** @class */ (function (_super) {
                tslib_1.__extends(TestAdUnit, _super);
                function TestAdUnit(nativeBridge, parameters) {
                    return _super.call(this, nativeBridge, parameters) || this;
                }
                TestAdUnit.prototype.show = function () {
                    return Promise.resolve();
                };
                TestAdUnit.prototype.hide = function () {
                    return Promise.resolve();
                };
                TestAdUnit.prototype.isShowing = function () {
                    return false;
                };
                TestAdUnit.prototype.description = function () {
                    return 'test';
                };
                TestAdUnit.prototype.isCached = function () {
                    return false;
                };
                return TestAdUnit;
            }(AbstractAdUnit_1.AbstractAdUnit));
            exports_1("TestAdUnit", TestAdUnit);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEFkVW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlRlc3RBZFVuaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7WUFJQTtnQkFBZ0Msc0NBQWM7Z0JBRTFDLG9CQUFZLFlBQTBCLEVBQUUsVUFBdUM7MkJBQzNFLGtCQUFNLFlBQVksRUFBRSxVQUFVLENBQUM7Z0JBQ25DLENBQUM7Z0JBRU0seUJBQUksR0FBWDtvQkFDSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDN0IsQ0FBQztnQkFFTSx5QkFBSSxHQUFYO29CQUNJLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM3QixDQUFDO2dCQUVNLDhCQUFTLEdBQWhCO29CQUNJLE9BQU8sS0FBSyxDQUFDO2dCQUNqQixDQUFDO2dCQUVNLGdDQUFXLEdBQWxCO29CQUNJLE9BQU8sTUFBTSxDQUFDO2dCQUNsQixDQUFDO2dCQUVNLDZCQUFRLEdBQWY7b0JBQ0ksT0FBTyxLQUFLLENBQUM7Z0JBQ2pCLENBQUM7Z0JBQ0wsaUJBQUM7WUFBRCxDQUFDLEFBekJELENBQWdDLCtCQUFjLEdBeUI3QyJ9