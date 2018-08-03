System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Utilities/Localization", "Test/Unit/TestHelpers/TestFixtures", "Views/PerformanceEndScreen", "Views/Privacy", "html/fixtures/EndScreenFixture.html"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Localization_1, TestFixtures_1, PerformanceEndScreen_1, Privacy_1, EndScreenFixture_html_1;
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
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Localization_1_1) {
                Localization_1 = Localization_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (PerformanceEndScreen_1_1) {
                PerformanceEndScreen_1 = PerformanceEndScreen_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
            },
            function (EndScreenFixture_html_1_1) {
                EndScreenFixture_html_1 = EndScreenFixture_html_1_1;
            }
        ],
        execute: function () {
            describe('EndScreen', function () {
                var handleInvocation;
                var handleCallback;
                var nativeBridge;
                var configuration;
                beforeEach(function () {
                    handleInvocation = sinon.spy();
                    handleCallback = sinon.spy();
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    Localization_1.Localization.setLanguageMap('fi.*', 'endscreen', {
                        'Download For Free': 'Lataa ilmaiseksi'
                    });
                    configuration = TestFixtures_1.TestFixtures.getConfiguration();
                });
                var createEndScreen = function (language) {
                    var privacy = new Privacy_1.Privacy(nativeBridge, false);
                    var params = {
                        nativeBridge: nativeBridge,
                        language: language,
                        gameId: 'testGameId',
                        targetGameName: TestFixtures_1.TestFixtures.getCampaign().getGameName(),
                        abGroup: configuration.getAbGroup(),
                        privacy: privacy,
                        showGDPRBanner: false,
                        campaignId: TestFixtures_1.TestFixtures.getCampaign().getId()
                    };
                    return new PerformanceEndScreen_1.PerformanceEndScreen(params, TestFixtures_1.TestFixtures.getCampaign());
                };
                xit('should render', function () {
                    var endScreen = createEndScreen('en');
                    endScreen.render();
                    chai_1.assert.equal(endScreen.container().innerHTML, EndScreenFixture_html_1.default);
                });
                it('should render with translations', function () {
                    var endScreen = createEndScreen('fi');
                    endScreen.render();
                    var downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
                    chai_1.assert.equal(downloadElement.innerHTML, 'Lataa ilmaiseksi');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW5kU2NyZWVuVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkVuZFNjcmVlblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWNBLFFBQVEsQ0FBQyxXQUFXLEVBQUU7Z0JBQ2xCLElBQUksZ0JBQWdDLENBQUM7Z0JBQ3JDLElBQUksY0FBOEIsQ0FBQztnQkFDbkMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLGFBQTRCLENBQUM7Z0JBRWpDLFVBQVUsQ0FBQztvQkFDUCxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQy9CLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQzdCLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUM7d0JBQzVCLGdCQUFnQixrQkFBQTt3QkFDaEIsY0FBYyxnQkFBQTtxQkFDakIsQ0FBQyxDQUFDO29CQUNILDJCQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUU7d0JBQzdDLG1CQUFtQixFQUFFLGtCQUFrQjtxQkFDMUMsQ0FBQyxDQUFDO29CQUNILGFBQWEsR0FBRywyQkFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3BELENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQU0sZUFBZSxHQUFHLFVBQUMsUUFBaUI7b0JBQ3RDLElBQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ2pELElBQU0sTUFBTSxHQUEwQjt3QkFDbEMsWUFBWSxjQUFBO3dCQUNaLFFBQVEsVUFBQTt3QkFDUixNQUFNLEVBQUUsWUFBWTt3QkFDcEIsY0FBYyxFQUFFLDJCQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsV0FBVyxFQUFFO3dCQUN4RCxPQUFPLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBRTt3QkFDbkMsT0FBTyxTQUFBO3dCQUNQLGNBQWMsRUFBRSxLQUFLO3dCQUNyQixVQUFVLEVBQUUsMkJBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUU7cUJBQ2pELENBQUM7b0JBQ0YsT0FBTyxJQUFJLDJDQUFvQixDQUFDLE1BQU0sRUFBRSwyQkFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQ3hFLENBQUMsQ0FBQztnQkFFRixHQUFHLENBQUMsZUFBZSxFQUFFO29CQUNqQixJQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3hDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDbkIsYUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLCtCQUFnQixDQUFDLENBQUM7Z0JBQ3BFLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRTtvQkFDbEMsSUFBTSxTQUFTLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN4QyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ25CLElBQU0sZUFBZSxHQUFHLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwRixhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDaEUsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyJ9