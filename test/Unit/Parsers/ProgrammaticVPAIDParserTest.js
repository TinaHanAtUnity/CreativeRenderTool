System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Utilities/Request", "Models/AuctionResponse", "../TestHelpers/TestFixtures", "Native/Api/Sdk", "Parsers/ProgrammaticVPAIDParser", "json/campaigns/vpaid/ProgrammaticVPAIDCampaign.json", "Utilities/VastParser", "Models/VPAID/VPAIDCampaign"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Request_1, AuctionResponse_1, TestFixtures_1, Sdk_1, ProgrammaticVPAIDParser_1, ProgrammaticVPAIDCampaign_json_1, VastParser_1, VPAIDCampaign_1;
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
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (AuctionResponse_1_1) {
                AuctionResponse_1 = AuctionResponse_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            },
            function (ProgrammaticVPAIDParser_1_1) {
                ProgrammaticVPAIDParser_1 = ProgrammaticVPAIDParser_1_1;
            },
            function (ProgrammaticVPAIDCampaign_json_1_1) {
                ProgrammaticVPAIDCampaign_json_1 = ProgrammaticVPAIDCampaign_json_1_1;
            },
            function (VastParser_1_1) {
                VastParser_1 = VastParser_1_1;
            },
            function (VPAIDCampaign_1_1) {
                VPAIDCampaign_1 = VPAIDCampaign_1_1;
            }
        ],
        execute: function () {
            describe('ProgrammaticVPAIDParser', function () {
                var placements = ['TestPlacement'];
                var mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
                var correlationId = '583dfda0d933a3630a53249c';
                var parser;
                var nativeBridge;
                var request;
                var session;
                beforeEach(function () {
                    nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                    nativeBridge.Sdk = sinon.createStubInstance(Sdk_1.SdkApi);
                    request = sinon.createStubInstance(Request_1.Request);
                    session = TestFixtures_1.TestFixtures.getSession();
                    parser = new ProgrammaticVPAIDParser_1.ProgrammaticVPAIDParser();
                });
                describe('parsing a campaign', function () {
                    describe('with proper XML payload', function () {
                        var campaign;
                        var parse = function (data) {
                            var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                            return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                                campaign = parsedCampaign;
                            });
                        };
                        beforeEach(function () {
                            return parse(JSON.parse(ProgrammaticVPAIDCampaign_json_1.default));
                        });
                        it('should have valid data', function () {
                            chai_1.assert.isNotNull(campaign, 'Campaign is null');
                            chai_1.assert.isTrue(campaign instanceof VPAIDCampaign_1.VPAIDCampaign, 'Campaign was not an VPAIDCampaign');
                            var json = JSON.parse(ProgrammaticVPAIDCampaign_json_1.default);
                            var vast = new VastParser_1.VastParser().parseVast(decodeURIComponent(json.content));
                            chai_1.assert.equal(campaign.getSession(), session, 'Session is not equal');
                            chai_1.assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                            chai_1.assert.equal(campaign.getVPAID().getScriptUrl(), 'https://fake-ads-backend.applifier.info/get_file/js/vpaid_sample.js', 'Script URL is not equal');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljVlBBSURQYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUHJvZ3JhbW1hdGljVlBBSURQYXJzZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFnQkEsUUFBUSxDQUFDLHlCQUF5QixFQUFFO2dCQUNoQyxJQUFNLFVBQVUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNyQyxJQUFNLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQztnQkFDekMsSUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7Z0JBRWpELElBQUksTUFBK0IsQ0FBQztnQkFDcEMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksT0FBZ0IsQ0FBQztnQkFFckIsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQVksQ0FBQyxDQUFDO29CQUNoRCxZQUFZLENBQUMsR0FBSSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFNLENBQUMsQ0FBQztvQkFFM0QsT0FBTyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBTyxDQUFDLENBQUM7b0JBQzVDLE9BQU8sR0FBRywyQkFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUVwQyxNQUFNLEdBQUcsSUFBSSxpREFBdUIsRUFBRSxDQUFDO2dCQUMzQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsb0JBQW9CLEVBQUU7b0JBQzNCLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRTt3QkFDaEMsSUFBSSxRQUF1QixDQUFDO3dCQUM1QixJQUFNLEtBQUssR0FBRyxVQUFDLElBQVM7NEJBQ3BCLElBQU0sUUFBUSxHQUFHLElBQUksaUNBQWUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQzs0QkFDL0UsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLGNBQWM7Z0NBQzlFLFFBQVEsR0FBa0IsY0FBYyxDQUFDOzRCQUM3QyxDQUFDLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUM7d0JBRUYsVUFBVSxDQUFDOzRCQUNQLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsd0NBQXlCLENBQUMsQ0FBQyxDQUFDO3dCQUN4RCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUU7NEJBQ3pCLGFBQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7NEJBQy9DLGFBQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxZQUFZLDZCQUFhLEVBQUUsbUNBQW1DLENBQUMsQ0FBQzs0QkFFdEYsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx3Q0FBeUIsQ0FBQyxDQUFDOzRCQUNuRCxJQUFNLElBQUksR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7NEJBRTFFLGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDOzRCQUNyRSxhQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQzs0QkFDckUsYUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUUscUVBQXFFLEVBQUUseUJBQXlCLENBQUMsQ0FBQzt3QkFDdkosQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyJ9