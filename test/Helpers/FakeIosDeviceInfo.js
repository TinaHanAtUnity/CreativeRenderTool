System.register(["tslib", "Models/IosDeviceInfo", "json/FakeIosDeviceInfo.json"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, IosDeviceInfo_1, FakeIosDeviceInfo_json_1, FakeIosDeviceInfo;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (IosDeviceInfo_1_1) {
                IosDeviceInfo_1 = IosDeviceInfo_1_1;
            },
            function (FakeIosDeviceInfo_json_1_1) {
                FakeIosDeviceInfo_json_1 = FakeIosDeviceInfo_json_1_1;
            }
        ],
        execute: function () {
            FakeIosDeviceInfo = /** @class */ (function (_super) {
                tslib_1.__extends(FakeIosDeviceInfo, _super);
                function FakeIosDeviceInfo(nativeBridge) {
                    var _this = _super.call(this, nativeBridge) || this;
                    _this._fakeDevice = JSON.parse(FakeIosDeviceInfo_json_1.default);
                    return _this;
                }
                FakeIosDeviceInfo.prototype.fetch = function () {
                    return Promise.resolve(void (0));
                };
                FakeIosDeviceInfo.prototype.getStores = function () {
                    return 'apple';
                };
                FakeIosDeviceInfo.prototype.getAdvertisingIdentifier = function () {
                    return this._fakeDevice.advertisingId;
                };
                FakeIosDeviceInfo.prototype.getLimitAdTracking = function () {
                    return this._fakeDevice.trackingEnabled;
                };
                FakeIosDeviceInfo.prototype.getModel = function () {
                    return this._fakeDevice.deviceModel;
                };
                FakeIosDeviceInfo.prototype.getNetworkType = function () {
                    return Promise.resolve(this._fakeDevice.networkType);
                };
                FakeIosDeviceInfo.prototype.getNetworkOperator = function () {
                    return Promise.resolve(this._fakeDevice.networkOperator);
                };
                FakeIosDeviceInfo.prototype.getNetworkOperatorName = function () {
                    return Promise.resolve(this._fakeDevice.networkOperatorName);
                };
                FakeIosDeviceInfo.prototype.getOsVersion = function () {
                    return this._fakeDevice.osVersion;
                };
                FakeIosDeviceInfo.prototype.getScreenWidth = function () {
                    return Promise.resolve(this._fakeDevice.screenWidth);
                };
                FakeIosDeviceInfo.prototype.getScreenHeight = function () {
                    return Promise.resolve(this._fakeDevice.screenHeight);
                };
                FakeIosDeviceInfo.prototype.getScreenScale = function () {
                    return this._fakeDevice.screenScale;
                };
                FakeIosDeviceInfo.prototype.getUserInterfaceIdiom = function () {
                    return this._fakeDevice.userInterfaceIdiom;
                };
                FakeIosDeviceInfo.prototype.isRooted = function () {
                    return this._fakeDevice.rooted;
                };
                FakeIosDeviceInfo.prototype.getConnectionType = function () {
                    return Promise.resolve(this._fakeDevice.connectionType);
                };
                FakeIosDeviceInfo.prototype.getTimeZone = function () {
                    return this._fakeDevice.timeZone;
                };
                FakeIosDeviceInfo.prototype.getFreeSpace = function () {
                    return Promise.resolve(this._fakeDevice.freeSpaceInternal);
                };
                FakeIosDeviceInfo.prototype.getTotalSpace = function () {
                    return this._fakeDevice.totalSpaceInternal;
                };
                FakeIosDeviceInfo.prototype.getLanguage = function () {
                    return this._fakeDevice.language;
                };
                FakeIosDeviceInfo.prototype.isSimulator = function () {
                    return this._fakeDevice.simulator;
                };
                FakeIosDeviceInfo.prototype.getHeadset = function () {
                    return Promise.resolve(this._fakeDevice.headset);
                };
                FakeIosDeviceInfo.prototype.getDeviceVolume = function () {
                    return Promise.resolve(this._fakeDevice.deviceVolume);
                };
                FakeIosDeviceInfo.prototype.getScreenBrightness = function () {
                    return Promise.resolve(this._fakeDevice.screenBrightness);
                };
                FakeIosDeviceInfo.prototype.getBatteryLevel = function () {
                    return Promise.resolve(this._fakeDevice.batteryLevel);
                };
                FakeIosDeviceInfo.prototype.getBatteryStatus = function () {
                    return Promise.resolve(this._fakeDevice.batteryStatus);
                };
                FakeIosDeviceInfo.prototype.getFreeMemory = function () {
                    return Promise.resolve(this._fakeDevice.freeMemory);
                };
                FakeIosDeviceInfo.prototype.getTotalMemory = function () {
                    return this._fakeDevice.totalMemory;
                };
                FakeIosDeviceInfo.prototype.getDTO = function () {
                    return Promise.resolve(this._fakeDevice);
                };
                return FakeIosDeviceInfo;
            }(IosDeviceInfo_1.IosDeviceInfo));
            exports_1("FakeIosDeviceInfo", FakeIosDeviceInfo);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZUlvc0RldmljZUluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJGYWtlSW9zRGV2aWNlSW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztZQVFBO2dCQUF1Qyw2Q0FBYTtnQkFJaEQsMkJBQVksWUFBMEI7b0JBQXRDLFlBQ0ksa0JBQU0sWUFBWSxDQUFDLFNBRXRCO29CQURHLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQ0FBVyxDQUFDLENBQUM7O2dCQUMvQyxDQUFDO2dCQUVNLGlDQUFLLEdBQVo7b0JBQ0ksT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFNLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO2dCQUVNLHFDQUFTLEdBQWhCO29CQUNJLE9BQU8sT0FBTyxDQUFDO2dCQUNuQixDQUFDO2dCQUVNLG9EQUF3QixHQUEvQjtvQkFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO2dCQUMxQyxDQUFDO2dCQUVNLDhDQUFrQixHQUF6QjtvQkFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDO2dCQUM1QyxDQUFDO2dCQUVNLG9DQUFRLEdBQWY7b0JBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztnQkFDeEMsQ0FBQztnQkFFTSwwQ0FBYyxHQUFyQjtvQkFDSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDekQsQ0FBQztnQkFFTSw4Q0FBa0IsR0FBekI7b0JBQ0ksT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzdELENBQUM7Z0JBRU0sa0RBQXNCLEdBQTdCO29CQUNJLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLG1C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