import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('GameSessionCountersTest', () => {

    const videoCampaign = TestFixtures.getCampaign();
    const cometPlayableCampaign = TestFixtures.getPlayableMRAIDCampaign();
    let clock : sinon.SinonFakeTimers;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        GameSessionCounters.init();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should return the counters in right format', () => {
        clock.setSystemTime(Date.parse('2018-07-23T12:00:00Z'));
        GameSessionCounters.addAdRequest();
        GameSessionCounters.addStart(videoCampaign);

        const countersObjStart = GameSessionCounters.getCurrentCounters();
        let countersObj = GameSessionCounters.getCurrentCounters();
        assert.deepEqual(countersObjStart, countersObj, 'Counters should be identical when there are no changes between queries');
        let latestCampaignStartTimestamp: string;

        assert.equal(countersObj.starts, 1);
        assert.equal(countersObj.adRequests, 1);
        assert.equal(countersObj.views, 0);
        assert.equal(countersObj.startsPerCampaign[videoCampaign.getId()], 1);
        assert.equal(countersObj.startsPerTarget[videoCampaign.getGameId()], 1);
        assert.equal(countersObj.viewsPerCampaign[videoCampaign.getId()], undefined);
        assert.equal(countersObj.viewsPerTarget[videoCampaign.getGameId()], undefined);

        latestCampaignStartTimestamp = countersObj.latestCampaignsStarts[videoCampaign.getId()];
        assert.equal(Object.keys(countersObj.latestCampaignsStarts).length, 1,'latestsCampaign start was not recorded correctly');
        assert.isNotEmpty(countersObj.latestCampaignsStarts[videoCampaign.getId()],'latestsCampaign has empty timestamp');
        assert.equal(latestCampaignStartTimestamp, '2018-07-23T12:00:00.000Z', 'Timestamp of latestCampaignsStart is incorrect');

        clock.setSystemTime(Date.parse('2018-07-23T12:15:00.000Z'));
        GameSessionCounters.addAdRequest();
        GameSessionCounters.addView(videoCampaign);
        GameSessionCounters.addStart(videoCampaign);
        countersObj = GameSessionCounters.getCurrentCounters();
        assert.equal(countersObj.starts, 2);
        assert.equal(countersObj.adRequests, 2);
        assert.equal(countersObj.views, 1);
        assert.equal(countersObj.startsPerCampaign[videoCampaign.getId()], 2);
        assert.equal(countersObj.startsPerTarget[videoCampaign.getGameId()], 2);
        assert.equal(countersObj.viewsPerCampaign[videoCampaign.getId()], 1);
        assert.equal(countersObj.viewsPerTarget[videoCampaign.getGameId()], 1);

        latestCampaignStartTimestamp = countersObj.latestCampaignsStarts[videoCampaign.getId()];
        assert.equal(Object.keys(countersObj.latestCampaignsStarts).length, 1,'latestsCampaign start was not recorded correctly, same campaign should have one entry');
        assert.isNotEmpty(countersObj.latestCampaignsStarts[videoCampaign.getId()],'latestsCampaign has empty timestamp');
        assert.equal(latestCampaignStartTimestamp, '2018-07-23T12:15:00.000Z', 'Timestamp of latestCampaignsStart is incorrect');

        clock.setSystemTime(Date.parse('2018-07-24T10:00:00.000Z'));
        GameSessionCounters.addStart(cometPlayableCampaign);
        countersObj = GameSessionCounters.getCurrentCounters();
        assert.equal(Object.keys(countersObj.startsPerCampaign).length, 2);
        assert.equal(countersObj.starts, 3);
        assert.equal(countersObj.adRequests, 2);
        assert.equal(countersObj.views, 1);
        assert.equal(countersObj.startsPerCampaign[videoCampaign.getId()], 2);
        assert.equal(countersObj.startsPerTarget[videoCampaign.getGameId()], 2);
        assert.equal(countersObj.viewsPerCampaign[videoCampaign.getId()], 1);
        assert.equal(countersObj.viewsPerTarget[videoCampaign.getGameId()], 1);
        assert.equal(countersObj.startsPerCampaign[cometPlayableCampaign.getId()], 1);
        assert.equal(countersObj.viewsPerCampaign[cometPlayableCampaign.getId()], undefined);

        latestCampaignStartTimestamp = countersObj.latestCampaignsStarts[cometPlayableCampaign.getId()];
        assert.equal(Object.keys(countersObj.latestCampaignsStarts).length, 2,'latestsCampaign, new campaign start was not recorded correctly');
        assert.isNotEmpty(countersObj.latestCampaignsStarts[cometPlayableCampaign.getId()],'latestsCampaign has empty timestamp');
        assert.equal(latestCampaignStartTimestamp, '2018-07-24T10:00:00.000Z', 'Timestamp of latestCampaignsStart is incorrect');

        assert.equal(countersObjStart.starts, 1, 'the queried counters should have changed');
        assert.equal(countersObjStart.adRequests, 1, 'the queried counters should have changed');
        assert.equal(countersObjStart.views, 0, 'the queried counters should have changed');
        assert.equal(countersObjStart.startsPerCampaign[videoCampaign.getId()], 1, 'the queried counters should have changed');
        assert.equal(countersObjStart.startsPerTarget[videoCampaign.getGameId()], 1, 'the queried counters should have changed');
        assert.equal(countersObjStart.viewsPerCampaign[videoCampaign.getId()], undefined, 'the queried counters should have changed');
        assert.equal(countersObjStart.viewsPerTarget[videoCampaign.getGameId()], undefined, 'the queried counters should have changed');
        assert.equal(countersObjStart.startsPerCampaign[cometPlayableCampaign.getId()], undefined, 'the queried counters should have changed');
        assert.equal(countersObjStart.viewsPerCampaign[cometPlayableCampaign.getId()], undefined, 'the queried counters should have changed');

        // Init
        GameSessionCounters.init();
        countersObj = GameSessionCounters.getCurrentCounters();
        assert.equal(countersObj.starts, 0);
        assert.equal(countersObj.adRequests, 0);
        assert.equal(countersObj.views, 0);
        assert.equal(Object.keys(countersObj.startsPerCampaign).length, 0);
        assert.equal(Object.keys(countersObj.startsPerTarget).length, 0);
        assert.equal(Object.keys(countersObj.viewsPerCampaign).length, 0);
        assert.equal(Object.keys(countersObj.viewsPerTarget).length, 0);
        assert.equal(Object.keys(countersObj.latestCampaignsStarts).length, 0,'latestsCampaignsStarts was not initialized to 0 properly');
    });
});
