System.register(["mocha", "chai", "Models/Campaigns/MRAIDCampaign", "Models/Assets/HTML", "../TestHelpers/TestFixtures", "json/OnProgrammaticMraidUrlPlcCampaign.json"], function (exports_1, context_1) {
    "use strict";
    var chai_1, MRAIDCampaign_1, HTML_1, TestFixtures_1, OnProgrammaticMraidUrlPlcCampaign_json_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (MRAIDCampaign_1_1) {
                MRAIDCampaign_1 = MRAIDCampaign_1_1;
            },
            function (HTML_1_1) {
                HTML_1 = HTML_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (OnProgrammaticMraidUrlPlcCampaign_json_1_1) {
                OnProgrammaticMraidUrlPlcCampaign_json_1 = OnProgrammaticMraidUrlPlcCampaign_json_1_1;
            }
        ],
        execute: function () {
            describe('MRAIDCampaign', function () {
                describe('when created with campaign json', function () {
                    it('should have correct data from the json', function () {
                        var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                        var json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                        var media = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
                        var mraidJson = JSON.parse(media.content);
                        var asset = new HTML_1.HTML(mraidJson.inlinedUrl, TestFixtures_1.TestFixtures.getSession());
                        mraidJson.id = 'testId';
                        var params = TestFixtures_1.TestFixtures.getProgrammaticMRAIDCampaignParams(json, media.cacheTTL, mraidJson.id);
                        var campaign = new MRAIDCampaign_1.MRAIDCampaign(params);
                        chai_1.assert.equal(campaign.getId(), mraidJson.id);
                        chai_1.assert.deepEqual(campaign.getResourceUrl(), asset);
                        chai_1.assert.deepEqual(campaign.getRequiredAssets(), [asset]);
                        chai_1.assert.deepEqual(campaign.getOptionalAssets(), []);
                        chai_1.assert.equal(campaign.getResource(), '<div>resource</div>');
                        chai_1.assert.equal(campaign.getDynamicMarkup(), mraidJson.dynamicMarkup);
                        chai_1.assert.equal(campaign.getUseWebViewUserAgentForTracking(), media.useWebViewUserAgentForTracking);
                        var willExpireAt = campaign.getWillExpireAt();
                        chai_1.assert.isDefined(willExpireAt, 'Will expire at should be defined');
                        if (willExpireAt) {
                            var timeDiff = willExpireAt - (Date.now() + media.cacheTTL * 1000);
                            chai_1.assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                        }
                    });
                    it('should have correct additional tracking from the json', function () {
                        var json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                        var media = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
                        var mraidJson = JSON.parse(media.content);
                        mraidJson.id = 'testId';
                        var params = TestFixtures_1.TestFixtures.getProgrammaticMRAIDCampaignParams(json, media.cacheTTL, mraidJson.id);
                        var campaign = new MRAIDCampaign_1.MRAIDCampaign(params);
                        chai_1.assert.deepEqual(campaign.getTrackingUrls(), media.trackingUrls);
                    });
                    it('should set resourceUrl', function () {
                        var json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                        var media = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
                        var mraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                        mraidJson.id = 'testId';
                        var params = TestFixtures_1.TestFixtures.getProgrammaticMRAIDCampaignParams(json, media.cacheTTL, mraidJson.id);
                        var campaign = new MRAIDCampaign_1.MRAIDCampaign(params);
                        var asset = new HTML_1.HTML('https://resource-url.com', TestFixtures_1.TestFixtures.getSession());
                        campaign.setResourceUrl('https://resource-url.com');
                        chai_1.assert.deepEqual(campaign.getResourceUrl(), asset);
                    });
                    it('should set resource', function () {
                        var json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                        var media = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
                        var mraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                        mraidJson.id = 'testId';
                        var params = TestFixtures_1.TestFixtures.getProgrammaticMRAIDCampaignParams(json, media.cacheTTL, mraidJson.id);
                        var campaign = new MRAIDCampaign_1.MRAIDCampaign(params);
                        campaign.setResource('some resource');
                        chai_1.assert.equal(campaign.getResource(), 'some resource');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURDYW1wYWlnblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJNUkFJRENhbXBhaWduVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBU0EsUUFBUSxDQUFDLGVBQWUsRUFBRTtnQkFFdEIsUUFBUSxDQUFDLGlDQUFpQyxFQUFFO29CQUN4QyxFQUFFLENBQUMsd0NBQXdDLEVBQUU7d0JBQ3pDLElBQU0sYUFBYSxHQUFHLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzt3QkFDdEQsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnREFBaUMsQ0FBQyxDQUFDO3dCQUMzRCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7d0JBQ3BFLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM1QyxJQUFNLEtBQUssR0FBRyxJQUFJLFdBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLDJCQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzt3QkFDeEUsU0FBUyxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7d0JBRXhCLElBQU0sTUFBTSxHQUFtQiwyQkFBWSxDQUFDLGtDQUFrQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDbkgsSUFBTSxRQUFRLEdBQUcsSUFBSSw2QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUUzQyxhQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzdDLGFBQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUNuRCxhQUFNLENBQUMs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