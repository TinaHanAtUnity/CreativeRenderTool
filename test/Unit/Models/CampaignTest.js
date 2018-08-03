System.register(["mocha", "chai", "Models/Vast/VastCampaign", "../TestHelpers/TestFixtures", "Models/Campaigns/PerformanceCampaign", "json/OnCometVideoPlcCampaign.json", "xml/SimpleVast.xml", "xml/CacheSimpleVast.xml"], function (exports_1, context_1) {
    "use strict";
    var chai_1, VastCampaign_1, TestFixtures_1, PerformanceCampaign_1, OnCometVideoPlcCampaign_json_1, SimpleVast_xml_1, CacheSimpleVast_xml_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (VastCampaign_1_1) {
                VastCampaign_1 = VastCampaign_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (PerformanceCampaign_1_1) {
                PerformanceCampaign_1 = PerformanceCampaign_1_1;
            },
            function (OnCometVideoPlcCampaign_json_1_1) {
                OnCometVideoPlcCampaign_json_1 = OnCometVideoPlcCampaign_json_1_1;
            },
            function (SimpleVast_xml_1_1) {
                SimpleVast_xml_1 = SimpleVast_xml_1_1;
            },
            function (CacheSimpleVast_xml_1_1) {
                CacheSimpleVast_xml_1 = CacheSimpleVast_xml_1_1;
            }
        ],
        execute: function () {
            describe('PerformanceCampaign', function () {
                describe('when created with campaign json', function () {
                    it('should have correct data from the json', function () {
                        var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                        var json = JSON.parse(OnCometVideoPlcCampaign_json_1.default);
                        var campaignObject = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                        var params = TestFixtures_1.TestFixtures.getPerformanceCampaignParams(campaignObject, PerformanceCampaign_1.StoreName.GOOGLE);
                        var campaign = new PerformanceCampaign_1.PerformanceCampaign(params);
                        chai_1.assert.equal(campaign.getAppStoreId(), campaignObject.appStoreId);
                        chai_1.assert.equal(campaign.getLandscape().getUrl(), campaignObject.endScreenLandscape);
                        chai_1.assert.equal(campaign.getPortrait().getUrl(), campaignObject.endScreenPortrait);
                        chai_1.assert.equal(campaign.getGameIcon().getUrl(), campaignObject.gameIcon);
                        chai_1.assert.equal(campaign.getGameId(), campaignObject.gameId);
                        chai_1.assert.equal(campaign.getGameName(), campaignObject.gameName);
                        chai_1.assert.equal(campaign.getId(), campaignObject.id);
                        chai_1.assert.equal(campaign.getRating(), campaignObject.rating);
                        chai_1.assert.equal(campaign.getRatingCount(), campaignObject.ratingCount);
                    });
                });
            });
            describe('VastCampaign', function () {
                describe('when created with VAST json', function () {
                    it('should have correct data from the json', function () {
                        var vastXml = SimpleVast_xml_1.default;
                        var vastParser = TestFixtures_1.TestFixtures.getVastParser();
                        var parsedVast = vastParser.parseVast(vastXml);
                        var params = TestFixtures_1.TestFixtures.getVastCampaignParams(parsedVast, 3600, '12345');
                        var campaign = new VastCampaign_1.VastCampaign(params);
                        chai_1.assert.equal(campaign.getId(), '12345');
                        chai_1.assert.deepEqual(campaign.getImpressionUrls(), [
                            'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130'
                        ], 'impression urls');
                        var vast = campaign.getVast();
                        chai_1.assert.equal(1, vast.getAds().length);
                        chai_1.assert.deepEqual(vast.getTrackingEventUrls('start'), [
                            'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%'
                        ], 'start tracking event urls');
                        chai_1.assert.deepEqual(vast.getTrackingEventUrls('firstQuartile'), [], 'first quartile tracking event urls');
                        chai_1.assert.deepEqual(vast.getTrackingEventUrls('midpoint'), [], 'midpoint tracking event urls');
                        chai_1.assert.deepEqual(vast.getTrackingEventUrls('thirdQuartile'), [], 'third quartile tracking event urls');
                        chai_1.assert.deepEqual(vast.getTrackingEventUrls('complete'), [], 'complete tracking event urls');
                        chai_1.assert.deepEqual(vast.getTrackingEventUrls('mute'), [], 'mute tracking event urls');
                        chai_1.assert.deepEqual(vast.getTrackingEventUrls('unmute'), [], 'unmute tracking event urls');
                        chai_1.assert.equal(vast.getVideoUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4', 'video url');
                        chai_1.assert.equal(vast.getDuration(), 30, 'duration');
                        chai_1.assert.deepEqual(vast.getErrorURLTemplates(), [], 'error urls');
                    });
                    it('should return cached video url when set', function () {
                        var vastXml = CacheSimpleVast_xml_1.default;
                        var vastParser = TestFixtures_1.TestFixtures.getVastParser();
                        var parsedVast = vastParser.parseVast(vastXml);
                        var params = TestFixtures_1.TestFixtures.getVastCampaignParams(parsedVast, 3600, '12345');
                        var campaign = new VastCampaign_1.VastCampaign(params);
                        campaign.getVideo().setCachedUrl('file://some/cache/path.mp4');
                        chai_1.assert.equal(campaign.getVideo().getUrl(), 'file://some/cache/path.mp4');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25UZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ2FtcGFpZ25UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFXQSxRQUFRLENBQUMscUJBQXFCLEVBQUU7Z0JBRTVCLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRTtvQkFDeEMsRUFBRSxDQUFDLHdDQUF3QyxFQUFFO3dCQUN6QyxJQUFNLGFBQWEsR0FBRywyQkFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUM7d0JBQ3RELElBQU0sSUFBSSxHQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsc0NBQXVCLENBQUMsQ0FBQzt3QkFDdEQsSUFBTSxjQUFjLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBRXRHLElBQU0sTUFBTSxHQUFHLDJCQUFZLENBQUMsNEJBQTRCLENBQUMsY0FBYyxFQUFFLCtCQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQzNGLElBQU0sUUFBUSxHQUFHLElBQUkseUNBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBRWpELGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxFQUFFLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDbEUsYUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQ2xGLGFBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO3dCQUNoRixhQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxjQUFjLENB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