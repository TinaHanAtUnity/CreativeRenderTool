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
            const json = OnCometVideoPlcCampaign;
            const campaignObject = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            const params = TestFixtures.getPerformanceCampaignParams(campaignObject, StoreName.GOOGLE);
            const campaign = new PerformanceCampaign(params);
            assert.equal(campaign.getAppStoreId(), campaignObject.appStoreId);
            assert.equal(campaign.getLandscape().getUrl(), campaignObject.endScreenLandscape);
            assert.equal(campaign.getPortrait().getUrl(), campaignObject.endScreenPortrait);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25UZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9DYW1wYWlnblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QixPQUFPLHVCQUF1QixNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxlQUFlLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxVQUFVLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRXBFLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFFakMsUUFBUSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtRQUM3QyxFQUFFLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO1lBQzlDLE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzFELE1BQU0sSUFBSSxHQUFRLHVCQUF1QixDQUFDO1lBQzFDLE1BQU0sY0FBYyxHQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXRHLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyw0QkFBNEIsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNGLE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7WUFF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