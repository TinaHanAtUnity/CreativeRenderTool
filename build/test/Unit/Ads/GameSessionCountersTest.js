import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('GameSessionCountersTest', () => {
    const videoCampaign = TestFixtures.getCampaign();
    const cometPlayableCampaign = TestFixtures.getPerformanceMRAIDCampaign();
    let clock;
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
        let latestTargetStartTimestamp;
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
        assert.equal(countersObj.startsPerTarget[cometPlayableCampaign.getTargetGameId()], 1);
        assert.equal(countersObj.viewsPerTarget[cometPlayableCampaign.getTargetGameId()], 1);
        latestTargetStartTimestamp = countersObj.latestTargetStarts[cometPlayableCampaign.getTargetGameId()];
        assert.equal(Object.keys(countersObj.latestTargetStarts).length, 2, 'latestTargetStarts, new target game campaign start was not recorded correctly');
        assert.isNotEmpty(countersObj.latestTargetStarts[cometPlayableCampaign.getTargetGameId()], 'latestTargetStarts has empty timestamp');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVNlc3Npb25Db3VudGVyc1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL0dhbWVTZXNzaW9uQ291bnRlcnNUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUVyQyxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDakQsTUFBTSxxQkFBcUIsR0FBRyxZQUFZLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztJQUN6RSxJQUFJLEtBQTRCLENBQUM7SUFFakMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDOUIsbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ1gsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtRQUNsRCxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBQ3hELG1CQUFtQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ25DLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUU1QyxNQUFNLGdCQUFnQixHQUFHLG1CQUFt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