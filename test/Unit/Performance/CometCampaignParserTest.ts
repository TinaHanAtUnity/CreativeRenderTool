import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { Session } from 'Ads/Models/Session';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
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

    let parser: CometCampaignParser;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let request: RequestManager;
    let session: Session;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        (<any>core.Api).Sdk = sinon.createStubInstance(SdkApi);
        sinon.stub(Date, 'now').returns(0); // To easily calculate willExpireAt

        request = sinon.createStubInstance(RequestManager);
        (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve('http://s3-us-west-1.amazonaws.com/ads-load-testing/AssetPack1/b30-400.mp4'));
        core.RequestManager = request;

        session = TestFixtures.getSession();

        parser = new CometCampaignParser(core);
    });

    describe('parsing a campaign', () => {

        let campaign: MRAIDCampaign | PerformanceCampaign;

        const parse = (data: any) => {
            const auctionPlacement = new AuctionPlacement(placementId, mediaId);
            const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
            return parser.parse(response, session).then((parsedCampaign) => {
                campaign = <MRAIDCampaign | PerformanceCampaign>parsedCampaign;
            });
        };

        const getStore = (store: string) => {
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

        const encodeVideoUrls = (urls: { [event: string]: string }) => {
            return Object.keys(urls).reduce((v: { [event: string]: string }, event: string) => {
                v[event] = Url.encode(urls[event]);
                return v;
            }, {});
        };

        const assertBaseCampaign = (content: any) => {
            assert.equal(campaign.getSession(), session, 'Session is not equal');
            assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
            assert.equal(campaign.getId(), content.id, 'ID is not equal');
            assert.equal(campaign.getMeta(), content.meta, 'Meta is not equal');
            assert.equal(campaign.getClickAttributionUrl(), Url.encode(content.clickAttributionUrl), 'Click Attribution URL is not equal');
            assert.equal(campaign.getClickAttributionUrlFollowsRedirects(), content.clickAttributionUrlFollowsRedirects, 'Click Attribution Url follows redirects is not equal');
            assert.equal(campaign.getClickUrl(), Url.encode(content.clickUrl), 'Click Url is not equal');
            assert.deepEqual(campaign.getVideoEventUrls(), encodeVideoUrls(content.videoEventUrls), 'Video Event URLs is not equal');
            assert.equal(campaign.getGameName(), content.gameName, 'Game Name is equal');
            assert.equal(campaign.getGameIcon()!.getUrl(), Url.encode(content.gameIcon), 'Game Icon is not equal');
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

                const mraidCampaign = <MRAIDCampaign>campaign;
                const json = { ... OnCometMraidPlcCampaign };
                const content = JSON.parse(json.content);

                assertBaseCampaign(content);
                assert.equal(mraidCampaign.getUseWebViewUserAgentForTracking(), json.useWebViewUserAgentForTracking, 'WebView UA Tracking is not equal');
                assert.equal(mraidCampaign.getResourceUrl()!.getUrl(), Url.encode(content.mraidUrl), 'MRAID URL is not equal');
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

                const perfCampaign = <PerformanceCampaign>campaign;
                const json = { ... OnCometVideoPlcCampaign };
                const content = JSON.parse(json.content);

                assertBaseCampaign(content);
                assert.equal(perfCampaign.getVideo()!.getUrl(), Url.encode(content.trailerDownloadable), 'Downloadable Trailer URL is not equal');
                assert.equal(perfCampaign.getStreamingVideo()!.getUrl(), Url.encode(content.trailerStreaming), 'Downloadable Trailer URL is not equal');
                assert.equal(perfCampaign.getLandscape()!.getOriginalUrl(), Url.encode(content.endScreenLandscape), 'Landscape URL is not equal');
                assert.equal(perfCampaign.getPortrait()!.getOriginalUrl(), Url.encode(content.endScreenPortrait), 'Portrait URL is not equal');
                assert.equal(perfCampaign.getEndScreenType(), content.endScreenType, 'End Screen type is not equal');
                assert.equal(perfCampaign.getEndScreen()!.getUrl(), Url.encode(content.endScreenUrl), 'End Screen URL is not equal');

            });

            it('should have a AdUnitStyle object with ctaButtonColor-property', () => {
                const perfCampaign = <PerformanceCampaign>campaign;
                const adUnitStyle: AdUnitStyle | undefined = perfCampaign.getAdUnitStyle();

                if (!adUnitStyle) {
                    throw new Error('no AdUnitStyle object parsed from configuration');
                }
                assert.equal(adUnitStyle.getCTAButtonColor(), '#167dfb');
            });

            describe('Parsing json to campaign when AdUnitStyle in JSON', () => {
                const fuchsia = '#ff00ff';
                const fafafa = '#FAFAFA';

                let sandbox: sinon.SinonSandbox;
                let campaignJSON: any;

                beforeEach(() => {
                    sandbox = sinon.createSandbox();
                    sandbox.stub(SessionDiagnostics, 'trigger');
                    campaignJSON = { ... OnCometVideoPlcCampaign };
                    campaignJSON.content = JSON.parse(campaignJSON.content);
                });

                afterEach(() => {
                    sandbox.restore();
                });

                it('is undefined, leaves adUnitStyle undefined', () => {
                    campaignJSON.content.adUnitStyle = undefined;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        assert.isUndefined((<PerformanceCampaign>campaign).getAdUnitStyle());
                    });
                });

                it('is missing, leaves adUnitStyle undefined ', () => {
                    delete campaignJSON.content.adUnitStyle;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        assert.isUndefined((<PerformanceCampaign>campaign).getAdUnitStyle());
                    });
                });

                it('is malformed, leaves adUnitStyle undefined ', () => {
                    campaignJSON.content.adUnitStyle = { 'thisIsNot': 'A Proper stylesheet' };
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        assert.isUndefined((<PerformanceCampaign>campaign).getAdUnitStyle());
                    });
                });

                it('has a blank string, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = '';
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.isUndefined((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor());
                    });
                });

                it('has a undefined value, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = undefined;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.isUndefined((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor());
                    });
                });

                it('has a non-color value, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = '#blue12';
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.isUndefined((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor());
                    });
                });

                it('has a lower case color, returns proper ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = fuchsia;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.equal((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor(), fuchsia);
                        sinon.assert.notCalled(<sinon.SinonSpy>SessionDiagnostics.trigger);
                    });
                });

                it('has a upper case color, returns proper ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = fafafa;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.equal((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor(), fafafa);
                    });
                });

                it('has an empty string, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = '';
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.equal((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor(), undefined);
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

                const perfCampaign = <PerformanceCampaign>campaign;
                const json = OnCometVideoPlcCampaignSquareEndScreenAsset;
                const content = JSON.parse(json.content);

                assertBaseCampaign(content);
                assert.equal(perfCampaign.getVideo()!.getUrl(), Url.encode(content.trailerDownloadable), 'Downloadable Trailer URL is not equal');
                assert.equal(perfCampaign.getStreamingVideo()!.getUrl(), Url.encode(content.trailerStreaming), 'Downloadable Trailer URL is not equal');
                assert.equal(perfCampaign.getSquare()!.getOriginalUrl(), Url.encode(content.endScreen), 'Square URL is not equal');
                assert.equal(perfCampaign.getEndScreenType(), content.endScreenType, 'End Screen type is not equal');
                assert.equal(perfCampaign.getEndScreen()!.getUrl(), Url.encode(content.endScreenUrl), 'End Screen URL is not equal');

            });
        });

        describe('when it is a performance campaign with mraid endcard', () => {
            beforeEach(() => {
                return parse(OnCometVideoPlusPlayableCampaign);
            });

            it('should parse and return a performance campaign with proper endScreenType and endScreenSettings props', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PerformanceCampaign, 'Campaign was not a PerformanceCampaign');

                const perfCampaign = <PerformanceCampaign>campaign;
                const json = OnCometVideoPlusPlayableCampaign;
                const content = JSON.parse(json.content);

                assertBaseCampaign(content);
                assert.equal(perfCampaign.getEndScreenType(), content.endScreenType, 'End Screen type is not equal');
                assert.equal(perfCampaign.getEndScreen()!.getUrl(), Url.encode(content.endScreenUrl), 'End Screen URL is not equal');
                assert.equal(perfCampaign.getEndScreenSettings()!.showCloseButton, content.endScreenSettings.showCloseButton, 'End Screen settings `showCloseButton` is not equal');
                assert.equal(perfCampaign.getEndScreenSettings()!.closeButtonDelay, content.endScreenSettings.closeButtonDelay, 'End Screen settings `closeButtonDelay` not equal');
            });
        });
    });
});
