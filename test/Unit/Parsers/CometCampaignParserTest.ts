import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Session } from 'Ads/Models/Session';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';

import OnCometMraidPlcCampaign from 'json/campaigns/performance/CometMraidUrlCampaign.json';
import OnCometVideoPlcCampaign from 'json/campaigns/performance/CometVideoCampaign.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('CometCampaignParser', () => {
    const placements = ['TestPlacement'];
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: CometCampaignParser;
    let nativeBridge: NativeBridge;
    let request: RequestManager;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve('http://s3-us-west-1.amazonaws.com/ads-load-testing/AssetPack1/b30-400.mp4'));

        session = TestFixtures.getSession();

        parser = new CometCampaignParser();
    });

    describe('parsing a campaign', () => {

        let campaign: MRAIDCampaign | PerformanceCampaign;

        const parse = (data: any) => {
            const response = new AuctionResponse(placements, data, mediaId, correlationId);
            return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
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
            assert.equal(campaign.getGameIcon().getUrl(), Url.encode(content.gameIcon), 'Game Icon is not equal');
            assert.equal(campaign.getRating(), content.rating, 'Rating is not the same');
            assert.equal(campaign.getLandscape().getOriginalUrl(), Url.encode(content.endScreenLandscape), 'Landscape URL is not equal');
            assert.equal(campaign.getPortrait().getOriginalUrl(), Url.encode(content.endScreenPortrait), 'Portrait URL is not equal');
            assert.equal(campaign.getBypassAppSheet(), content.bypassAppSheet, 'Bypass App Sheet is not equal');
            assert.equal(campaign.getStore(), getStore(content.store), 'Store is not equal');
            assert.equal(campaign.getAppStoreId(), content.appStoreId, 'App Store ID is not equal');
        };

        describe('when it is an mraid campaign', () => {
            beforeEach(() => {
                return parse(JSON.parse(OnCometMraidPlcCampaign));
            });

            it('should parse and return an mraid campaign', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof MRAIDCampaign, 'Campaign was not an MRAIDCampaign');

                const mraidCampaign = <MRAIDCampaign>campaign;
                const json = JSON.parse(OnCometMraidPlcCampaign);
                const content = JSON.parse(json.content);

                assertBaseCampaign(content);
                assert.equal(mraidCampaign.getUseWebViewUserAgentForTracking(), json.useWebViewUserAgentForTracking, 'WebView UA Tracking is not equal');
                assert.equal(mraidCampaign.getResourceUrl()!.getUrl(), Url.encode(content.mraidUrl), 'MRAID URL is not equal');
                assert.equal(mraidCampaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
            });
        });

        describe('when it is a performance campaign', () => {
            beforeEach(() => {
                return parse(JSON.parse(OnCometVideoPlcCampaign));
            });

            it('should parse and return a performance campaign', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PerformanceCampaign, 'Campaign was not an MRAIDCampaign');

                const perfCampaign = <PerformanceCampaign>campaign;
                const json = JSON.parse(OnCometVideoPlcCampaign);
                const content = JSON.parse(json.content);

                assertBaseCampaign(content);
                assert.equal(perfCampaign.getVideo()!.getUrl(), Url.encode(content.trailerDownloadable), 'Downloadable Trailer URL is not equal');
                assert.equal(perfCampaign.getStreamingVideo()!.getUrl(), Url.encode(content.trailerStreaming), 'Downloadable Trailer URL is not equal');
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
                    sandbox = sinon.sandbox.create();
                    sandbox.stub(Diagnostics, 'trigger');
                    campaignJSON = JSON.parse(OnCometVideoPlcCampaign);
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
                        sinon.assert.calledWith(<sinon.SinonSpy>Diagnostics.trigger, 'configuration_ad_unit_style_parse_error');
                    });
                });

                it('is missing, leaves adUnitStyle undefined ', () => {
                    delete campaignJSON.content.adUnitStyle;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        assert.isUndefined((<PerformanceCampaign>campaign).getAdUnitStyle());
                        sinon.assert.calledWith(<sinon.SinonSpy>Diagnostics.trigger, 'configuration_ad_unit_style_parse_error');
                    });
                });

                it('is malformed, leaves adUnitStyle undefined ', () => {
                    campaignJSON.content.adUnitStyle = { 'thisIsNot': 'A Proper stylesheet' };
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        assert.isUndefined((<PerformanceCampaign>campaign).getAdUnitStyle());
                        sinon.assert.calledWith(<sinon.SinonSpy>Diagnostics.trigger, 'configuration_ad_unit_style_parse_error');
                    });
                });

                it('has a blank string, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = '';
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.isUndefined((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor());
                        sinon.assert.notCalled(<sinon.SinonSpy>Diagnostics.trigger);
                    });
                });

                it('has a undefined value, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = undefined;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.isUndefined((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor());
                        sinon.assert.notCalled(<sinon.SinonSpy>Diagnostics.trigger);
                    });
                });

                it('has a non-color value, returns undefined ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = '#blue12';
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.isUndefined((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor());
                        sinon.assert.notCalled(<sinon.SinonSpy>Diagnostics.trigger);
                    });
                });

                it('has a lower case color, returns proper ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = fuchsia;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.equal((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor(), fuchsia);
                        sinon.assert.notCalled(<sinon.SinonSpy>Diagnostics.trigger);
                    });
                });

                it('has a upper case color, returns proper ctaButtonColor', () => {
                    campaignJSON.content.adUnitStyle.ctaButtonColor = fafafa;
                    campaignJSON.content = JSON.stringify(campaignJSON.content);
                    return parse(campaignJSON).then(() => {
                        const returnedAdUnitStyle = (<PerformanceCampaign>campaign).getAdUnitStyle();
                        assert.equal((<AdUnitStyle>returnedAdUnitStyle).getCTAButtonColor(), fafafa);
                        sinon.assert.notCalled(<sinon.SinonSpy>Diagnostics.trigger);
                    });
                });
            });
        });
    });
});
