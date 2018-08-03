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
                it('should handle happy path on Android', function (done) {
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
                    UnityAds_1.UnityAds.initialize(Platform_1.Platform.ANDROID, '456', listener, true);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFwcHlUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiSGFwcHlUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFXQSxRQUFRLENBQUMsaUJBQWlCLEVBQUU7Z0JBRXhCLEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxVQUEyQyxJQUFlO29CQUNoRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNwQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7b0JBQ25CLElBQU0sUUFBUSxHQUFzQjt3QkFDaEMsZUFBZSxFQUFFLFVBQUMsU0FBaUI7NEJBQy9CLElBQUcsRUFBRSxVQUFVLEtBQUssQ0FBQyxFQUFFO2dDQUNuQixJQUFJLEVBQUUsQ0FBQzs2QkFDVjt3QkFDTCxDQUFDO3dCQUNELGVBQWUsRUFBRSxVQUFDLFNBQWlCOzRCQUMvQixPQUFPO3dCQUNYLENBQUM7d0JBQ0QsZ0JBQWdCLEVBQUUsVUFBQyxTQUFpQixFQUFFLEtBQWE7NEJBQy9DLE9BQU87d0JBQ1gsQ0FBQzt3QkFDRCxlQUFlLEVBQUUsVUFBQyxLQUFhLEVBQUUsT0FBZTs0QkFDNUMsT0FBTzt3QkFDWCxDQUFDO3dCQUNELGVBQWUsRUFBRSxVQUFDLFNBQWlCOzRCQUMvQixPQUFPO3dCQUNYLENBQUM7d0JBQ0QsK0JBQStCLEVBQUUsVUFBQyxTQUFpQixFQUFFLFFBQWdCLEVBQUUsUUFBZ0I7NEJBQ25GLE9BQU87d0JBQ1gsQ0FBQztxQkFDSixDQUFDO29CQUVGLHVCQUFVLENBQUMsd0JBQXdCLENBQUMsc0NBQXNDLENBQUMsQ0FBQztvQkFDNUUsdUJBQVUsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2xDLHVCQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMvQix1QkFBVSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDakMsdUJBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2hDLHVCQUFVLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqQyx1QkFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFFcEMsNkJBQWEsQ0FBQyxjQUFjLENBQUMseUNBQXlDLENBQUMsQ0FBQztvQkFDeEUsaUNBQWUsQ0FBQyxVQUFVLENBQUMseUNBQXlDLENBQUMsQ0FBQztvQkFDdEUscUVBQWlDLENBQUMsY0FBYyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7b0JBRTVGLG1CQUFRLENBQUMsVUFBVSxDQUFDLG1CQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2pFLENBQUMsQ0FBQyxDQUFDO1lBRVAsQ0FBQyxDQUFDLENBQUMifQ==