import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Vast } from 'VAST/Models/Vast';

describe('VastCampaignTest', () => {
    it('should return default cache TTL of 1 hour represented in seconds', () => {
        const vast = new Vast([], []);
        sinon.stub(vast, 'getVideoUrl').returns('https://video.url');
        const campaign = TestFixtures.getEventVastCampaign();
        const willExpireAt = campaign.getWillExpireAt();
        assert.isDefined(willExpireAt, 'Will expire at should be defined');
        if (willExpireAt) {
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
        if (willExpireAt) {
            const timeDiff = willExpireAt - (Date.now() + 3600 * 1000);
            assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
        }
    });

    it('should return cache TTL provided by the server', () => {
        const campaign = TestFixtures.getEventVastCampaign();
        const willExpireAt = campaign.getWillExpireAt();
        assert.isDefined(willExpireAt, 'Will expire at should be defined');
        if (willExpireAt) {
            const timeDiff = willExpireAt - (Date.now() + 3600 * 1000);
            assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
        }
    });

    describe('when VAST has a companion ad', () => {
        it('should have an static endscreen when VAST has portrait or landscape url', () => {
            const vastCampaign = TestFixtures.getCompanionStaticVastCampaign();
            assert.equal(vastCampaign.hasStaticEndscreen(), true);
        });

        it('should not have an static endscreen when both portrait and landscape urls missing', () => {
            const vastCampaign = TestFixtures.getCompanionVastCampaignWithoutImages();
            assert.equal(vastCampaign.hasStaticEndscreen(), false);
        });
        // enable these tests if abgroup is enabled
        xit('should have an iframe endscreen when VAST has iframe url', () => {
            const vastCampaign = TestFixtures.getCompanionIframeVastCampaign();
            assert.equal(vastCampaign.hasIframeEndscreen(), true);
        });

        xit('should not have an iframe endscreen when VAST has no iframe', () => {
            const vastCampaign = TestFixtures.getCompanionStaticVastCampaign();
            assert.equal(vastCampaign.hasIframeEndscreen(), false);
        });
    });
});
