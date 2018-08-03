System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Utilities/Request", "Models/AuctionResponse", "../TestHelpers/TestFixtures", "Native/Api/Sdk", "json/campaigns/display/DisplayStaticInterstitialCampaignHTML.json", "json/campaigns/display/DisplayStaticInterstitialCampaignJS.json", "Models/Campaigns/DisplayInterstitialCampaign", "Parsers/ProgrammaticStaticInterstitialParser"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Request_1, AuctionResponse_1, TestFixtures_1, Sdk_1, DisplayStaticInterstitialCampaignHTML_json_1, DisplayStaticInterstitialCampaignJS_json_1, DisplayInterstitialCampaign_1, ProgrammaticStaticInterstitialParser_1;
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
            function (DisplayStaticInterstitialCampaignHTML_json_1_1) {
                DisplayStaticInterstitialCampaignHTML_json_1 = DisplayStaticInterstitialCampaignHTML_json_1_1;
            },
            function (DisplayStaticInterstitialCampaignJS_json_1_1) {
                DisplayStaticInterstitialCampaignJS_json_1 = DisplayStaticInterstitialCampaignJS_json_1_1;
            },
            function (DisplayInterstitialCampaign_1_1) {
                DisplayInterstitialCampaign_1 = DisplayInterstitialCampaign_1_1;
            },
            function (ProgrammaticStaticInterstitialParser_1_1) {
                ProgrammaticStaticInterstitialParser_1 = ProgrammaticStaticInterstitialParser_1_1;
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
                });
                describe('parsing an HTML campaign', function () {
                    beforeEach(function () {
                        parser = new ProgrammaticStaticInterstitialParser_1.ProgrammaticStaticInterstitialParser(false);
                    });
                    describe('with proper HTML payload', function () {
                        var campaign;
                        var parse = function (data) {
                            var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                            return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                                campaign = parsedCampaign;
                            });
                        };
                        beforeEach(function () {
                            return parse(JSON.parse(DisplayStaticInterstitialCampaignHTML_json_1.default));
                        });
                        it('should have valid data', function () {
                            chai_1.assert.isNotNull(campaign, 'Campaign is null');
                            chai_1.assert.isTrue(campaign instanceof DisplayInterstitialCampaign_1.DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');
                            var json = JSON.parse(DisplayStaticInterstitialCampaignHTML_json_1.default);
                            chai_1.assert.equal(campaign.getSession(), session, 'Session is not equal');
                            chai_1.assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                            chai_1.assert.equal(campaign.getDynamicMarkup(), decodeURIComponent(json.content), 'Dynamic Markup is not equal');
                        });
                    });
                });
                describe('parsing a JS campaign', function () {
                    beforeEach(function () {
                        parser = new ProgrammaticStaticInterstitialParser_1.ProgrammaticStaticInterstitialParser(true);
                    });
                    describe('with proper JS payload', function () {
                        var campaign;
                        var parse = function (data) {
                            var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                            return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                                campaign = parsedCampaign;
                            });
                        };
                        beforeEach(function () {
                            return parse(JSON.parse(DisplayStaticInterstitialCampaignJS_json_1.default));
                        });
                        it('should have valid data', function () {
                            chai_1.assert.isNotNull(campaign, 'Campaign is null');
                            chai_1.assert.isTrue(campaign instanceof DisplayInterstitialCampaign_1.DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');
                            var json = JSON.parse(DisplayStaticInterstitialCampaignJS_json_1.default);
                            chai_1.assert.equal(campaign.getSession(), session, 'Session is not equal');
                            chai_1.assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                            chai_1.assert.equal(campaign.getDynamicMarkup(), '<script>' + decodeURIComponent(json.content) + '</script>', 'Dynamic Markup is not equal');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljU3RhdGljSW50ZXJzdGl0aWFsUGFyc2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlByb2dyYW1tYXRpY1N0YXRpY0ludGVyc3RpdGlhbFBhcnNlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWlCQSxRQUFRLENBQUMseUJBQXlCLEVBQUU7Z0JBQ2hDLElBQU0sVUFBVSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3JDLElBQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDO2dCQUN6QyxJQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQztnQkFFakQsSUFBSSxNQUE0QyxDQUFDO2dCQUNqRCxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksT0FBZ0IsQ0FBQztnQkFDckIsSUFBSSxPQUFnQixDQUFDO2dCQUVyQixVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQkFBWSxDQUFDLENBQUM7b0JBQ2hELFlBQVksQ0FBQyxHQUFJLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFlBQU0sQ0FBQyxDQUFDO29CQUUzRCxPQUFPLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGlCQUFPLENBQUMsQ0FBQztvQkFDNUMsT0FBTyxHQUFHLDJCQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQywwQkFBMEIsRUFBRTtvQkFFakMsVUFBVSxDQUFDO3dCQUNQLE1BQU0sR0FBRyxJQUFJLDJFQUFvQyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM3RCxDQUFDLENBQUMsQ0FBQztvQkFFSCxRQUFRLENBQUMsMEJBQTBCLEVBQUU7d0JBQ2pDLElBQUksUUFBcUMsQ0FBQzt3QkFDMUMsSUFBTSxLQUFLLEdBQUcsVUFBQyxJQUFTOzRCQUNwQixJQUFN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