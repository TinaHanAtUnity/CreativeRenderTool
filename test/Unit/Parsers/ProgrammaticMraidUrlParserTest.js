System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Utilities/Request", "Models/AuctionResponse", "../TestHelpers/TestFixtures", "Native/Api/Sdk", "Parsers/ProgrammaticMraidUrlParser", "json/campaigns/mraid/ProgrammaticMRAIDCampaign.json", "Models/Campaigns/MRAIDCampaign", "Utilities/Url"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Request_1, AuctionResponse_1, TestFixtures_1, Sdk_1, ProgrammaticMraidUrlParser_1, ProgrammaticMRAIDCampaign_json_1, MRAIDCampaign_1, Url_1;
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
            function (ProgrammaticMraidUrlParser_1_1) {
                ProgrammaticMraidUrlParser_1 = ProgrammaticMraidUrlParser_1_1;
            },
            function (ProgrammaticMRAIDCampaign_json_1_1) {
                ProgrammaticMRAIDCampaign_json_1 = ProgrammaticMRAIDCampaign_json_1_1;
            },
            function (MRAIDCampaign_1_1) {
                MRAIDCampaign_1 = MRAIDCampaign_1_1;
            },
            function (Url_1_1) {
                Url_1 = Url_1_1;
            }
        ],
        execute: function () {
            describe('ProgrammaticMraidUrlParser', function () {
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
                    parser = new ProgrammaticMraidUrlParser_1.ProgrammaticMraidUrlParser();
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
                            chai_1.assert.equal(campaign.getResourceUrl().getUrl(), Url_1.Url.encode(content.inlinedUrl), 'MRAID is not equal');
                            chai_1.assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljTXJhaWRVcmxQYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUHJvZ3JhbW1hdGljTXJhaWRVcmxQYXJzZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFnQkEsUUFBUSxDQUFDLDRCQUE0QixFQUFFO2dCQUNuQyxJQUFNLFVBQVUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNyQyxJQUFNLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQztnQkFDekMsSUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7Z0JBRWpELElBQUksTUFBa0MsQ0FBQztnQkFDdkMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksT0FBZ0IsQ0FBQztnQkFFckIsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQVksQ0FBQyxDQUFDO29CQUNoRCxZQUFZLENBQUMsR0FBSSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFNLENBQUMsQ0FBQztvQkFFM0QsT0FBTyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBTyxDQUFDLENBQUM7b0JBQzVDLE9BQU8sR0FBRywyQkFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUVwQyxNQUFNLEdBQUcsSUFBSSx1REFBMEIsRUFBRSxDQUFDO2dCQUM5QyxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsb0JBQW9CLEVBQUU7b0JBQzNCLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTt3QkFDbkMsSUFBSSxRQUF1QixDQUFDO3dCQUU1QixJQUFNLEtBQUssR0FBRyxVQUFDLElBQVM7NEJBQ3BCLElBQU0sUUFBUSxHQUFHLElBQUksaUNBQWUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQzs0QkFDL0UsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLGNBQWM7Z0NBQzlFLFFBQVEsR0FBa0IsY0FBYyxDQUFDOzRCQUM3QyxDQUFDLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUM7d0JBRUYsVUFBVSxDQUFDOzRCQUNQLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsd0NBQXlCLENBQUMsQ0FBQyxDQUFDO3dCQUN4RCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUU7NEJBQ3pCLGFBQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7NEJBQy9DLGFBQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxZQUFZLDZCQUFhLEVBQUUsbUNBQW1DLENBQUMsQ0FBQzs0QkFFdEYsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx3Q0FBeUIsQ0FBQyxDQUFDOzRCQUNuRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFFekMsYUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixDQUFDLENBQUM7NEJBQ3JFLGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSwwQkFBMEIsQ0FBQyxDQUFDOzRCQUN6RSxhQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLDRCQUE0QixDQUFDLENBQUM7NEJBQzlGLGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLFNBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7NEJBQ3hHLGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO3dCQUNwRyxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=