import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { SdkApi } from 'Core/Native/Sdk';
import { Url } from 'Core/Utilities/Url';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import OnCometMraidPlcCampaign from 'json/campaigns/performance/CometMraidUrlCampaign.json';
import OnCometVideoPlcCampaign from 'json/campaigns/performance/CometVideoCampaign.json';
import OnCometVideoPlusPlayableCampaign from 'json/campaigns/performance/CometVideoPlusPlayableCampaign.json';
import OnCometVideoPlcCampaignSquareEndScreenAsset from 'json/campaigns/performance/CometVideoCampaignWithSquareEndScreenAsset.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('CometCampaignParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    let parser;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let request;
    let session;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        core.Api.Sdk = sinon.createStubInstance(SdkApi);
        sinon.stub(Date, 'now').returns(0); // To easily calculate willExpireAt
        request = sinon.createStubInstance(RequestManager);
        request.followRedirectChain.returns(Promise.resolve('http://s3-us-west-1.amazonaws.com/ads-load-testing/AssetPack1/b30-400.mp4'));
        core.RequestManager = request;
        session = TestFixtures.getSession();
        parser = new CometCampaignParser(core);
    });
    describe('parsing a campaign', () => {
        let campaign;
        const parse = (data) => {
            const auctionPlacement = new AuctionPlacement(placementId, mediaId);
            const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
            return parser.parse(response, session).then((parsedCampaign) => {
                campaign = parsedCampaign;
            });
        };
        const getStore = (store) => {
            switch (store) {
                case 'apple':
                    return StoreName.APPLE;
                case 'google':
                    return StoreName.GOOGLE;
                case 'xiaomi':
                    return StoreName.XIAOMI;
                case 'standalone_android':
                    return StoreName.STANDALONE_ANDROID;
                default:
                    throw new Error('Unknown store value "' + store + '"');
            }
        };
        const encodeVideoUrls = (urls) => {
            return Object.keys(urls).reduce((v, event) => {
                v[event] = Url.encode(urls[event]);
                return v;
            }, {});
        };
        const assertBaseCampaign = (content) => {
            assert.equal(campaign.getSession(), session, 'Session is not equal');
            assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
            assert.equal(campaign.getId(), content.id, 'ID is not equal');
            assert.equal(campaign.getMeta(), content.meta, 'Meta is not equal');
            assert.equal(campaign.getClickAttributionUrl(), Url.encode(content.clickAttributionUrl), 'Click Attribution URL is not equal');
            assert.equal(campaign.getClickAttributionUrlFollowsRedirects(), content.clickAttributionUrlFollowsRedirects, 'Click Attribution Url follows redirects is not equal');
            assert.equal(campaign.getClickUrl(), Url.encode(content.clickUrl), 'Click Url is not equal');
            assert.deepEqual(campaign.getVideoEventUrls(), encodeVideoUrls(content.videoEventUrls), 'Video Event URLs is not equal');
            assert.equal(campaign.getGameName(), content.gameName, 'Game Name is equal');
            assert.equal(campaign.getGameIcon().getUrl(), Url.encode(content.gameIcon), 'Game Icon is not equal');
            assert.equal(campaign.getRating(), content.rating, 'Rating is not the same');
            assert.equal(campaign.getBypassAppSheet(), content.bypassAppSheet, 'Bypass App Sheet is not equal');
            assert.equal(campaign.getStore(), getStore(content.store), 'Store is not equal');
            assert.equal(campaign.getAppStoreId(), content.appStoreId, 'App Store ID is not equal');
            assert.equal(campaign.getWillExpireAt(), 3600000, 'willExpireAt was not set correctly');
        };
        describe('when it is an mraid campaign', () => {
            beforeEach(() => {
                return parse(OnCometMraidPlcCampaign);
            });
            it('should parse and return an mraid campaign', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof MRAIDCampaign, 'Campaign was not an MRAIDCampaign');
                const mraidCampaign = campaign;
                const json = Object.assign({}, OnCometMraidPlcCampaign);
                const content = JSON.parse(json.content);
                assertBaseCampaign(content);
                assert.equal(mraidCampaign.getUseWebViewUserAgentForTracking(), json.useWebViewUserAgentForTracking, 'WebView UA Tracking is not equal');
                assert.equal(mraidCampaign.getResourceUrl().getUrl(), Url.encode(content.mraidUrl), 'MRAID URL is not equal');
                assert.equal(mraidCampaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
            });
        });
        describe('when it is a performance campaign', () => {
            beforeEach(() => {
                return parse(OnCometVideoPlcCampaign);
            });
            it('should parse and return a performance campaign', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PerformanceCampaign, 'Campaign was not an MRAIDCampaign');
                const perfCampaign = campaign;
                const json = Object.assign({}, OnCometVideoPlcCampaign);
                const content = JSON.parse(json.content);
                assertBaseCampaign(content);
                assert.equal(perfCampaign.getVideo().getUrl(), Url.encode(content.trailerDownloadable), 'Downloadable Trailer URL is not equal');
                assert.equal(perfCampaign.getStreamingVideo().getUrl(), Url.encode(content.trailerStreaming), 'Downloadable Trailer URL is not equal');
                assert.equal(perfCampaign.getLandscape().getOriginalUrl(), Url.encode(content.endScreenLandscape), 'Landscape URL is not equal');
                assert.equal(perfCampaign.getPortrait().getOriginalUrl(), Url.encode(content.endScreenPortrait), 'Portrait URL is not equal');
                assert.equal(perfCampaign.getEndScreenType(), content.endScreenType, 'End Screen type is not equal');
                assert.equal(perfCampaign.getEndScreen().getUrl(), Url.encode(content.endScreenUrl), 'End Screen URL is not equal');
            });
            it('should have a AdUnitStyle object with ctaButtonColor-property', () => {
                const perfCampaign = campaign;
                const adUnitStyle = perfCampaign.getAdUnitStyle();
                if (!adUnitStyle) {
                    throw new Error('no AdUnitStyle object parsed from configuration');
                }
                assert.equal(adUnitStyle.getCTAButtonColor(), '#167dfb');
            });
            describe('Parsing json to campaign when AdUnitStyle in JSON', () => {
                const fuchsia = '#ff00ff';
                const fafafa = '#FAFAFA';
                let sandbox;
                let campaignJSON;
                beforeEach(() => {
                    sandbox = sinon.createSandbox();
                    sandbox.stub(SessionDiagnostics, 'trigger');
                    campaignJSON = Object.assign({}, OnCometVideoPlcCampaign);
                    campaignJSON.content = JSON.parse(campaignJSON.content);
                });
                afterEach(() => {
                    sandbox.restore();
                });
                it('is undefined, leaves adUnitStyle undefined', () => {
                    campaignJSON.content.adUnitStyle = undefined;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        assert.isUndefined(campaign.getAdUnitStyle());
                    });
                });
                it('is missing, leaves adUnitStyle undefined ', () => {
                    delete campaignJSON.content.adUnitStyle;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        assert.isUndefined(campaign.getAdUnitStyle());
                    });
                });
                it('is malformed, leaves adUnitStyle undefined ', () => {
                    campaignJSON.content.adUnitStyle = { 'thisIsNot': 'A Proper stylesheet' };
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        assert.isUndefined(campaign.getAdUnitStyle());
                    });
                });
                it('has a blank string, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = '';
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = campaign.getAdUnitStyle();
                        assert.isUndefined(returnedAdUnitStyle.getCTAButtonColor());
                    });
                });
                it('has a undefined value, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = undefined;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = campaign.getAdUnitStyle();
                        assert.isUndefined(returnedAdUnitStyle.getCTAButtonColor());
                    });
                });
                it('has a non-color value, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = '#blue12';
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = campaign.getAdUnitStyle();
                        assert.isUndefined(returnedAdUnitStyle.getCTAButtonColor());
                    });
                });
                it('has a lower case color, returns proper ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = fuchsia;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = campaign.getAdUnitStyle();
                        assert.equal(returnedAdUnitStyle.getCTAButtonColor(), fuchsia);
                        sinon.assert.notCalled(SessionDiagnostics.trigger);
                    });
                });
                it('has a upper case color, returns proper ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = fafafa;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = campaign.getAdUnitStyle();
                        assert.equal(returnedAdUnitStyle.getCTAButtonColor(), fafafa);
                    });
                });
                it('has an empty string, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = '';
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = campaign.getAdUnitStyle();
                        assert.equal(returnedAdUnitStyle.getCTAButtonColor(), undefined);
                    });
                });
            });
        });
        describe('when it is a performance campaign with square end screen asset', () => {
            beforeEach(() => {
                return parse(OnCometVideoPlcCampaignSquareEndScreenAsset);
            });
            it('should parse and return a performance campaign with square end screen asset', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PerformanceCampaign, 'Campaign was not an MRAIDCampaign');
                const perfCampaign = campaign;
                const json = OnCometVideoPlcCampaignSquareEndScreenAsset;
                const content = JSON.parse(json.content);
                assertBaseCampaign(content);
                assert.equal(perfCampaign.getVideo().getUrl(), Url.encode(content.trailerDownloadable), 'Downloadable Trailer URL is not equal');
                assert.equal(perfCampaign.getStreamingVideo().getUrl(), Url.encode(content.trailerStreaming), 'Downloadable Trailer URL is not equal');
                assert.equal(perfCampaign.getSquare().getOriginalUrl(), Url.encode(content.endScreen), 'Square URL is not equal');
                assert.equal(perfCampaign.getEndScreenType(), content.endScreenType, 'End Screen type is not equal');
                assert.equal(perfCampaign.getEndScreen().getUrl(), Url.encode(content.endScreenUrl), 'End Screen URL is not equal');
            });
        });
        describe('when it is a performance campaign with mraid endcard', () => {
            beforeEach(() => {
                return parse(OnCometVideoPlusPlayableCampaign);
            });
            it('should parse and return a performance campaign with proper endScreenType and endScreenSettings props', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PerformanceCampaign, 'Campaign was not a PerformanceCampaign');
                const perfCampaign = campaign;
                const json = OnCometVideoPlusPlayableCampaign;
                const content = JSON.parse(json.content);
                assertBaseCampaign(content);
                assert.equal(perfCampaign.getEndScreenType(), content.endScreenType, 'End Screen type is not equal');
                assert.equal(perfCampaign.getEndScreen().getUrl(), Url.encode(content.endScreenUrl), 'End Screen URL is not equal');
                assert.equal(perfCampaign.getEndScreenSettings().showCloseButton, content.endScreenSettings.showCloseButton, 'End Screen settings `showCloseButton` is not equal');
                assert.equal(perfCampaign.getEndScreenSettings().closeButtonDelay, content.endScreenSettings.closeButtonDelay, 'End Screen settings `closeButtonDelay` not equal');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tZXRDYW1wYWlnblBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvUGVyZm9ybWFuY2UvQ29tZXRDYW1wYWlnblBhcnNlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRy9ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU5RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRXRFLE9BQU8sdUJBQXVCLE1BQU0sdURBQXVELENBQUM7QUFDNUYsT0FBTyx1QkFBdUIsTUFBTSxvREFBb0QsQ0FBQztBQUN6RixPQUFPLGdDQUFnQyxNQUFNLGdFQUFnRSxDQUFDO0FBQzlHLE9BQU8sMkNBQTJDLE1BQU0sNEVBQTRFLENBQUM7QUFFckksT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzlFLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxRQUFR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