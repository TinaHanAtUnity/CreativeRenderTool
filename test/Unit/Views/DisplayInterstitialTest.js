System.register(["mocha", "sinon", "chai", "Views/DisplayInterstitial", "Models/Placement", "json/DummyDisplayInterstitialCampaign.json", "Constants/Platform", "Test/Unit/TestHelpers/TestFixtures", "Views/Privacy"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, DisplayInterstitial_1, Placement_1, DummyDisplayInterstitialCampaign_json_1, Platform_1, TestFixtures_1, Privacy_1, json;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (DisplayInterstitial_1_1) {
                DisplayInterstitial_1 = DisplayInterstitial_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (DummyDisplayInterstitialCampaign_json_1_1) {
                DummyDisplayInterstitialCampaign_json_1 = DummyDisplayInterstitialCampaign_json_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
            }
        ],
        execute: function () {
            json = JSON.parse(DummyDisplayInterstitialCampaign_json_1.default);
            describe('DisplayInterstitial View', function () {
                var view;
                var nativeBridge;
                var placement;
                var campaign;
                var sandbox;
                describe('on Display Interstitial Markup Campaign', function () {
                    viewUnitTests();
                });
                function viewUnitTests() {
                    beforeEach(function () {
                        sandbox = sinon.sandbox.create();
                        nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                        placement = new Placement_1.Placement({
                            id: '123',
                            name: 'test',
                            default: true,
                            allowSkip: true,
                            skipInSeconds: 5,
                            disableBackButton: true,
                            useDeviceOrientationForVideo: false,
                            muteVideo: false
                        });
                        campaign = TestFixtures_1.TestFixtures.getDisplayInterstitialCampaign();
                        var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                        var privacy = new Privacy_1.Privacy(nativeBridge, configuration.isCoppaCompliant());
                        view = new DisplayInterstitial_1.DisplayInterstitial(nativeBridge, placement, campaign, privacy, false);
                        sandbox.stub(nativeBridge, 'getPlatform').returns(Platform_1.Platform.ANDROID);
                        sandbox.stub(nativeBridge, 'getApiLevel').returns(16);
                    });
                    afterEach(function () {
                        sandbox.restore();
                    });
                    // Disabled because of missing srcdoc support on Android < 4.4
                    xit('should render', function () {
                        view.render();
                        var srcdoc = view.container().querySelector('#display-iframe').getAttribute('srcdoc');
                        chai_1.assert.isNotNull(srcdoc);
                        chai_1.assert.isTrue(srcdoc.indexOf(json.display.markup) !== -1);
                    });
                    it('should show', function () {
                        view.render();
                        view.show();
                        view.hide();
                    });
                }
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEaXNwbGF5SW50ZXJzdGl0aWFsVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBWU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsK0NBQWdDLENBQUMsQ0FBQztZQUUxRCxRQUFRLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ2pDLElBQUksSUFBeUIsQ0FBQztnQkFDOUIsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLFNBQW9CLENBQUM7Z0JBQ3pCLElBQUksUUFBcUMsQ0FBQztnQkFDMUMsSUFBSSxPQUEyQixDQUFDO2dCQUVoQyxRQUFRLENBQUMseUNBQXlDLEVBQUU7b0JBQ2hELGFBQWEsRUFBRSxDQUFDO2dCQUNwQixDQUFDLENBQUMsQ0FBQztnQkFFSCxTQUFTLGFBQWE7b0JBQ2xCLFVBQVUsQ0FBQzt3QkFDUCxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDakMsWUFBWSxHQUFHLDJCQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7d0JBQzlDLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQUM7NEJBQ3RCLEVBQUUsRUFBRSxLQUFLOzRCQUNULElBQUksRUFBRSxNQUFNOzRCQUNaLE9BQU8sRUFBRSxJQUFJOzRCQUNiLFNBQVMsRUFBRSxJQUFJOzRCQUNmLGFBQWEsRUFBRSxDQUFDOzRCQUNoQixpQkFBaUIsRUFBRSxJQUFJOzRCQUN2Qiw0QkFBNEIsRUFBRSxLQUFLOzRCQUNuQyxTQUFTLEVBQUUsS0FBSzt5QkFDbkIsQ0FBQyxDQUFDO3dCQUNILFFBQVEsR0FBRywyQkFBWSxDQUFDLDhCQUE4QixFQUFFLENBQUM7d0JBQ3pELElBQU0sYUFBYSxHQUFHLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzt3QkFFdEQsSUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO3dCQUU1RSxJQUFJLEdBQUcsSUFBSSx5Q0FBbUIsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBRWxGLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzFELENBQUMsQ0FBQyxDQUFDO29CQUVILFNBQVMsQ0FBQzt3QkFDTixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3RCLENBQUMsQ0FBQyxDQUFDO29CQUVILDhEQUE4RDtvQkFDOUQsR0FBRyxDQUFDLGVBQWUsRUFBRTt3QkFDakIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNkLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBRXpGLGFBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3pCLGFBQU0sQ0FBQyxNQUFNLENBQUMsTUFBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxhQUFhLEVBQUU7d0JBQ2QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNkLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDWixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQyJ9