import 'mocha';
import { assert } from 'chai';

import { GameSessionCounters } from 'Utilities/GameSessionCounters';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import * as sinon from 'sinon';

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

    it('should return the DTO in right format', () => {
        clock.setSystemTime(Date.parse('2018-07-23T12:00:00Z'));
        GameSessionCounters.addAdRequest();
        GameSessionCounters.addStart(videoCampaign);

        let countersDTO = GameSessionCounters.getDTO();
        let latestCampaignStartTimestamp: string;
        assert.equal(countersDTO.starts, 1);
        assert.equal(countersDTO.adRequests, 1);
        assert.equal(countersDTO.views, 0);
        assert.equal(countersDTO.startsPerCampaign[videoCampaign.getId()], 1);
        assert.equal(countersDTO.startsPerTarget[videoCampaign.getGameId()], 1);
        assert.equal(countersDTO.viewsPerCampaign[videoCampaign.getId()], undefined);
        assert.equal(countersDTO.viewsPerTarget[videoCampaign.getGameId()], undefined);

        latestCampaignStartTimestamp = countersDTO.latestCampaignsStarts[videoCampaign.getId()];
        assert.equal(Object.keys(countersDTO.latestCampaignsStarts).length, 1,'latestsCampaign start was not recorded correctly');
        assert.isNotEmpty(countersDTO.latestCampaignsStarts[videoCampaign.getId()],'latestsCampaign has empty timestamp');
        assert.equal(latestCampaignStartTimestamp, '2018-07-23T12:00:00.000Z', 'Timestamp of latestCampaignsStart is incorrect');

        clock.setSystemTime(Date.parse('2018-07-23T12:15:00.000Z'));
        GameSessionCounters.addAdRequest();
        GameSessionCounters.addView(videoCampaign);
        GameSessionCounters.addStart(videoCampaign);
        countersDTO = GameSessionCounters.getDTO();
        assert.equal(countersDTO.starts, 2);
        assert.equal(countersDTO.adRequests, 2);
        assert.equal(countersDTO.views, 1);
        assert.equal(countersDTO.startsPerCampaign[videoCampaign.getId()], 2);
        assert.equal(countersDTO.startsPerTarget[videoCampaign.getGameId()], 2);
        assert.equal(countersDTO.viewsPerCampaign[videoCampaign.getId()], 1);
        assert.equal(countersDTO.viewsPerTarget[videoCampaign.getGameId()], 1);

        latestCampaignStartTimestamp = countersDTO.latestCampaignsStarts[videoCampaign.getId()];
        assert.equal(Object.keys(countersDTO.latestCampaignsStarts).length, 1,'latestsCampaign start was not recorded correctly, same campaign should have one entry');
        assert.isNotEmpty(countersDTO.latestCampaignsStarts[videoCampaign.getId()],'latestsCampaign has empty timestamp');
        assert.equal(latestCampaignStartTimestamp, '2018-07-23T12:15:00.000Z', 'Timestamp of latestCampaignsStart is incorrect');

        clock.setSystemTime(Date.parse('2018-07-24T10:00:00.000Z'));
        GameSessionCounters.addStart(cometPlayableCampaign);
        countersDTO = GameSessionCounters.getDTO();
        assert.equal(Object.keys(countersDTO.startsPerCampaign).length, 2);
        assert.equal(countersDTO.starts, 3);
        assert.equal(countersDTO.adRequests, 2);
        assert.equal(countersDTO.views, 1);
        assert.equal(countersDTO.startsPerCampaign[videoCampaign.getId()], 2);
        assert.equal(countersDTO.startsPerTarget[videoCampaign.getGameId()], 2);
        assert.equal(countersDTO.viewsPerCampaign[videoCampaign.getId()], 1);
        assert.equal(countersDTO.viewsPerTarget[videoCampaign.getGameId()], 1);
        assert.equal(countersDTO.startsPerCampaign[cometPlayableCampaign.getId()], 1);
        assert.equal(countersDTO.viewsPerCampaign[cometPlayableCampaign.getId()], undefined);

        latestCampaignStartTimestamp = countersDTO.latestCampaignsStarts[cometPlayableCampaign.getId()];
        assert.equal(Object.keys(countersDTO.latestCampaignsStarts).length, 2,'latestsCampaign, new campaign start was not recorded correctly');
        assert.isNotEmpty(countersDTO.latestCampaignsStarts[cometPlayableCampaign.getId()],'latestsCampaign has empty timestamp');
        assert.equal(latestCampaignStartTimestamp, '2018-07-24T10:00:00.000Z', 'Timestamp of latestCampaignsStart is incorrect');

        // Init
        GameSessionCounters.init();
        countersDTO = GameSessionCounters.getDTO();
        assert.equal(countersDTO.starts, 0);
        assert.equal(countersDTO.adRequests, 0);
        assert.equal(countersDTO.views, 0);
        assert.equal(Object.keys(countersDTO.startsPerCampaign).length, 0);
        assert.equal(Object.keys(countersDTO.startsPerTarget).length, 0);
        assert.equal(Object.keys(countersDTO.viewsPerCampaign).length, 0);
        assert.equal(Object.keys(countersDTO.viewsPerTarget).length, 0);
        assert.equal(Object.keys(countersDTO.latestCampaignsStarts).length, 0,'latestsCampaignsStarts was not initialized to 0 properly');
    });
});
