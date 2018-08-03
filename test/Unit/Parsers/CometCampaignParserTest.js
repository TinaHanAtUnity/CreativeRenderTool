System.register(["mocha", "sinon", "chai", "Parsers/CometCampaignParser", "Native/NativeBridge", "Native/Api/Sdk", "Utilities/Request", "../TestHelpers/TestFixtures", "Models/Campaigns/MRAIDCampaign", "Models/Campaigns/PerformanceCampaign", "Models/AuctionResponse", "Utilities/Url", "Utilities/Diagnostics", "json/campaigns/performance/CometMraidUrlCampaign.json", "json/campaigns/performance/CometVideoCampaign.json"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, CometCampaignParser_1, NativeBridge_1, Sdk_1, Request_1, TestFixtures_1, MRAIDCampaign_1, PerformanceCampaign_1, AuctionResponse_1, Url_1, Diagnostics_1, CometMraidUrlCampaign_json_1, CometVideoCampaign_json_1;
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
            function (CometCampaignParser_1_1) {
                CometCampaignParser_1 = CometCampaignParser_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (MRAIDCampaign_1_1) {
                MRAIDCampaign_1 = MRAIDCampaign_1_1;
            },
            function (PerformanceCampaign_1_1) {
                PerformanceCampaign_1 = PerformanceCampaign_1_1;
            },
            function (AuctionResponse_1_1) {
                AuctionResponse_1 = AuctionResponse_1_1;
            },
            function (Url_1_1) {
                Url_1 = Url_1_1;
            },
            function (Diagnostics_1_1) {
                Diagnostics_1 = Diagnostics_1_1;
            },
            function (CometMraidUrlCampaign_json_1_1) {
                CometMraidUrlCampaign_json_1 = CometMraidUrlCampaign_json_1_1;
            },
            function (CometVideoCampaign_json_1_1) {
                CometVideoCampaign_json_1 = CometVideoCampaign_json_1_1;
            }
        ],
        execute: function () {
            describe('CometCampaignParser', function () {
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
                    request.followRedirectChain.returns(Promise.resolve('http://s3-us-west-1.amazonaws.com/ads-load-testing/AssetPack1/b30-400.mp4'));
                    session = TestFixtures_1.TestFixtures.getSession();
                    parser = new CometCampaignParser_1.CometCampaignParser();
                });
                describe('parsing a campaign', function () {
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
                    var encodeVideoUrls = function (urls) {
                        return Object.keys(urls).reduce(function (v, event) {
                            v[event] = Url_1.Url.encode(urls[event]);
                            return v;
                        }, {});
                    };
                    var assertBaseCampaign = function (content) {
                        chai_1.assert.equal(campaign.getSession(), session, 'Session is not equal');
                        chai_1.assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                        chai_1.assert.equal(campaign.getId(), content.id, 'ID is not equal');
                        chai_1.assert.equal(campaign.getMeta(), content.meta, 'Meta is not equal');
                        chai_1.assert.equal(campaign.getClickAttributionUrl(), Url_1.Url.encode(content.clickAttributionUrl), 'Click Attribution URL is not equal');
                        chai_1.assert.equal(campaign.getClickAttributionUrlFollowsRedirects(), content.clickAttributionUrlFollowsRedirects, 'Click Attribution Url follows redirects is not equal');
                        chai_1.assert.equal(campaign.getClickUrl(), Url_1.Url.encode(content.clickUrl), 'Click Url is not equal');
                        chai_1.assert.deepEqual(campaign.getVideoEventUrls(), encodeVideoUrls(content.videoEventUrls), 'Video Event URLs is not equal');
                        chai_1.assert.equal(campaign.getGameName(), content.gameName, 'Game Name is equal');
                        chai_1.assert.equal(campaign.getGameIcon().getUrl(), Url_1.Url.encode(content.gameIcon), 'Game Icon is not equal');
                        chai_1.assert.equal(campaign.getRating(), content.rating, 'Rating is not the same');
                        chai_1.assert.equal(campaign.getLandscape().getOriginalUrl(), Url_1.Url.encode(content.endScreenLandscape), 'Landscape URL is not equal');
                        chai_1.assert.equal(campaign.getPortrait().getOriginalUrl(), Url_1.Url.encode(content.endScreenPortrait), 'Portrait URL is not equal');
                        chai_1.assert.equal(campaign.getBypassAppSheet(), content.bypassAppSheet, 'Bypass App Sheet is not equal');
                        chai_1.assert.equal(campaign.getStore(), getStore(content.store), 'Store is not equal');
                        chai_1.assert.equal(campaign.getAppStoreId(), content.appStoreId, 'App Store ID is not equal');
                    };
                    describe('when it is an mraid campaign', function () {
                        beforeEach(function () {
                            return parse(JSON.parse(CometMraidUrlCampaign_json_1.default));
                        });
                        it('should parse and return an mraid campaign', function () {
                            chai_1.assert.isNotNull(campaign, 'Campaign is null');
                            chai_1.assert.isTrue(campaign instanceof MRAIDCampaign_1.MRAIDCampaign, 'Campaign was not an MRAIDCampaign');
                            var mraidCampaign = campaign;
                            var json = JSON.parse(CometMraidUrlCampaign_json_1.default);
                            var content = JSON.parse(json.content);
                            assertBaseCampaign(content);
                            chai_1.assert.equal(mraidCampaign.getUseWebViewUserAgentForTracking(), json.useWebViewUserAgentForTracking, 'WebView UA Tracking is not equal');
                            chai_1.assert.equal(mraidCampaign.getResourceUrl().getUrl(), Url_1.Url.encode(content.mraidUrl), 'MRAID URL is not equal');
                            chai_1.assert.equal(mraidCampaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
                        });
                    });
                    describe('when it is a performance campaign', function () {
                        beforeEach(function () {
                            return parse(JSON.parse(CometVideoCampaign_json_1.default));
                        });
                        it('should parse and return a performance campaign', function () {
                            chai_1.assert.isNotNull(campaign, 'Campaign is null');
                            chai_1.assert.isTrue(campaign instanceof PerformanceCampaign_1.PerformanceCampaign, 'Campaign was not an MRAIDCampaign');
                            var perfCampaign = campaign;
                            var json = JSON.parse(CometVideoCampaign_json_1.default);
                            var content = JSON.parse(json.content);
                            assertBaseCampaign(content);
                            chai_1.assert.equal(perfCampaign.getVideo().getUrl(), Url_1.Url.encode(content.trailerDownloadable), 'Downloadable Trailer URL is not equal');
                            chai_1.assert.equal(perfCampaign.getStreamingVideo().getUrl(), Url_1.Url.encode(content.trailerStreaming), 'Downloadable Trailer URL is not equal');
                        });
                        it('should have a AdUnitStyle object with ctaButtonColor-property', function () {
                            var perfCampaign = campaign;
                            var adUnitStyle = perfCampaign.getAdUnitStyle();
                            if (!adUnitStyle) {
                                throw new Error('no AdUnitStyle object parsed from configuration');
                            }
                            chai_1.assert.equal(adUnitStyle.getCTAButtonColor(), '#167dfb');
                        });
                        describe('Parsing json to campaign when AdUnitStyle in JSON', function () {
                            var fuchsia = '#ff00ff';
                            var fafafa = '#FAFAFA';
                            var sandbox;
                            var campaignJSON;
                            beforeEach(function () {
                                sandbox = sinon.sandbox.create();
                                sandbox.stub(Diagnostics_1.Diagnostics, 'trigger');
                                campaignJSON = JSON.parse(CometVideoCampaign_json_1.default);
                                campaignJSON.content = JSON.parse(campaignJSON.content);
                            });
                            afterEach(function () {
                                sandbox.restore();
                            });
                            it('is undefined, leaves adUnitStyle undefined', function () {
                                campaignJSON.content.adUnitStyle = undefined;
                                campaignJSON.content = JSON.stringify(campaignJSON.content);
                                return parse(campaignJSON).then(function () {
                                    chai_1.assert.isUndefined(campaign.getAdUnitStyle());
                                    sinon.assert.calledWith(Diagnostics_1.Diagnostics.trigger, 'configuration_ad_unit_style_parse_error');
                                });
                            });
                            it('is missing, leaves adUnitStyle undefined ', function () {
                                delete campaignJSON.content.adUnitStyle;
                                campaignJSON.content = JSON.stringify(campaignJSON.content);
                                return parse(campaignJSON).then(function () {
                                    chai_1.assert.isUndefined(campaign.getAdUnitStyle());
                                    sinon.assert.calledWith(Diagnostics_1.Diagnostics.trigger, 'configuration_ad_unit_style_parse_error');
                                });
                            });
                            it('is malformed, leaves adUnitStyle undefined ', function () {
                                campaignJSON.content.adUnitStyle = { 'thisIsNot': 'A Proper stylesheet' };
                                campaignJSON.content = JSON.stringify(campaignJSON.content);
                                return parse(campaignJSON).then(function () {
                                    chai_1.assert.isUndefined(campaign.getAdUnitStyle());
                                    sinon.assert.calledWith(Diagnostics_1.Diagnostics.trigger, 'configuration_ad_unit_style_parse_error');
                                });
                            });
                            it('has a blank string, returns undefined ctaButtonColor', function () {
                                campaignJSON.content.adUnitStyle.ctaButtonColor = '';
                                campaignJSON.content = JSON.stringify(campaignJSON.content);
                                return parse(campaignJSON).then(function () {
                                    var returnedAdUnitStyle = campaign.getAdUnitStyle();
                                    chai_1.assert.isUndefined(returnedAdUnitStyle.getCTAButtonColor());
                                    sinon.assert.notCalled(Diagnostics_1.Diagnostics.trigger);
                                });
                            });
                            it('has a undefined value, returns undefined ctaButtonColor', function () {
                                campaignJSON.content.adUnitStyle.ctaButtonColor = undefined;
                                campaignJSON.content = JSON.stringify(campaignJSON.content);
                                return parse(campaignJSON).then(function () {
                                    var returnedAdUnitStyle = campaign.getAdUnitStyle();
                                    chai_1.assert.isUndefined(returnedAdUnitStyle.getCTAButtonColor());
                                    sinon.assert.notCalled(Diagnostics_1.Diagnostics.trigger);
                                });
                            });
                            it('has a non-color value, returns undefined ctaButtonColor', function () {
                                campaignJSON.content.adUnitStyle.ctaButtonColor = '#blue12';
                                campaignJSON.content = JSON.stringify(campaignJSON.content);
                                return parse(campaignJSON).then(function () {
                                    var returnedAdUnitStyle = campaign.getAdUnitStyle();
                                    chai_1.assert.isUndefined(returnedAdUnitStyle.getCTAButtonColor());
                                    sinon.assert.notCalled(Diagnostics_1.Diagnostics.trigger);
                                });
                            });
                            it('has a lower case color, returns proper ctaButtonColor', function () {
                                campaignJSON.content.adUnitStyle.ctaButtonColor = fuchsia;
                                campaignJSON.content = JSON.stringify(campaignJSON.content);
                                return parse(campaignJSON).then(function () {
                                    var returnedAdUnitStyle = campaign.getAdUnitStyle();
                                    chai_1.assert.equal(returnedAdUnitStyle.getCTAButtonColor(), fuchsia);
                                    sinon.assert.notCalled(Diagnostics_1.Diagnostics.trigger);
                                });
                            });
                            it('has a upper case color, returns proper ctaButtonColor', function () {
                                campaignJSON.content.adUnitStyle.ctaButtonColor = fafafa;
                                campaignJSON.content = JSON.stringify(campaignJSON.content);
                                return parse(campaignJSON).then(function () {
                                    var returnedAdUnitStyle = campaign.getAdUnitStyle();
                                    chai_1.assert.equal(returnedAdUnitStyle.getCTAButtonColor(), fafafa);
                                    sinon.assert.notCalled(Diagnostics_1.Diagnostics.trigger);
                                });
                            });
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tZXRDYW1wYWlnblBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb21ldENhbXBhaWduUGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBbUJBLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRTtnQkFDNUIsSUFBTSxVQUFVLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDckMsSUFBTSxPQUFPLEdBQUcsd0JBQXdCLENBQUM7Z0JBQ3pDLElBQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO2dCQUVqRCxJQUFJLE1BQTJCLENBQUM7Z0JBQ2hDLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLE9BQWdCLENBQUM7Z0JBRXJCLFVBQVUsQ0FBQztvQkFDUCxZQUFZLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLDJCQUFZLENBQUMsQ0FBQztvQkFDaEQsWUFBWSxDQUFDLEdBQUksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsWUFBTSxDQUFDLENBQUM7b0JBRTNELE9BQU8sR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsaUJBQU8sQ0FBQyxDQUFDO29CQUMxQixPQUFPLENBQUMsbUJBQW9CLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsMkVBQTJFLENBQUMsQ0FBQyxDQUFDO29CQUVySixPQUFPLEdBQUcsMkJBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFFcEMsTUFBTSxHQUFHLElBQUkseUNBQW1CLEVBQUUsQ0FBQztnQkFDdkMsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLG9CQUFvQixFQUFFO29CQUUzQixJQUFJLFFBQTZDLENBQUM7b0JBRWxELElBQU0sS0FBSyxHQUFHLFVBQUMsSUFBUzt3QkFDcEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxpQ0FB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