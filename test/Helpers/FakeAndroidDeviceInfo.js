System.register(["tslib", "Models/AndroidDeviceInfo", "json/FakeAndroidDeviceInfo.json"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, AndroidDeviceInfo_1, FakeAndroidDeviceInfo_json_1, FakeAndroidDeviceInfo;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (AndroidDeviceInfo_1_1) {
                AndroidDeviceInfo_1 = AndroidDeviceInfo_1_1;
            },
            function (FakeAndroidDeviceInfo_json_1_1) {
                FakeAndroidDeviceInfo_json_1 = FakeAndroidDeviceInfo_json_1_1;
            }
        ],
        execute: function () {
            FakeAndroidDeviceInfo = /** @class */ (function (_super) {
                tslib_1.__extends(FakeAndroidDeviceInfo, _super);
                function FakeAndroidDeviceInfo(nativeBridge) {
                    var _this = _super.call(this, nativeBridge) || this;
                    _this._fakeDevice = JSON.parse(FakeAndroidDeviceInfo_json_1.default);
                    return _this;
                }
                FakeAndroidDeviceInfo.prototype.fetch = function () {
                    return Promise.resolve(void (0));
                };
                FakeAndroidDeviceInfo.prototype.getStores = function () {
                    return 'xiaomi,google';
                };
                FakeAndroidDeviceInfo.prototype.getAndroidId = function () {
                    return this._fakeDevice.androidId;
                };
                FakeAndroidDeviceInfo.prototype.getAdvertisingIdentifier = function () {
                    return this._fakeDevice.advertisingId;
                };
                FakeAndroidDeviceInfo.prototype.getApkDigest = function () {
                    return this._fakeDevice.apkDigest;
                };
                FakeAndroidDeviceInfo.prototype.getLimitAdTracking = function () {
                    return this._fakeDevice.trackingEnabled;
                };
                FakeAndroidDeviceInfo.prototype.getApiLevel = function () {
                    return this._fakeDevice.apiLevel;
                };
                FakeAndroidDeviceInfo.prototype.getManufacturer = function () {
                    return this._fakeDevice.deviceMake;
                };
                FakeAndroidDeviceInfo.prototype.getModel = function () {
                    return this._fakeDevice.deviceModel;
                };
                FakeAndroidDeviceInfo.prototype.getNetworkType = function () {
                    return Promise.resolve(this._fakeDevice.networkType);
                };
                FakeAndroidDeviceInfo.prototype.getNetworkOperator = function () {
                    return Promise.resolve(this._fakeDevice.networkOperator);
                };
                FakeAndroidDeviceInfo.prototype.getNetworkOperatorName = function () {
                    return Promise.resolve(this._fakeDevice.networkOperatorName);
                };
                FakeAndroidDeviceInfo.prototype.getOsVersion = function () {
                    return this._fakeDevice.osVersion;
                };
                FakeAndroidDeviceInfo.prototype.getScreenLayout = function () {
                    return this._fakeDevice.screenLayout;
                };
                FakeAndroidDeviceInfo.prototype.getScreenDensity = function () {
                    return this._fakeDevice.screenDensity;
                };
                FakeAndroidDeviceInfo.prototype.getScreenWidth = function () {
                    return Promise.resolve(this._fakeDevice.screenWidth);
                };
                FakeAndroidDeviceInfo.prototype.getScreenHeight = function () {
                    return Promise.resolve(this._fakeDevice.screenHeight);
                };
                FakeAndroidDeviceInfo.prototype.isRooted = function () {
                    return this._fakeDevice.rooted;
                };
                FakeAndroidDeviceInfo.prototype.getConnectionType = function () {
                    return Promise.resolve(this._fakeDevice.connectionType);
                };
                FakeAndroidDeviceInfo.prototype.getTimeZone = function () {
                    return this._fakeDevice.timeZone;
                };
                FakeAndroidDeviceInfo.prototype.getFreeSpace = function () {
                    return Promise.resolve(this._fakeDevice.freeSpaceInternal);
                };
                FakeAndroidDeviceInfo.prototype.getFreeSpaceExternal = function () {
                    return Promise.resolve(this._fakeDevice.freeSpaceExternal);
                };
                FakeAndroidDeviceInfo.prototype.getTotalSpace = function () {
                    return this._fakeDevice.totalSpaceInternal;
                };
                FakeAndroidDeviceInfo.prototype.getTotalSpaceExternal = function () {
                    return this._fakeDevice.totalSpaceExternal;
                };
                FakeAndroidDeviceInfo.prototype.getLanguage = function () {
                    return this._fakeDevice.language;
                };
                FakeAndroidDeviceInfo.prototype.getHeadset = function () {
                    return Promise.resolve(this._fakeDevice.headset);
                };
                FakeAndroidDeviceInfo.prototype.getRingerMode = function () {
                    return Promise.resolve(this._fakeDevice.ringerMode);
                };
                FakeAndroidDeviceInfo.prototype.getDeviceVolume = function () {
                    return Promise.resolve(this._fakeDevice.deviceVolume);
                };
                FakeAndroidDeviceInfo.prototype.getScreenBrightness = function () {
                    return Promise.resolve(this._fakeDevice.screenBrightness);
                };
                FakeAndroidDeviceInfo.prototype.getBatteryLevel = function () {
                    return Promise.resolve(this._fakeDevice.batteryLevel);
                };
                FakeAndroidDeviceInfo.prototype.getBatteryStatus = function () {
                    return Promise.resolve(this._fakeDevice.batteryStatus);
                };
                FakeAndroidDeviceInfo.prototype.getFreeMemory = function () {
                    return Promise.resolve(this._fakeDevice.freeMemory);
                };
                FakeAndroidDeviceInfo.prototype.getTotalMemory = function () {
                    return this._fakeDevice.totalMemory;
                };
                FakeAndroidDeviceInfo.prototype.getDTO = function () {
                    return Promise.resolve(this._fakeDevice);
                };
                return FakeAndroidDeviceInfo;
            }(AndroidDeviceInfo_1.AndroidDeviceInfo));
            exports_1("FakeAndroidDeviceInfo", FakeAndroidDeviceInfo);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZUFuZHJvaWREZXZpY2VJbmZvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRmFrZUFuZHJvaWREZXZpY2VJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBUUE7Z0JBQTJDLGlEQUFpQjtnQkFJeEQsK0JBQVksWUFBMEI7b0JBQXRDLFlBQ0ksa0JBQU0sWUFBWSxDQUFDLFNBRXRCO29CQURHLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQ0FBZSxDQUFDLENBQUM7O2dCQUNuRCxDQUFDO2dCQUVNLHFDQUFLLEdBQVo7b0JBQ0ksT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFNLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDO2dCQUVNLHlDQUFTLEdBQWhCO29CQUNJLE9BQU8sZUFBZSxDQUFDO2dCQUMzQixDQUFDO2dCQUVNLDRDQUFZLEdBQW5CO29CQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7Z0JBQ3RDLENBQUM7Z0JBRU0sd0RBQXdCLEdBQS9CO29CQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7Z0JBQzFDLENBQUM7Z0JBRU0sNENBQVksR0FBbkI7b0JBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsQ0FBQztnQkFFTSxrREFBa0IsR0FBekI7b0JBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQztnQkFDNUMsQ0FBQztnQkFFTSwyQ0FBVyxHQUFsQjtvQkFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO2dCQUNyQyxDQUFDO2dCQUVNLCtDQUFlLEdBQXRCO29CQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBRU0sd0NBQVEsR0FBZjtvQkFDSSxPQUFPLElBQUksQ0FBQyxXQUFX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