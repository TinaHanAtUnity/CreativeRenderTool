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
            describe('VastTest', function () {
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
                    UnityAds_1.UnityAds.initialize(Platform_1.Platform.IOS, '333', listener, true);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJWYXN0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBV0EsUUFBUSxDQUFDLFVBQVUsRUFBRTtnQkFFakIsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLFVBQTJDLElBQWU7b0JBQzVGLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3BCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztvQkFDbkIsSUFBTSxRQUFRLEdBQXNCO3dCQUNoQyxlQUFlLEVBQUUsVUFBQyxTQUFpQjs0QkFDL0IsSUFBRyxFQUFFLFVBQVUsS0FBSyxDQUFDLEVBQUU7Z0NBQ25CLElBQUksRUFBRSxDQUFDOzZCQUNWO3dCQUNMLENBQUM7d0JBQ0QsZUFBZSxFQUFFLFVBQUMsU0FBaUI7NEJBQy9CLE9BQU87d0JBQ1gsQ0FBQzt3QkFDRCxnQkFBZ0IsRUFBRSxVQUFDLFNBQWlCLEVBQUUsS0FBYTs0QkFDL0MsT0FBTzt3QkFDWCxDQUFDO3dCQUNELGVBQWUsRUFBRSxVQUFDLEtBQWEsRUFBRSxPQUFlOzRCQUM1QyxPQUFPO3dCQUNYLENBQUM7d0JBQ0QsZUFBZSxFQUFFLFVBQUMsU0FBaUI7NEJBQy9CLE9BQU87d0JBQ1gsQ0FBQzt3QkFDRCwrQkFBK0IsRUFBRSxVQUFDLFNBQWlCLEVBQUUsUUFBZ0IsRUFBRSxRQUFnQjs0QkFDbkYsT0FBTzt3QkFDWCxDQUFDO3FCQUNKLENBQUM7b0JBRUYsdUJBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO29CQUM1RSx1QkFBVSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDcEMsdUJBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ2pDLHVCQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNsQyx1QkFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDL0IsdUJBQVUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hDLHVCQUFVLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUVoQyw2QkFBYSxDQUFDLGNBQWMsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO29CQUN4RSxpQ0FBZSxDQUFDLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO29CQUN0RSxxRUFBaUMsQ0FBQyxjQUFjLENBQUMseUNBQXlDLENBQUMsQ0FBQztvQkFFNUYsbUJBQVEsQ0FBQyxVQUFVLENBQUMsbUJBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0QsQ0FBQyxDQUFDLENBQUM7WUFFUCxDQUFDLENBQUMsQ0FBQyJ9