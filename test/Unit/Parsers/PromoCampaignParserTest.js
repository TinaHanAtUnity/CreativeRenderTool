System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Utilities/Request", "Models/AuctionResponse", "../TestHelpers/TestFixtures", "Native/Api/Sdk", "json/campaigns/promo/PromoCampaign.json", "Parsers/PromoCampaignParser", "Models/Campaigns/PromoCampaign", "Utilities/PurchasingUtilities"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Request_1, AuctionResponse_1, TestFixtures_1, Sdk_1, PromoCampaign_json_1, PromoCampaignParser_1, PromoCampaign_1, PurchasingUtilities_1;
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
            function (PromoCampaign_json_1_1) {
                PromoCampaign_json_1 = PromoCampaign_json_1_1;
            },
            function (PromoCampaignParser_1_1) {
                PromoCampaignParser_1 = PromoCampaignParser_1_1;
            },
            function (PromoCampaign_1_1) {
                PromoCampaign_1 = PromoCampaign_1_1;
            },
            function (PurchasingUtilities_1_1) {
                PurchasingUtilities_1 = PurchasingUtilities_1_1;
            }
        ],
        execute: function () {
            describe('PromoCampaignParser', function () {
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
                    parser = new PromoCampaignParser_1.PromoCampaignParser();
                });
                describe('parsing a campaign', function () {
                    describe('with valid payload', function () {
                        var campaign;
                        var sandbox;
                        var parse = function (data) {
                            var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                            return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                                campaign = parsedCampaign;
                            });
                        };
                        beforeEach(function () {
                            sandbox = sinon.createSandbox();
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                            return parse(JSON.parse(PromoCampaign_json_1.default).campaign1);
                        });
                        afterEach(function () {
                            sandbox.restore();
                        });
                        it('should have valid data', function () {
                            chai_1.assert.isNotNull(campaign, 'Campaign is null');
                            chai_1.assert.isTrue(campaign instanceof PromoCampaign_1.PromoCampaign, 'Campaign was not a PromoCampaign');
                            var json = JSON.parse(PromoCampaign_json_1.default).campaign1;
                            var content = JSON.parse(json.content);
                            chai_1.assert.equal(campaign.getSession(), session, 'Session is not equal');
                            chai_1.assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                            chai_1.assert.equal(campaign.getIapProductId(), content.iapProductId, 'IAP Product ID is not equal');
                            chai_1.assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
                            chai_1.assert.equal(campaign.getRewardedPromo(), content.rewardedPromo, 'Allow Skip is not equal');
                            chai_1.assert.equal(campaign.getCreativeResource().getUrl(), content.creativeUrl, 'Creative URL is not equal');
                        });
                    });
                    describe('With content that includes rewardedPromo as false', function () {
                        var campaign;
                        var sandbox;
                        var parse = function (data) {
                            var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                            return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                                campaign = parsedCampaign;
                            });
                        };
                        beforeEach(function () {
                            sandbox = sinon.createSandbox();
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                            return parse(JSON.parse(PromoCampaign_json_1.default).campaign2);
                        });
                        afterEach(function () {
                            sandbox.restore();
                        });
                        it('should set rewardedPromo to false in the campaign', function () {
                            var json = JSON.parse(PromoCampaign_json_1.default).campaign2;
                            var content = JSON.parse(json.content);
                            chai_1.assert.equal(content.rewardedPromo, false);
                            chai_1.assert.equal(campaign.getRewardedPromo(), content.rewardedPromo);
                        });
                    });
                    describe('With content that includes no rewardedPromo', function () {
                        var campaign;
                        var sandbox;
                        var parse = function (data) {
                            var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                            return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                                campaign = parsedCampaign;
                            });
                        };
                        beforeEach(function () {
                            sandbox = sinon.createSandbox();
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                            return parse(JSON.parse(PromoCampaign_json_1.default).campaign3);
                        });
                        afterEach(function () {
                            sandbox.restore();
                        });
                        it('should set rewardedPromo to false in the campaign', function () {
                            var json = JSON.parse(PromoCampaign_json_1.default).campaign3;
                            var content = JSON.parse(json.content);
                            chai_1.assert.equal(content.rewardedPromo, undefined);
                            chai_1.assert.equal(campaign.getRewardedPromo(), false);
                        });
                    });
                    describe('if Purchasing is initialized', function () {
                        var campaign;
                        var sandbox;
                        beforeEach(function () {
                            sandbox = sinon.createSandbox();
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isInitialized').returns(true);
                        });
                        afterEach(function () {
                            sandbox.restore();
                        });
                        it('should refresh catalog and resolve campaign', function () {
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                            var parse = function (data) {
                                var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                                return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                                    campaign = parsedCampaign;
                                    sinon.assert.called(PurchasingUtilities_1.PurchasingUtilities.refreshCatalog);
                                });
                            };
                            return parse(JSON.parse(PromoCampaign_json_1.default).campaign1);
                        });
                    });
                    describe('if Purchasing is not initialized', function () {
                        var campaign;
                        var sandbox;
                        beforeEach(function () {
                            sandbox = sinon.createSandbox();
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isInitialized').returns(false);
                        });
                        afterEach(function () {
                            sandbox.restore();
                        });
                        it('should resolve campaign and not refresh catalog', function () {
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                            var parse = function (data) {
                                var response = new AuctionResponse_1.AuctionResponse(placements, data, mediaId, correlationId);
                                return parser.parse(nativeBridge, request, response, session).then(function (parsedCampaign) {
                                    campaign = parsedCampaign;
                                    sinon.assert.notCalled(PurchasingUtilities_1.PurchasingUtilities.refreshCatalog);
                                });
                            };
                            return parse(JSON.parse(PromoCampaign_json_1.default).campaign1);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbW9DYW1wYWlnblBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQcm9tb0NhbXBhaWduUGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBZ0JBLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRTtnQkFDNUIsSUFBTSxVQUFVLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDckMsSUFBTSxPQUFPLEdBQUcsd0JBQXdCLENBQUM7Z0JBQ3pDLElBQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO2dCQUVqRCxJQUFJLE1BQTJCLENBQUM7Z0JBQ2hDLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLE9BQWdCLENBQUM7Z0JBRXJCLFVBQVUsQ0FBQztvQkFDUCxZQUFZLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLDJCQUFZLENBQUMsQ0FBQztvQkFDaEQsWUFBWSxDQUFDLEdBQUksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsWUFBTSxDQUFDLENBQUM7b0JBRTNELE9BQU8sR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsaUJBQU8sQ0FBQyxDQUFDO29CQUM1QyxPQUFPLEdBQUcsMkJBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFFcEMsTUFBTSxHQUFHLElBQUkseUNBQW1CLEVBQUUsQ0FBQztnQkFDdkMsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLG9CQUFvQixFQUFFO29CQUMzQixRQUFRLENBQUMsb0JBQW9CLEVBQUU7d0JBQzNCLElBQUksUUFBdUIsQ0FBQzt3QkFDNUIsSUFBSSxPQUEyQixDQUFDO3dCQUVoQyxJQUFNLEtBQUssR0FBRyxVQUFDLElBQVM7NEJBQ3BCLElBQU0sUUFBUSxHQUFHLElBQUksaUNBQWUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxh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