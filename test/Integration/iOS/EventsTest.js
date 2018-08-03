System.register(["mocha", "chai", "Constants/Platform", "Native/Backend/UnityAds", "Constants/FinishState", "Native/Backend/Api/DeviceInfo", "Native/Backend/Api/Request", "AdUnits/AbstractAdUnit", "Managers/ConfigManager", "Managers/CampaignManager", "Managers/ProgrammaticOperativeEventManager"], function (exports_1, context_1) {
    "use strict";
    var chai_1, Platform_1, UnityAds_1, FinishState_1, DeviceInfo_1, Request_1, AbstractAdUnit_1, ConfigManager_1, CampaignManager_1, ProgrammaticOperativeEventManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (UnityAds_1_1) {
                UnityAds_1 = UnityAds_1_1;
            },
            function (FinishState_1_1) {
                FinishState_1 = FinishState_1_1;
            },
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (AbstractAdUnit_1_1) {
                AbstractAdUnit_1 = AbstractAdUnit_1_1;
            },
            function (ConfigManager_1_1) {
                ConfigManager_1 = ConfigManager_1_1;
            },
            function (CampaignManager_1_1) {
                CampaignManager_1 = CampaignManager_1_1;
            },
            function (ProgrammaticOperativeEventManager_1_1) {
                ProgrammaticOperativeEventManager_1 = ProgrammaticOperativeEventManager_1_1;
            }
        ],
        execute: function () {
            describe('EventsTest', function () {
                var currentGameId;
                var videoEvents = ['video_start', 'first_quartile', 'midpoint', 'third_quartile', 'video_end'];
                var findEventCount = function (requestLog, regexp) {
                    var count = 0;
                    requestLog.forEach(function (log) {
                        if (log.match(regexp)) {
                            ++count;
                        }
                    });
                    return count;
                };
                var validateRequestLog = function (requestLog, validationRegexps) {
                    chai_1.assert.equal(findEventCount(requestLog, '/games/\\d+/configuration'), 1, 'Did not find a configuration request');
                    chai_1.assert.equal(findEventCount(requestLog, '/v\\d+/games/\\d+/requests'), 3, 'Did not find 3 fill requests');
                    for (var _i = 0, validationRegexps_1 = validationRegexps; _i < validationRegexps_1.length; _i++) {
                        var regexp = validationRegexps_1[_i];
                        for (var _a = 0, videoEvents_1 = videoEvents; _a < videoEvents_1.length; _a++) {
                            var eventName = videoEvents_1[_a];
                            var eventRegexp = regexp.replace('{EVENT_NAME}', eventName);
                            eventRegexp = eventRegexp.replace('{GAME_ID}', currentGameId.toString());
                            chai_1.assert.equal(findEventCount(requestLog, eventRegexp), 1, 'Did not find a ' + eventName + ' event');
                        }
                    }
                };
                beforeEach(function (done) {
                    // tslint:disable:no-invalid-this
                    this.timeout(7000);
                    // tslint:enable
                    var xhr = new XMLHttpRequest();
                    xhr.timeout = 5000;
                    xhr.onload = function (event) {
                        var responseObj = JSON.parse(xhr.responseText);
                        currentGameId = responseObj.game_id;
                        done();
                    };
                    xhr.onerror = function () {
                        throw new Error(xhr.statusText);
                    };
                    xhr.open('GET', 'https://fake-ads-backend.applifier.info/setup/first_perf_then_vast?token=373a221f4df5c659f2df918f899fa403');
                    xhr.send();
                });
                afterEach(function (done) {
                    // tslint:disable:no-invalid-this
                    this.timeout(7000);
                    // tslint:enable
                    var xhr = new XMLHttpRequest();
                    xhr.timeout = 5000;
                    xhr.onload = function (event) {
                        done();
                    };
                    xhr.onerror = function () {
                        throw new Error(xhr.statusText);
                    };
                    xhr.open('GET', 'https://fake-ads-backend.applifier.info/fabulous/' + currentGameId + '/remove?token=373a221f4df5c659f2df918f899fa403');
                    xhr.send();
                });
                it('should include all operational events on iOS', function (done) {
                    this.timeout(60000);
                    var validationRegexps = ['/ack/{GAME_ID}\\?campaignId=000000000000000000000000&event={EVENT_NAME}', '/events/v2/brand/video/{EVENT_NAME}/{GAME_ID}/00005472656d6f7220694f53'];
                    var readyCount = 0;
                    var startCount = 0;
                    var listener = {
                        onUnityAdsReady: function (placement) {
                            if (++readyCount === 1) {
                                UnityAds_1.UnityAds.show(placement);
                            }
                            if (startCount === 1) {
                                UnityAds_1.UnityAds.show(placement);
                            }
                        },
                        onUnityAdsStart: function (placement) {
                            ++startCount;
                        },
                        onUnityAdsFinish: function (placement, state) {
                            if (state === FinishState_1.FinishState[FinishState_1.FinishState.COMPLETED]) {
                                if (startCount === 2) {
                                    setTimeout(function () {
                                        validateRequestLog(Request_1.Request.getLog(), validationRegexps);
                                        chai_1.assert.equal(startCount, 2, 'onUnityAdsStart was not called exactly 2 times');
                                        done();
                                    }, 2500);
                                }
                            }
                        },
                        onUnityAdsError: function (error, message) {
                            done(new Error(message));
                        },
                        onUnityAdsClick: function (placement) {
                            return;
                        },
                        onUnityAdsPlacementStateChanged: function (placement, oldState, newState) {
                            return;
                        }
                    };
                    Request_1.Request.setLog([]);
                    DeviceInfo_1.DeviceInfo.setAdvertisingTrackingId('DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21');
                    DeviceInfo_1.DeviceInfo.setManufacturer('Apple');
                    DeviceInfo_1.DeviceInfo.setModel('iPhone7,2');
                    DeviceInfo_1.DeviceInfo.setOsVersion('10.1.1');
                    DeviceInfo_1.DeviceInfo.setScreenWidth(647);
                    DeviceInfo_1.DeviceInfo.setScreenHeight(357);
                    DeviceInfo_1.DeviceInfo.setTimeZone('+0200');
                    AbstractAdUnit_1.AbstractAdUnit.setAutoClose(true);
                    ConfigManager_1.ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
                    CampaignManager_1.CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
                    ProgrammaticOperativeEventManager_1.ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
                    UnityAds_1.UnityAds.initialize(Platform_1.Platform.IOS, currentGameId.toString(), listener, true);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkV2ZW50c1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWVBLFFBQVEsQ0FBQyxZQUFZLEVBQUU7Z0JBRW5CLElBQUksYUFBcUIsQ0FBQztnQkFDMUIsSUFBTSxXQUFXLEdBQUcsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUVqRyxJQUFNLGNBQWMsR0FBRyxVQUFDLFVBQW9CLEVBQUUsTUFBYztvQkFDeEQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO29CQUNkLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO3dCQUNsQixJQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7NEJBQ2xCLEVBQUUsS0FBSyxDQUFDO3lCQUNYO29CQUNMLENBQUMsQ0FBQyxDQUFDO29CQUNILE9BQU8sS0FBSyxDQUFDO2dCQUNqQixDQUFDLENBQUM7Z0JBRUYsSUFBTSxrQkFBa0IsR0FBRyxVQUFDLFVBQW9CLEVBQUUsaUJBQTJCO29CQUN6RSxhQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsMkJBQTJCLENBQUMsRUFBRSxDQUFDLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztvQkFDakgsYUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxFQUFFLDhCQUE4QixDQUFDLENBQUM7b0JBRTFHLEtBQW9CLFVBQWlCLEVBQWpCLHVDQUFpQixFQUFqQiwrQkFBaUIsRUFBakIsSUFBaUIsRUFBRTt3QkFBbkMsSUFBTSxNQUFNLDBCQUFBO3dCQUNaLEtBQXVCLFVBQVcsRUFBWCwyQkFBVyxFQUFYLHlCQUFXLEVBQVgsSUFBVyxFQUFFOzRCQUFoQyxJQUFN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