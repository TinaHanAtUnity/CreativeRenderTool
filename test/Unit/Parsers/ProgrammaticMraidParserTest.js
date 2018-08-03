System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Utilities/Request", "Models/AuctionResponse", "../TestHelpers/TestFixtures", "Native/Api/Sdk", "Parsers/ProgrammaticMraidParser", "json/campaigns/mraid/ProgrammaticMRAIDCampaign.json", "Models/Campaigns/MRAIDCampaign"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Request_1, AuctionResponse_1, TestFixtures_1, Sdk_1, ProgrammaticMraidParser_1, ProgrammaticMRAIDCampaign_json_1, MRAIDCampaign_1;
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
            function (ProgrammaticMraidParser_1_1) {
                ProgrammaticMraidParser_1 = ProgrammaticMraidParser_1_1;
            },
            function (ProgrammaticMRAIDCampaign_json_1_1) {
                ProgrammaticMRAIDCampaign_json_1 = ProgrammaticMRAIDCampaign_json_1_1;
            },
            function (MRAIDCampaign_1_1) {
                MRAIDCampaign_1 = MRAIDCampaign_1_1;
            }
        ],
        execute: function () {
            describe('ProgrammaticMraidParser', function () {
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
                    parser = new ProgrammaticMraidParser_1.ProgrammaticMraidParser();
                });
                describe('parsing a campaign', function () {
                    describe('with a proper JSON payload', function () {
                        var campaign;
                        var parse = function (data) {
                            var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                            return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                                campaign = parsedCampaign;
                            });
                        };
                        beforeEach(function () {
                            return parse(JSON.parse(ProgrammaticMRAIDCampaign_json_1.default));
                        });
                        it('should have valid data', function () {
                            chai_1.assert.isNotNull(campaign, 'Campaign is null');
                            chai_1.assert.isTrue(campaign instanceof MRAIDCampaign_1.MRAIDCampaign, 'Campaign was not an MRAIDCampaign');
                            var json = JSON.parse(ProgrammaticMRAIDCampaign_json_1.default);
                            var content = JSON.parse(json.content);
                            chai_1.assert.equal(campaign.getSession(), session, 'Session is not equal');
                            chai_1.assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                            chai_1.assert.deepEqual(campaign.getTrackingUrls(), json.trackingUrls, 'Tracking URLs is not equal');
                            chai_1.assert.equal(campaign.getResource(), decodeURIComponent(content.markup), 'MRAID is not equal');
                            chai_1.assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljTXJhaWRQYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUHJvZ3JhbW1hdGljTXJhaWRQYXJzZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFlQSxRQUFRLENBQUMseUJBQXlCLEVBQUU7Z0JBQ2hDLElBQU0sVUFBVSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3JDLElBQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDO2dCQUN6QyxJQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQztnQkFFakQsSUFBSSxNQUErQixDQUFDO2dCQUNwQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksT0FBZ0IsQ0FBQztnQkFDckIsSUFBSSxPQUFnQixDQUFDO2dCQUVyQixVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQkFBWSxDQUFDLENBQUM7b0JBQ2hELFlBQVksQ0FBQyxHQUFJLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFlBQU0sQ0FBQyxDQUFDO29CQUUzRCxPQUFPLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGlCQUFPLENBQUMsQ0FBQztvQkFDNUMsT0FBTyxHQUFHLDJCQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBRXBDLE1BQU0sR0FBRyxJQUFJLGlEQUF1QixFQUFFLENBQUM7Z0JBQzNDLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyxvQkFBb0IsRUFBRTtvQkFDM0IsUUFBUSxDQUFDLDRCQUE0QixFQUFFO3dCQUNuQyxJQUFJLFFBQXVCLENBQUM7d0JBRTVCLElBQU0sS0FBSyxHQUFHLFVBQUMsSUFBUzs0QkFDcEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDOzRCQUMvRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsY0FBYztnQ0FDOUUsUUFBUSxHQUFrQixjQUFjLENBQUM7NEJBQzdDLENBQUMsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQzt3QkFFRixVQUFVLENBQUM7NEJBQ1AsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx3Q0FBeUIsQ0FBQyxDQUFDLENBQUM7d0JBQ3hELENBQUMsQ0FBQyxDQUFDO3dCQUVILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTs0QkFDekIsYUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzs0QkFDL0MsYUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLFlBQVksNkJBQWEsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDOzRCQUV0RixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHdDQUF5QixDQUFDLENBQUM7NEJBQ25ELElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUV6QyxhQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQzs0QkFDckUsYUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLDBCQUEwQixDQUFDLENBQUM7NEJBQ3pFLGFBQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsNEJBQTRCLENBQUMsQ0FBQzs0QkFDOUYsYUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFHLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7NEJBQ2hHLGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO3dCQUNwRyxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=