System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Utilities/Request", "Models/AuctionResponse", "../TestHelpers/TestFixtures", "Native/Api/Sdk", "Parsers/ProgrammaticVastParser", "json/campaigns/vast/ProgrammaticVastCampaignFlat.json", "Models/Vast/VastCampaign", "Utilities/VastParser"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Request_1, AuctionResponse_1, TestFixtures_1, Sdk_1, ProgrammaticVastParser_1, ProgrammaticVastCampaignFlat_json_1, VastCampaign_1, VastParser_1;
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
            function (ProgrammaticVastParser_1_1) {
                ProgrammaticVastParser_1 = ProgrammaticVastParser_1_1;
            },
            function (ProgrammaticVastCampaignFlat_json_1_1) {
                ProgrammaticVastCampaignFlat_json_1 = ProgrammaticVastCampaignFlat_json_1_1;
            },
            function (VastCampaign_1_1) {
                VastCampaign_1 = VastCampaign_1_1;
            },
            function (VastParser_1_1) {
                VastParser_1 = VastParser_1_1;
            }
        ],
        execute: function () {
            describe('ProgrammaticVastParser', function () {
                var placements = ['TestPlacement'];
                var mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
                var correlationId = '583dfda0d933a3630a53249c';
                var impressionUrl = 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130';
                var parser;
                var nativeBridge;
                var request;
                var session;
                beforeEach(function () {
                    nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                    nativeBridge.Sdk = sinon.createStubInstance(Sdk_1.SdkApi);
                    request = sinon.createStubInstance(Request_1.Request);
                    session = TestFixtures_1.TestFixtures.getSession();
                    parser = new ProgrammaticVastParser_1.ProgrammaticVastParser();
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
                            return parse(JSON.parse(ProgrammaticVastCampaignFlat_json_1.default));
                        });
                        it('should have valid data', function () {
                            chai_1.assert.isNotNull(campaign, 'Campaign is null');
                            chai_1.assert.isTrue(campaign instanceof VastCampaign_1.VastCampaign, 'Campaign was not an VastCampaign');
                            var json = JSON.parse(ProgrammaticVastCampaignFlat_json_1.default);
                            var vast = new VastParser_1.VastParser().parseVast(decodeURIComponent(json.content));
                            chai_1.assert.equal(campaign.getSession(), session, 'Session is not equal');
                            chai_1.assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                            chai_1.assert.equal(campaign.getVideo().getUrl(), vast.getVideoUrl(), 'Video URL is not the same');
                            chai_1.assert.deepEqual(campaign.getImpressionUrls(), [impressionUrl], 'Impression URL are not the same');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljVmFzdFBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQcm9ncmFtbWF0aWNWYXN0UGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBZ0JBLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRTtnQkFDL0IsSUFBTSxVQUFVLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDckMsSUFBTSxPQUFPLEdBQUcsd0JBQXdCLENBQUM7Z0JBQ3pDLElBQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO2dCQUNqRCxJQUFNLGFBQWEsR0FBRyxtTEFBbUwsQ0FBQztnQkFFMU0sSUFBSSxNQUE4QixDQUFDO2dCQUNuQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksT0FBZ0IsQ0FBQztnQkFDckIsSUFBSSxPQUFnQixDQUFDO2dCQUVyQixVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQkFBWSxDQUFDLENBQUM7b0JBQ2hELFlBQVksQ0FBQyxHQUFJLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFlBQU0sQ0FBQyxDQUFDO29CQUUzRCxPQUFPLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGlCQUFPLENBQUMsQ0FBQztvQkFDNUMsT0FBTyxHQUFHLDJCQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBRXBDLE1BQU0sR0FBRyxJQUFJLCtDQUFzQixFQUFFLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyxvQkFBb0IsRUFBRTtvQkFDM0IsUUFBUSxDQUFDLDRCQUE0QixFQUFFO3dCQUNuQyxJQUFJLFFBQXNCLENBQUM7d0JBRTNCLElBQU0sS0FBSyxHQUFHLFVBQUMsSUFBUzs0QkFDcEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDOzRCQUMvRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsY0FBYztnQ0FDOUUsUUFBUSxHQUFpQixjQUFjLENBQUM7NEJBQzVDLENBQUMsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQzt3QkFFRixVQUFVLENBQUM7NEJBQ1AsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQywyQ0FBNEIsQ0FBQyxDQUFDLENBQUM7d0JBQzNELENBQUMsQ0FBQyxDQUFDO3dCQUVILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRTs0QkFDekIsYUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzs0QkFDL0MsYUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLFlBQVksMkJBQVksRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDOzRCQUVwRixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLDJDQUE0QixDQUFDLENBQUM7NEJBQ3RELElBQU0sSUFBSSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs0QkFFMUUsYUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixDQUFDLENBQUM7NEJBQ3JFLGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSwwQkFBMEIsQ0FBQyxDQUFDOzRCQUN6RSxhQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsMkJBQTJCLENBQUMsQ0FBQzs0QkFDNUYsYUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLGlDQUFpQyxDQUFDLENBQUM7d0JBQ3ZHLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==