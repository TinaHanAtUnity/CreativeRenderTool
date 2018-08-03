System.register(["mocha", "Constants/Platform", "Native/Backend/UnityAds", "Native/Backend/Api/DeviceInfo", "Managers/ConfigManager", "Managers/CampaignManager", "Managers/ProgrammaticOperativeEventManager"], function (exports_1, context_1) {
    "use strict";
    var Platform_1, UnityAds_1, DeviceInfo_1, ConfigManager_1, CampaignManager_1, ProgrammaticOperativeEventManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (UnityAds_1_1) {
                UnityAds_1 = UnityAds_1_1;
            },
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
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
            describe('MraidTest', function () {
                it('should handle happy path on Android', function (done) {
                    this.timeout(10000);
                    var readyCount = 0;
                    var listener = {
                        onUnityAdsReady: function (placement) {
                            if (++readyCount === 2) {
                                done();
                            }
                        },
                        onUnityAdsStart: function (placement) {
                            return;
                        },
                        onUnityAdsFinish: function (placement, state) {
                            return;
                        },
                        onUnityAdsError: function (error, message) {
                            return;
                        },
                        onUnityAdsClick: function (placement) {
                            return;
                        },
                        onUnityAdsPlacementStateChanged: function (placement, oldState, newState) {
                            return;
                        }
                    };
                    DeviceInfo_1.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
                    DeviceInfo_1.DeviceInfo.setManufacturer('LGE');
                    DeviceInfo_1.DeviceInfo.setModel('Nexus 5');
                    DeviceInfo_1.DeviceInfo.setOsVersion('6.0.1');
                    DeviceInfo_1.DeviceInfo.setScreenWidth(1080);
                    DeviceInfo_1.DeviceInfo.setScreenHeight(1776);
                    DeviceInfo_1.DeviceInfo.setTimeZone('GMT+02:00');
                    ConfigManager_1.ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
                    CampaignManager_1.CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
                    ProgrammaticOperativeEventManager_1.ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
                    UnityAds_1.UnityAds.initialize(Platform_1.Platform.ANDROID, '444', listener, true);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXJhaWRUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTXJhaWRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFXQSxRQUFRLENBQUMsV0FBVyxFQUFFO2dCQUVsQixFQUFFLENBQUMscUNBQXFDLEVBQUUsVUFBMkMsSUFBZTtvQkFDaEcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDcEIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO29CQUNuQixJQUFNLFFBQVEsR0FBc0I7d0JBQ2hDLGVBQWUsRUFBRSxVQUFDLFNBQWlCOzRCQUMvQixJQUFJLEVBQUUsVUFBVSxLQUFLLENBQUMsRUFBRTtnQ0FDcEIsSUFBSSxFQUFFLENBQUM7NkJBQ1Y7d0JBQ0wsQ0FBQzt3QkFDRCxlQUFlLEVBQUUsVUFBQyxTQUFpQjs0QkFDL0IsT0FBTzt3QkFDWCxDQUFDO3dCQUNELGdCQUFnQixFQUFFLFVBQUMsU0FBaUIsRUFBRSxLQUFhOzRCQUMvQyxPQUFPO3dCQUNYLENBQUM7d0JBQ0QsZUFBZSxFQUFFLFVBQUMsS0FBYSxFQUFFLE9BQWU7NEJBQzVDLE9BQU87d0JBQ1gsQ0FBQzt3QkFDRCxlQUFlLEVBQUUsVUFBQyxTQUFpQjs0QkFDL0IsT0FBTzt3QkFDWCxDQUFDO3dCQUNELCtCQUErQixFQUFFLFVBQUMsU0FBaUIsRUFBRSxRQUFnQixFQUFFLFFBQWdCOzRCQUNuRixPQUFPO3dCQUNYLENBQUM7cUJBQ0osQ0FBQztvQkFFRix1QkFBVSxDQUFDLHdCQUF3QixDQUFDLHNDQUFzQyxDQUFDLENBQUM7b0JBQzVFLHVCQUFVLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNsQyx1QkFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDL0IsdUJBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ2pDLHVCQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNoQyx1QkFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakMsdUJBQVUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBRXBDLDZCQUFhLENBQUMsY0FBYyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7b0JBQ3hFLGlDQUFlLENBQUMsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLENBQUM7b0JBQ3RFLHFFQUFpQyxDQUFDLGNBQWMsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO29CQUU1RixtQkFBUSxDQUFDLFVBQVUsQ0FBQyxtQkFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqRSxDQUFDLENBQUMsQ0FBQztZQUVQLENBQUMsQ0FBQyxDQUFDIn0=