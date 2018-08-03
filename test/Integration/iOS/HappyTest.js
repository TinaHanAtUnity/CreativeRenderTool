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
            describe('IntegrationTest', function () {
                it('should handle happy path on iOS', function (done) {
                    this.timeout(10000);
                    var readyCount = 0;
                    var listener = {
                        onUnityAdsReady: function (placement) {
                            if (++readyCount === 1) {
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
                    UnityAds_1.UnityAds.initialize(Platform_1.Platform.IOS, '456', listener, true);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFwcHlUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSGFwcHlUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFXQSxRQUFRLENBQUMsaUJBQWlCLEVBQUU7Z0JBRXhCLEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxVQUEyQyxJQUFlO29CQUM1RixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNwQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7b0JBQ25CLElBQU0sUUFBUSxHQUFzQjt3QkFDaEMsZUFBZSxFQUFFLFVBQUMsU0FBaUI7NEJBQy9CLElBQUcsRUFBRSxVQUFVLEtBQUssQ0FBQyxFQUFFO2dDQUNuQixJQUFJLEVBQUUsQ0FBQzs2QkFDVjt3QkFDTCxDQUFDO3dCQUNELGVBQWUsRUFBRSxVQUFDLFNBQWlCOzRCQUMvQixPQUFPO3dCQUNYLENBQUM7d0JBQ0QsZ0JBQWdCLEVBQUUsVUFBQyxTQUFpQixFQUFFLEtBQWE7NEJBQy9DLE9BQU87d0JBQ1gsQ0FBQzt3QkFDRCxlQUFlLEVBQUUsVUFBQyxLQUFhLEVBQUUsT0FBZTs0QkFDNUMsT0FBTzt3QkFDWCxDQUFDO3dCQUNELGVBQWUsRUFBRSxVQUFDLFNBQWlCOzRCQUMvQixPQUFPO3dCQUNYLENBQUM7d0JBQ0QsK0JBQStCLEVBQUUsVUFBQyxTQUFpQixFQUFFLFFBQWdCLEVBQUUsUUFBZ0I7NEJBQ25GLE9BQU87d0JBQ1gsQ0FBQztxQkFDSixDQUFDO29CQUVGLHVCQUFVLENBQUMsd0JBQXdCLENBQUMsc0NBQXNDLENBQUMsQ0FBQztvQkFDNUUsdUJBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3BDLHVCQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUNqQyx1QkFBVSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDbEMsdUJBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQy9CLHVCQUFVLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNoQyx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFaEMsNkJBQWEsQ0FBQyxjQUFjLENBQUMseUNBQXlDLENBQUMsQ0FBQztvQkFDeEUsaUNBQWUsQ0FBQyxVQUFVLENBQUMseUNBQXlDLENBQUMsQ0FBQztvQkFDdEUscUVBQWlDLENBQUMsY0FBYyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7b0JBRTVGLG1CQUFRLENBQUMsVUFBVSxDQUFDLG1CQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzdELENBQUMsQ0FBQyxDQUFDO1lBRVAsQ0FBQyxDQUFDLENBQUMifQ==