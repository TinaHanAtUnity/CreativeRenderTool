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
        // enable these tests if vast iframe abgroup is enabled
        xit('should have an iframe endscreen when VAST has iframe url', () => {
            const vastCampaign = TestFixtures.getCompanionIframeVastCampaign();
            assert.equal(vastCampaign.hasIframeEndscreen(), true);
        });
        xit('should not have an iframe endscreen when VAST has no iframe', () => {
            const vastCampaign = TestFixtures.getCompanionStaticVastCampaign();
            assert.equal(vastCampaign.hasIframeEndscreen(), false);
        });
        // enable these tests if vast html abgroup is enabled
        xit('should have an html endscreen when VAST has html content', () => {
            const vastCampaign = TestFixtures.getCompanionHtmlVastCampaign();
            assert.equal(vastCampaign.hasHtmlEndscreen(), true);
        });
        xit('should not have an html endscreen when VAST has no html content', () => {
            const vastCampaign = TestFixtures.getCompanionStaticVastCampaign();
            assert.equal(vastCampaign.hasHtmlEndscreen(), false);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENhbXBhaWduVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9WQVNUL1Zhc3RDYW1wYWlnblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFeEMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUM5QixFQUFFLENBQUMsa0VBQWtFLEVBQUUsR0FBRyxFQUFFO1FBQ3hFLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUM3RCxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUNyRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDaEQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztRQUNuRSxJQUFJLFlBQVksRUFBRTtZQUNkLE1BQU0sUUFBUSxHQUFHLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxzRkFBc0YsQ0FBQyxDQUFDO1NBQ2xJO0lBQ0wsQ0FBQyxDQUFD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