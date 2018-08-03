System.register(["tslib", "mocha", "sinon", "chai", "Constants/Platform", "Constants/EventCategory", "Native/Api/DeviceInfo", "Constants/Android/StreamType", "Models/AndroidDeviceInfo", "Models/IosDeviceInfo", "Test/Unit/TestHelpers/TestFixtures", "Native/Api/DeviceInfoEvent"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, sinon, chai_1, Platform_1, EventCategory_1, DeviceInfo_1, StreamType_1, AndroidDeviceInfo_1, IosDeviceInfo_1, TestFixtures_1, DeviceInfoEvent_1;
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
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (EventCategory_1_1) {
                EventCategory_1 = EventCategory_1_1;
            },
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
            },
            function (StreamType_1_1) {
                StreamType_1 = StreamType_1_1;
            },
            function (AndroidDeviceInfo_1_1) {
                AndroidDeviceInfo_1 = AndroidDeviceInfo_1_1;
            },
            function (IosDeviceInfo_1_1) {
                IosDeviceInfo_1 = IosDeviceInfo_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (DeviceInfoEvent_1_1) {
                DeviceInfoEvent_1 = DeviceInfoEvent_1_1;
            }
        ],
        execute: function () {
            describe('DeviceInfoTest', function () {
                var deviceInfo;
                var nativeBridge;
                beforeEach(function () {
                    nativeBridge = {
                        getPlatform: function () {
                            return Platform_1.Platform.TEST;
                        },
                        DeviceInfo: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeDeviceInfo(), { Android: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeAndroidDeviceInfo()) })
                    };
                    deviceInfo = new AndroidDeviceInfo_1.AndroidDeviceInfo(nativeBridge);
                    return deviceInfo.fetch();
                });
                it('should represent float values for screenWidth or screenHeight as integers from flooring actual values', function (done) {
                    nativeBridge = {
                        getPlatform: function () {
                            return Platform_1.Platform.TEST;
                        },
                        DeviceInfo: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeDeviceInfo(), { getScreenHeight: sinon.stub().returns(Promise.resolve(1200.123)), getScreenWidth: sinon.stub().returns(Promise.resolve(800.123)), Android: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeAndroidDeviceInfo()) })
                    };
                    deviceInfo = new AndroidDeviceInfo_1.AndroidDeviceInfo(nativeBridge);
                    Promise.all([
                        deviceInfo.getScreenHeight(),
                        deviceInfo.getScreenWidth()
                    ]).then(function (_a) {
                        var adjustedHeight = _a[0], adjustedWidth = _a[1];
                        chai_1.assert.equal(adjustedHeight, 1200);
                        chai_1.assert.equal(adjustedWidth, 800);
                        done();
                    });
                });
                it('Get DeviceInfo DTO', function () {
                    return deviceInfo.getDTO().then(function (dto) {
                        chai_1.assert.equal(dto.connectionType, 'wifi');
                        chai_1.assert.equal(dto.networkType, 0);
                        chai_1.assert.equal(dto.osVersion, 'testVersion');
                        chai_1.assert.equal(dto.deviceModel, 'testModel');
                        chai_1.assert.equal(dto.screenHeight, '1200');
                        chai_1.assert.equal(dto.screenWidth, '800');
                        chai_1.assert.equal(dto.language, 'fi');
                        chai_1.assert.equal(dto.rooted, true);
                        chai_1.assert.equal(dto.timeZone, '+0100');
                        chai_1.assert.equal(dto.totalMemory, '1024');
                        chai_1.assert.equal(dto.headset, true);
                        chai_1.assert.equal(dto.screenBrightness, 0.7);
                        chai_1.assert.equal(dto.batteryLevel, 0.3);
                        chai_1.assert.equal(dto.batteryStatus, 1);
                        chai_1.assert.equal(dto.freeMemory, 1024);
                    });
                });
            });
            describe('DeviceInfoTest Android', function () {
                var deviceInfo;
                var nativeBridge;
                var deviceInfoApi;
                it('Get DeviceInfo DTO Android with GAID', function () {
                    nativeBridge = {
                        getPlatform: function () {
                            return Platform_1.Platform.ANDROID;
                        },
                        DeviceInfo: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeDeviceInfo(), { Android: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeAndroidDeviceInfo()) })
                    };
                    deviceInfo = new AndroidDeviceInfo_1.AndroidDeviceInfo(nativeBridge);
                    return deviceInfo.fetch().then(function () { return deviceInfo.getDTO(); }).then(function (dto) {
                        chai_1.assert.equal(dto.androidId, undefined);
                        chai_1.assert.equal(dto.apiLevel, 16);
                        chai_1.assert.equal(dto.deviceMake, 'N');
                        chai_1.assert.equal(dto.screenDensity, 2);
                        chai_1.assert.equal(dto.screenLayout, 1);
                        chai_1.assert.equal(dto.freeSpaceInternal, 16);
                        chai_1.assert.equal(dto.networkOperatorName, 'operatorName');
                        chai_1.assert.equal(dto.networkOperator, 'operator');
                        chai_1.assert.equal(dto.ringerMode, 2);
                        chai_1.assert.equal(dto.deviceVolume, 0.5);
                        chai_1.assert.equal(dto.totalSpaceExternal, 2048);
                        chai_1.assert.equal(dto.totalSpaceInternal, 2048);
                    });
                });
                it('Get DeviceInfo DTO Android without GAID', function () {
                    nativeBridge = {
                        getPlatform: function () {
                            return Platform_1.Platform.ANDROID;
                        },
                        DeviceInfo: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeDeviceInfo(), { getAdvertisingTrackingId: sinon.stub().returns(Promise.resolve(undefined)), Android: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeAndroidDeviceInfo()) })
                    };
                    deviceInfo = new AndroidDeviceInfo_1.AndroidDeviceInfo(nativeBridge);
                    return deviceInfo.fetch().then(function () { return deviceInfo.getDTO(); }).then(function (dto) {
                        chai_1.assert.equal(dto.androidId, '17');
                    });
                });
                it('Volume change', function (done) {
                    nativeBridge = {
                        getPlatform: function () {
                            return Platform_1.Platform.ANDROID;
                        },
                        handleEvent: function (parameters) {
                            var receivedCategory = parameters.shift();
                            if (receivedCategory === EventCategory_1.EventCategory[EventCategory_1.EventCategory.DEVICEINFO]) {
                                var receivedEvent = parameters.shift();
                                deviceInfoApi.Android.handleEvent(receivedEvent, parameters);
                            }
                        },
                        DeviceInfo: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeDeviceInfo(), { Android: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeAndroidDeviceInfo()) })
                    };
                    deviceInfo = new AndroidDeviceInfo_1.AndroidDeviceInfo(nativeBridge);
                    deviceInfoApi = new DeviceInfo_1.DeviceInfoApi(nativeBridge);
                    var receivedStreamType = -1;
                    var triggered = false;
                    var receivedVolume = 0;
                    var receivedMaxVolume = 0;
                    deviceInfoApi.Android.onVolumeChanged.subscribe(function (streamType, volume, maxVolume) {
                        triggered = true;
                        receivedStreamType = streamType;
                        receivedVolume = volume;
                        receivedMaxVolume = maxVolume;
                        chai_1.assert.equal(triggered, true);
                        chai_1.assert.equal(receivedStreamType, StreamType_1.StreamType.STREAM_MUSIC);
                        chai_1.assert.equal(receivedVolume, 0.5);
                        chai_1.assert.equal(receivedMaxVolume, 1);
                        done();
                    });
                    nativeBridge.handleEvent([EventCategory_1.EventCategory[EventCategory_1.EventCategory.DEVICEINFO], DeviceInfoEvent_1.DeviceInfoEvent[DeviceInfoEvent_1.DeviceInfoEvent.VOLUME_CHANGED], StreamType_1.StreamType.STREAM_MUSIC, 0.5, 1]);
                });
            });
            describe('DeviceInfoTest iOS', function () {
                var deviceInfo;
                var nativeBridge;
                var deviceInfoApi;
                beforeEach(function () {
                    nativeBridge = {
                        getPlatform: function () {
                            return Platform_1.Platform.IOS;
                        },
                        handleEvent: function (parameters) {
                            var receivedCategory = parameters.shift();
                            if (receivedCategory === EventCategory_1.EventCategory[EventCategory_1.EventCategory.DEVICEINFO]) {
                                var receivedEvent = parameters.shift();
                                deviceInfoApi.Ios.handleEvent(receivedEvent, parameters);
                            }
                        },
                        DeviceInfo: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeDeviceInfo(), { Ios: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeIosDeviceInfo()) })
                    };
                    deviceInfo = new IosDeviceInfo_1.IosDeviceInfo(nativeBridge);
                    deviceInfoApi = new DeviceInfo_1.DeviceInfoApi(nativeBridge);
                    return deviceInfo.fetch();
                });
                it('Get DeviceInfo DTO iOS', function () {
                    return deviceInfo.getDTO().then(function (dto) {
                        chai_1.assert.equal(dto.userInterfaceIdiom, 1);
                        chai_1.assert.equal(dto.screenScale, 2);
                        chai_1.assert.equal(dto.simulator, true);
                        chai_1.assert.equal(dto.freeSpaceInternal, 16);
                        chai_1.assert.equal(dto.networkOperatorName, 'operatorName');
                        chai_1.assert.equal(dto.networkOperator, 'operator');
                        chai_1.assert.equal(dto.deviceVolume, 0.5);
                        chai_1.assert.equal(dto.totalSpaceInternal, 1024);
                    });
                });
                it('Volume change', function (done) {
                    var triggered = false;
                    var receivedVolume = 0;
                    var receivedMaxVolume = 0;
                    deviceInfoApi.Ios.onVolumeChanged.subscribe(function (volume, maxVolume) {
                        triggered = true;
                        receivedVolume = volume;
                        receivedMaxVolume = maxVolume;
                        chai_1.assert.equal(triggered, true);
                        chai_1.assert.equal(receivedVolume, 0.5);
                        chai_1.assert.equal(receivedMaxVolume, 1);
                        done();
                    });
                    nativeBridge.handleEvent([EventCategory_1.EventCategory[EventCategory_1.EventCategory.DEVICEINFO], DeviceInfoEvent_1.DeviceInfoEvent[DeviceInfoEvent_1.DeviceInfoEvent.VOLUME_CHANGED], 0.5, 1]);
                });
            });
            describe('DeviceInfoTest catch random reject', function () {
                var deviceInfo;
                var nativeBridge;
                beforeEach(function () {
                    nativeBridge = {
                        getPlatform: function () {
                            return Platform_1.Platform.TEST;
                        },
                        Sdk: {
                            logWarning: function (msg) { return; }
                        },
                        DeviceInfo: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeDeviceInfo(), { getAdvertisingTrackingId: sinon.stub().returns(Promise.reject(new Error('advertisingIdError'))), isRooted: sinon.stub().returns(Promise.reject(new Error('testError'))), Android: tslib_1.__assign({}, TestFixtures_1.TestFixtures.getFakeNativeAndroidDeviceInfo()) })
                    };
                    deviceInfo = new AndroidDeviceInfo_1.AndroidDeviceInfo(nativeBridge);
                    return deviceInfo.fetch();
                });
                it('Get DeviceInfo DTO', function () {
                    return deviceInfo.getDTO().then(function (dto) {
                        chai_1.assert.equal(dto.connectionType, 'wifi');
                        chai_1.assert.equal(dto.networkType, 0);
                        chai_1.assert.equal(dto.trackingEnabled, undefined);
                        chai_1.assert.isUndefined(dto.advertisingId, 'Stub throws error, should be null');
                        chai_1.assert.equal(dto.osVersion, 'testVersion');
                        chai_1.assert.equal(dto.deviceModel, 'testModel');
                        chai_1.assert.equal(dto.screenHeight, '1200');
                        chai_1.assert.equal(dto.screenWidth, '800');
                        chai_1.assert.equal(dto.language, 'fi');
                        chai_1.assert.isUndefined(dto.rooted, 'Stub throws error, should be null');
                        chai_1.assert.equal(dto.timeZone, '+0100');
                        chai_1.assert.equal(dto.totalMemory, '1024');
                        chai_1.assert.equal(dto.headset, true);
                        chai_1.assert.equal(dto.screenBrightness, 0.7);
                        chai_1.assert.equal(dto.batteryLevel, 0.3);
                        chai_1.assert.equal(dto.batteryStatus, 1);
                        chai_1.assert.equal(dto.freeMemory, 1024);
                    });
                });
            });
            describe('DeviceInfoTest reject promises', function () {
                var deviceInfo;
                var nativeBridge;
                beforeEach(function () {
                    nativeBridge = {
                        getPlatform: function () {
                            return Platform_1.Platform.TEST;
                        },
                        Sdk: {
                            logWarning: function (msg) { return; }
                        },
                        DeviceInfo: {
                            getConnectionType: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getNetworkType: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getAdvertisingTrackingId: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getLimitAdTrackingFlag: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getOsVersion: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getModel: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getScreenHeight: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getScreenWidth: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getSystemLanguage: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            isRooted: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getTimeZone: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getTotalMemory: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getHeadset: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getScreenBrightness: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getBatteryLevel: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getBatteryStatus: sinon.stub().returns(Promise.reject(new Error('testError'))),
                            getFreeMemory: sinon.stub().returns(Promise.reject(new Error('testError')))
                        }
                    };
                    deviceInfo = new AndroidDeviceInfo_1.AndroidDeviceInfo(nativeBridge);
                    return deviceInfo.fetch();
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlSW5mb1Rlc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRGV2aWNlSW5mb1Rlc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFjQSxRQUFRLENBQUMsZ0JBQWdCLEVBQUU7Z0JBRXZCLElBQUksVUFBNkIsQ0FBQztnQkFDbEMsSUFBSSxZQUEwQixDQUFDO2dCQUUvQixVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFzQjt3QkFDOUIsV0FBVyxFQUFFOzRCQUNULE9BQU8sbUJBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQ3pCLENBQUM7d0JBQ0QsVUFBVSx1QkFDRiwyQkFBWSxDQUFDLHVCQUF1QixFQUFFLElBRTFDLE9BQU8sdUJBQ0MsMkJBQVksQ0FBQyw4QkFBOEIsRUFBRSxJQUV4RDtxQkFFSixDQUFDO29CQUNGLFVBQVUsR0FBRyxJQUFJLHFDQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNqRCxPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFFOUIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLHVHQUF1RyxFQUFFLFVBQUMsSUFBSTtvQkFDN0csWUFBWSxHQUFzQjt3QkFDOUIsV0FBVyxFQUFFOzRCQUNULE9BQU8sbUJBQVEsQ0FBQyxJQUFJLENBQUM7d0JBQ3pCLENBQUM7d0JBQ0QsVUFBVSx1QkFDRiwyQkFBWSxDQUFDLHVCQUF1QixFQUFFLElBQzFDLGVBQWUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDaEUsY0FBYyxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUU5RCxPQUFPLHVCQUNDLDJCQUFZLENBQUMsOEJBQThCLEVBQUUsSUFF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SUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDdEYsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQ3BGLFlBQVksRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDMUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDOzRCQUN0RSxlQUFlLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQzdFLGNBQWMsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDNUUsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQy9FLFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDdEUsV0FBVyxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDOzRCQUN6RSxjQUFjLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQzVFLFVBQVUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDeEUsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQ2pGLGVBQWUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDN0UsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQzlFLGFBQWEsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzt5QkFDOUU7cUJBRUosQ0FBQztvQkFDRixVQUFVLEdBQUcsSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDakQsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzlCLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==