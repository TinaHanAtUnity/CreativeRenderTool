import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('GameSessionCountersTest', () => {

    const videoCampaign = TestFixtures.getCampaign();
    const cometPlayableCampaign = TestFixtures.getPerformanceMRAIDCampaign();
    let clock: sinon.SinonFakeTimers;

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
        let latestTargetStartTimestamp: string;

        assert.equal(countersObj.starts, 1);
        assert.equal(countersObj.adRequests, 1);
        assert.equal(countersObj.views, 0);
        assert.equal(countersObj.startsPerTarget[videoCampaign.getGameId()], 1);
        assert.equal(countersObj.viewsPerTarget[videoCampaign.getGameId()], undefined);

        latestTargetStartTimestamp = countersObj.latestTargetStarts[videoCampaign.getGameId()];
        assert.equal(Object.keys(countersObj.latestTargetStarts).length, 1, 'latestTargetStarts start was not recorded correctly');
        assert.isNotEmpty(countersObj.latestTargetStarts[videoCampaign.getGameId()], 'latestTargetStarts has empty timestamp');
        assert.equal(latestTargetStartTimestamp, '2018-07-23T12:00:00.000Z', 'Timestamp of latestTargetStarts is incorrect');

        clock.setSystemTime(Date.parse('2018-07-23T12:15:00.000Z'));
        GameSessionCounters.addAdRequest();
        GameSessionCounters.addView(videoCampaign);
        GameSessionCounters.addStart(videoCampaign);
        countersObj = GameSessionCounters.getCurrentCounters();
        assert.equal(countersObj.starts, 2);
        assert.equal(countersObj.adRequests, 2);
        assert.equal(countersObj.views, 1);
        assert.equal(countersObj.startsPerTarget[videoCampaign.getGameId()], 2);
        assert.equal(countersObj.viewsPerTarget[videoCampaign.getGameId()], 1);

        latestTargetStartTimestamp = countersObj.latestTargetStarts[videoCampaign.getGameId()];
        assert.equal(Object.keys(countersObj.latestTargetStarts).length, 1, 'latestTargetStarts start was not recorded correctly, same target game should have one entry');
        assert.isNotEmpty(countersObj.latestTargetStarts[videoCampaign.getGameId()], 'latestTargetStarts has empty timestamp');
        assert.equal(latestTargetStartTimestamp, '2018-07-23T12:15:00.000Z', 'Timestamp of latestTargetStarts is incorrect');

        clock.setSystemTime(Date.parse('2018-07-24T10:00:00.000Z'));
        GameSessionCounters.addStart(cometPlayableCampaign);
        GameSessionCounters.addView(cometPlayableCampaign);
        countersObj = GameSessionCounters.getCurrentCounters();
        assert.equal(countersObj.starts, 3);
        assert.equal(countersObj.adRequests, 2);
        assert.equal(countersObj.views, 2);
        assert.equal(countersObj.startsPerTarget[videoCampaign.getGameId()], 2);
        assert.equal(countersObj.viewsPerTarget[videoCampaign.getGameId()], 1);
        assert.equal(countersObj.startsPerTarget[cometPlayableCampaign.getTargetGameId()!], 1);
        assert.equal(countersObj.viewsPerTarget[cometPlayableCampaign.getTargetGameId()!], 1);

        latestTargetStartTimestamp = countersObj.latestTargetStarts[cometPlayableCampaign.getTargetGameId()!];
        assert.equal(Object.keys(countersObj.latestTargetStarts).length, 2, 'latestTargetStarts, new target game campaign start was not recorded correctly');
        assert.isNotEmpty(countersObj.latestTargetStarts[cometPlayableCampaign.getTargetGameId()!], 'latestTargetStarts has empty timestamp');
        assert.equal(latestTargetStartTimestamp, '2018-07-24T10:00:00.000Z', 'Timestamp of latestTargetStarts is incorrect');

        assert.equal(countersObjStart.starts, 1, 'the queried counters should have changed');
        assert.equal(countersObjStart.adRequests, 1, 'the queried counters should have changed');
        assert.equal(countersObjStart.views, 0, 'the queried counters should have changed');
        assert.equal(countersObjStart.startsPerTarget[videoCampaign.getGameId()], 1, 'the queried counters should have changed');
        assert.equal(countersObjStart.viewsPerTarget[videoCampaign.getGameId()], undefined, 'the queried counters should have changed');

        // Init
        GameSessionCounters.init();
        countersObj = GameSessionCounters.getCurrentCounters();
        assert.equal(countersObj.starts, 0);
        assert.equal(countersObj.adRequests, 0);
        assert.equal(countersObj.views, 0);
        assert.equal(Object.keys(countersObj.startsPerTarget).length, 0);
        assert.equal(Object.keys(countersObj.viewsPerTarget).length, 0);
        assert.equal(Object.keys(countersObj.latestTargetStarts).length, 0, 'latestTargetStarts was not initialized to 0 properly');
    });
});
