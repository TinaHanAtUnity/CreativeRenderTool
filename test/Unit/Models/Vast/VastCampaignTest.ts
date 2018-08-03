import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { Vast } from 'Models/Vast/Vast';
import { TestFixtures } from 'Helpers/TestFixtures';

describe('VastCampaignTest', () => {
    it('should return default cache TTL of 1 hour represented in seconds', () => {
        const vast = new Vast([], []);
        sinon.stub(vast, 'getVideoUrl').returns('https://video.url');
        const campaign = TestFixtures.getEventVastCampaign();
        const willExpireAt = campaign.getWillExpireAt();
        assert.isDefined(willExpireAt, 'Will expire at should be defined');
        if(willExpireAt) {
            const timeDiff = willExpireAt - (Date.now() + 3600 * 1000);
            assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
        }
    });

    it('should return default cache TTL represented in seconds if server provides TTL of 0', () => {
        const vast = new Vast([], []);
        sinon.stub(vast, 'getVideoUrl').returns('https://video.url');
        const campaign = TestFixtures.getEventVastCampaign();
        const willExpireAt = campaign.getWillExpireAt();
        assert.isDefined(willExpireAt, 'Will expire at should be defined');
        if(willExpireAt) {
            const timeDiff = willExpireAt - (Date.now() + 3600 * 1000);
            assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
        }
    });

    it('should return cache TTL provided by the server', () => {
        const campaign = TestFixtures.getEventVastCampaign();
        const willExpireAt = campaign.getWillExpireAt();
        assert.isDefined(willExpireAt, 'Will expire at should be defined');
        if(willExpireAt) {
            const timeDiff = willExpireAt - (Date.now() + 3600 * 1000);
            assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
        }
    });

    describe('when VAST has a companion ad', () => {
        it('should have an endscreen when VAST has portrait or landscape url', () => {
            const vastCampaign = TestFixtures.getCompanionVastCampaign();
            assert.equal(vastCampaign.hasEndscreen(), true);
        });

        it('should not have an endscreen when both portrait and landscape urls missing', () => {
            const vastCampaign = TestFixtures.getCompanionVastCampaignWihoutImages();
            assert.equal(vastCampaign.hasEndscreen(), false);
        });
    });
});
