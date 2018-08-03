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
                it('should handle happy path on iOS', function (done) {
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
                    DeviceInfo_1.DeviceInfo.setAdvertisingTrackingId('DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21');
                    DeviceInfo_1.DeviceInfo.setManufacturer('Apple');
                    DeviceInfo_1.DeviceInfo.setModel('iPhone7,2');
                    DeviceInfo_1.DeviceInfo.setOsVersion('10.1.1');
                    DeviceInfo_1.DeviceInfo.setScreenWidth(357);
                    DeviceInfo_1.DeviceInfo.setScreenHeight(647);
                    DeviceInfo_1.DeviceInfo.setTimeZone('+0200');
                    ConfigManager_1.ConfigManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
                    CampaignManager_1.CampaignManager.setBaseUrl('https://fake-ads-backend.applifier.info');
                    ProgrammaticOperativeEventManager_1.ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.applifier.info');
                    UnityAds_1.UnityAds.initialize(Platform_1.Platform.IOS, '444', listener, true);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXJhaWRUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTXJhaWRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFXQSxRQUFRLENBQUMsV0FBVyxFQUFFO2dCQUVsQixFQUFFLENBQUMsaUNBQWlDLEVBQUUsVUFBMkMsSUFBZTtvQkFDNUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDcEIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO29CQUNuQixJQUFNLFFBQVEsR0FBc0I7d0JBQ2hDLGVBQWUsRUFBRSxVQUFDLFNBQWlCOzRCQUMvQixJQUFHLEVBQUUsVUFBVSxLQUFLLENBQUMsRUFBRTtnQ0FDbkIsSUFBSSxFQUFFLENBQUM7NkJBQ1Y7d0JBQ0wsQ0FBQzt3QkFDRCxlQUFlLEVBQUUsVUFBQyxTQUFpQjs0QkFDL0IsT0FBTzt3QkFDWCxDQUFDO3dCQUNELGdCQUFnQixFQUFFLFVBQUMsU0FBaUIsRUFBRSxLQUFhOzRCQUMvQyxPQUFPO3dCQUNYLENBQUM7d0JBQ0QsZUFBZSxFQUFFLFVBQUMsS0FBYSxFQUFFLE9BQWU7NEJBQzVDLE9BQU87d0JBQ1gsQ0FBQzt3QkFDRCxlQUFlLEVBQUUsVUFBQyxTQUFpQjs0QkFDL0IsT0FBTzt3QkFDWCxDQUFDO3dCQUNELCtCQUErQixFQUFFLFVBQUMsU0FBaUIsRUFBRSxRQUFnQixFQUFFLFFBQWdCOzRCQUNuRixPQUFPO3dCQUNYLENBQUM7cUJBQ0osQ0FBQztvQkFFRix1QkFBVSxDQUFDLHdCQUF3QixDQUFDLHNDQUFzQyxDQUFDLENBQUM7b0JBQzVFLHVCQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNwQyx1QkFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDakMsdUJBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2xDLHVCQUFVLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMvQix1QkFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDaEMsdUJBQVUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRWhDLDZCQUFhLENBQUMsY0FBYyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7b0JBQ3hFLGlDQUFlLENBQUMsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLENBQUM7b0JBQ3RFLHFFQUFpQyxDQUFDLGNBQWMsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO29CQUU1RixtQkFBUSxDQUFDLFVBQVUsQ0FBQyxtQkFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM3RCxDQUFDLENBQUMsQ0FBQztZQUVQLENBQUMsQ0FBQyxDQUFDIn0=