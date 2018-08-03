System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Utilities/Request", "Models/AuctionResponse", "../TestHelpers/TestFixtures", "Native/Api/Sdk", "Parsers/XPromoCampaignParser", "json/campaigns/xpromo/XPromoCampaign.json", "Models/Campaigns/XPromoCampaign", "Utilities/Url", "Models/Campaigns/PerformanceCampaign"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Request_1, AuctionResponse_1, TestFixtures_1, Sdk_1, XPromoCampaignParser_1, XPromoCampaign_json_1, XPromoCampaign_1, Url_1, PerformanceCampaign_1;
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
            function (XPromoCampaignParser_1_1) {
                XPromoCampaignParser_1 = XPromoCampaignParser_1_1;
            },
            function (XPromoCampaign_json_1_1) {
                XPromoCampaign_json_1 = XPromoCampaign_json_1_1;
            },
            function (XPromoCampaign_1_1) {
                XPromoCampaign_1 = XPromoCampaign_1_1;
            },
            function (Url_1_1) {
                Url_1 = Url_1_1;
            },
            function (PerformanceCampaign_1_1) {
                PerformanceCampaign_1 = PerformanceCampaign_1_1;
            }
        ],
        execute: function () {
            describe('XPromoCampaignParser', function () {
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
                    parser = new XPromoCampaignParser_1.XPromoCampaignParser();
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
                        var getStore = function (store) {
                            switch (store) {
                                case 'apple':
                                    return PerformanceCampaign_1.StoreName.APPLE;
                                case 'google':
                                    return PerformanceCampaign_1.StoreName.GOOGLE;
                                case 'xiaomi':
                                    return PerformanceCampaign_1.StoreName.XIAOMI;
                                default:
                                    throw new Error('Unknown store value "' + store + '"');
                            }
                        };
                        beforeEach(function () {
                            return parse(JSON.parse(XPromoCampaign_json_1.default));
                        });
                        it('should have valid data', function () {
                            chai_1.assert.isNotNull(campaign, 'Campaign is null');
                            chai_1.assert.isTrue(campaign instanceof XPromoCampaign_1.XPromoCampaign, 'Campaign was not an MRAIDCampaign');
                            var json = JSON.parse(XPromoCampaign_json_1.default);
                            var content = JSON.parse(json.content);
                            chai_1.assert.equal(campaign.getSession(), session, 'Session is not equal');
                            chai_1.assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                            chai_1.assert.equal(campaign.getId(), content.id, 'ID is not equal');
                            chai_1.assert.equal(campaign.getMeta(), content.meta, 'Meta is not equal');
                            chai_1.assert.equal(campaign.getClickAttributionUrl(), Url_1.Url.encode(content.clickAttributionUrl), 'Click Attribution URL is not equal');
                            chai_1.assert.equal(campaign.getClickAttributionUrlFollowsRedirects(), content.clickAttributionUrlFollowsRedirects, 'Click Attribution Url follows redirects is not equal');
                            chai_1.assert.equal(campaign.getGameName(), content.gameName, 'Game Name is equal');
                            chai_1.assert.equal(campaign.getGameIcon().getUrl(), Url_1.Url.encode(content.gameIcon), 'Game Icon is not equal');
                            chai_1.assert.equal(campaign.getRating(), content.rating, 'Rating is not the same');
                            chai_1.assert.equal(campaign.getLandscape().getOriginalUrl(), Url_1.Url.encode(content.endScreenLandscape), 'Landscape URL is not equal');
                            chai_1.assert.equal(campaign.getPortrait().getOriginalUrl(), Url_1.Url.encode(content.endScreenPortrait), 'Portrait URL is not equal');
                            chai_1.assert.equal(campaign.getBypassAppSheet(), content.bypassAppSheet, 'Bypass App Sheet is not equal');
                            chai_1.assert.equal(campaign.getStore(), getStore(content.store), 'Store is not equal');
                            chai_1.assert.equal(campaign.getAppStoreId(), content.appStoreId, 'App Store ID is not equal');
                            chai_1.assert.equal(campaign.getVideo().getUrl(), Url_1.Url.encode(content.trailerDownloadable), 'Downloadable Trailer URL is not equal');
                            chai_1.assert.equal(campaign.getStreamingVideo().getUrl(), Url_1.Url.encode(content.trailerStreaming), 'Downloadable Trailer URL is not equal');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vQ2FtcGFpZ25QYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiWFByb21vQ2FtcGFpZ25QYXJzZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFpQkEsUUFBUSxDQUFDLHNCQUFzQixFQUFFO2dCQUM3QixJQUFNLFVBQVUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNyQyxJQUFNLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQztnQkFDekMsSUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7Z0JBRWpELElBQUksTUFBNEIsQ0FBQztnQkFDakMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksT0FBZ0IsQ0FBQztnQkFFckIsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQVksQ0FBQyxDQUFDO29CQUNoRCxZQUFZLENBQUMsR0FBSSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFNLENBQUMsQ0FBQztvQkFFM0QsT0FBTyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBTyxDQUFDLENBQUM7b0JBQzVDLE9BQU8sR0FBRywyQkFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUVwQyxNQUFNLEdBQUcsSUFBSSwyQ0FBb0IsRUFBRSxDQUFDO2dCQUN4QyxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsb0JBQW9CLEVBQUU7b0JBQzNCLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTt3QkFDbkMsSUFBSSxRQUF3QixDQUFDO3dCQUU3QixJQUFNLEtBQUssR0FBRyxVQUFDLElBQVM7NEJBQ3BCLElBQU0sUUFBUSxHQUFHLElBQUksaUNBQWUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQzs0QkFD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