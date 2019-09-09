import { assert } from 'chai';

import OnCometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';
import 'mocha';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import { VastCampaign } from 'VAST/Models/VastCampaign';
import CacheSimpleVast from 'xml/CacheSimpleVast.xml';
import SimpleVast from 'xml/SimpleVast.xml';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

describe('PerformanceCampaign', () => {

    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            const configuration = TestFixtures.getCoreConfiguration();
            const json: any = OnCometVideoPlcCampaign;
            const campaignObject: any = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);

            const params = TestFixtures.getPerformanceCampaignParams(campaignObject, StoreName.GOOGLE);
            const campaign = new PerformanceCampaign(params);

            assert.equal(campaign.getAppStoreId(), campaignObject.appStoreId);
            assert.equal(campaign.getLandscape()!.getUrl(), campaignObject.endScreenLandscape);
            assert.equal(campaign.getPortrait()!.getUrl(), campaignObject.endScreenPortrait);
            assert.equal(campaign.getGameIcon().getUrl(), campaignObject.gameIcon);
            assert.equal(campaign.getGameId(), campaignObject.gameId);
            assert.equal(campaign.getGameName(), campaignObject.gameName);
            assert.equal(campaign.getId(), campaignObject.id);
            assert.equal(campaign.getRating(), campaignObject.rating);
            assert.equal(campaign.getRatingCount(), campaignObject.ratingCount);
        });
    });
});

describe('VastCampaign', () => {
    describe('when created with VAST json', () => {
        it('should have correct data from the json', () => {
            const vastXml = SimpleVast;
            const vastParser = TestFixtures.getVastParserStrict();
            const parsedVast = vastParser.parseVast(vastXml);
            const params = TestFixtures.getVastCampaignParams(parsedVast, 3600, '12345');
            const campaign = new VastCampaign(params);

            assert.equal(campaign.getId(), '12345');
            assert.deepEqual(campaign.getImpressionUrls(), [
                'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.scanscout.com&C8=scanscout.com&C9=http%3A%2F%2Fwww.scanscout.com&C10=xn&rn=-103217130'
            ], 'impression urls');
            const vast = campaign.getVast();
            assert.equal(1, vast.getAds().length);
            assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.START), [
                'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'
            ], 'start tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.FIRST_QUARTILE), [], 'first quartile tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.MIDPOINT), [], 'midpoint tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.THIRD_QUARTILE), [], 'third quartile tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.COMPLETE), [], 'complete tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.MUTE), [], 'mute tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.UNMUTE), [], 'unmute tracking event urls');
            assert.equal(vast.getVideoUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4', 'video url');
            assert.equal(vast.getDuration(), 30, 'duration');
            assert.deepEqual(vast.getErrorURLTemplates(), [], 'error urls');
        });

        it('should return cached video url when set', () => {
            const vastXml = CacheSimpleVast;
            const vastParser = TestFixtures.getVastParserStrict();
            const parsedVast = vastParser.parseVast(vastXml);
            const params = TestFixtures.getVastCampaignParams(parsedVast, 3600, '12345');
            const campaign = new VastCampaign(params);
            campaign.getVideo().setCachedUrl('file://some/cache/path.mp4');
            assert.equal(campaign.getVideo().getUrl(), 'file://some/cache/path.mp4');
        });
    });
});
