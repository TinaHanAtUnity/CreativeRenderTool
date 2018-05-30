import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { CometCampaignParser } from 'Parsers/CometCampaignParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Session } from 'Models/Session';
import { SdkApi } from 'Native/Api/Sdk';
import { Request } from 'Utilities/Request';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { PerformanceCampaign, StoreName } from 'Models/Campaigns/PerformanceCampaign';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Url } from 'Utilities/Url';

import OnCometMraidPlcCampaign from 'json/campaigns/performance/CometMraidUrlCampaign.json';
import OnCometVideoPlcCampaign from 'json/campaigns/performance/CometVideoCampaign.json';
import { getAbGroup } from 'Models/ABGroup';

describe('CometCampaignParser', () => {
    const placements = ['TestPlacement'];
    const gamerId = 'TestGamerId';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const abGroup = getAbGroup(0);

    let parser: CometCampaignParser;
    let nativeBridge: NativeBridge;
    let request: Request;
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
            return parser.parse(nativeBridge, request, response, session, gamerId, abGroup).then((parsedCampaign) => {
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
            }
            throw new Error('Unknown store value "' + store + '"');
        };

        const assertBaseCampaign = (content: any) => {
            assert.equal(campaign.getGamerId(), gamerId, 'GamerID is not equal');
            assert.equal(campaign.getAbGroup(), abGroup, 'ABGroup is not equal');
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
            assert.equal(campaign.getLandscape()!.getOriginalUrl(), Url.encode(content.endScreenLandscape), 'Landscape URL is not equal');
            assert.equal(campaign.getPortrait()!.getOriginalUrl(), Url.encode(content.endScreenPortrait), 'Portrait URL is not equal');
            assert.equal(campaign.getBypassAppSheet(), content.bypassAppSheet, 'Bypass App Sheet is not equal');
            assert.equal(campaign.getStore(), getStore(content.store), 'Store is not equal');
            assert.equal(campaign.getAppStoreId(), content.appStoreId, 'App Store ID is not equal');
        };

        const encodeVideoUrls = (urls: { [event: string]: string }) => {
            return Object.keys(urls).reduce((v: { [event: string]: string }, event: string) => {
                v[event] = Url.encode(urls[event]);
                return v;
            }, {});
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
        });
    });
});
