System.register(["mocha", "sinon", "chai", "../TestHelpers/TestFixtures", "Views/VastEndScreen", "Native/NativeBridge", "html/fixtures/VastEndScreenFixture.html"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, TestFixtures_1, VastEndScreen_1, NativeBridge_1, VastEndScreenFixture_html_1;
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
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (VastEndScreen_1_1) {
                VastEndScreen_1 = VastEndScreen_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (VastEndScreenFixture_html_1_1) {
                VastEndScreenFixture_html_1 = VastEndScreenFixture_html_1_1;
            }
        ],
        execute: function () {
            describe('VastEndScreen', function () {
                var handleInvocation;
                var handleCallback;
                var nativeBridge;
                beforeEach(function () {
                    handleInvocation = sinon.spy();
                    handleCallback = sinon.spy();
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                });
                it('should render', function () {
                    var vastCampaign = TestFixtures_1.TestFixtures.getCompanionVastCampaign();
                    var endScreen = new VastEndScreen_1.VastEndScreen(nativeBridge, false, vastCampaign, 'testGameId');
                    endScreen.render();
                    chai_1.assert.equal(endScreen.container().innerHTML, VastEndScreenFixture_html_1.default);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEVuZFNjcmVlblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJWYXN0RW5kU2NyZWVuVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBVUEsUUFBUSxDQUFDLGVBQWUsRUFBRTtnQkFDdEIsSUFBSSxnQkFBZ0MsQ0FBQztnQkFDckMsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLFlBQTBCLENBQUM7Z0JBRS9CLFVBQVUsQ0FBQztvQkFDUCxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQy9CLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQzdCLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUM7d0JBQzVCLGdCQUFnQixrQkFBQTt3QkFDaEIsY0FBYyxnQkFBQTtxQkFDakIsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxlQUFlLEVBQUU7b0JBQ2hCLElBQU0sWUFBWSxHQUFHLDJCQUFZLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztvQkFDN0QsSUFBTSxTQUFTLEdBQUcsSUFBSSw2QkFBYSxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUNyRixTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ25CLGFBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsRUFBRSxtQ0FBb0IsQ0FBQyxDQUFDO2dCQUN4RSxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=