import 'mocha';
import { assert } from 'chai';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';

describe('VastCampaign', () => {
    it('should return default cache TTL of 1 hour represented in seconds', () => {
        const campaign = new VastCampaign(new Vast([], []), 'campaignId', 'gamerId', 1);
        assert.equal(campaign.getTimeoutInSeconds(), 3600);
    });

    it('should return default cache TTL represented in seconds if server provides TTL of 0', () => {
        const campaign = new VastCampaign(new Vast([], []), 'campaignId', 'gamerId', 1, 0);
        assert.equal(campaign.getTimeoutInSeconds(), 3600);
    });

    it('should return cache TTL provided by the server', () => {
        const json = {
            'abGroup': 3,
            'vast': {
                'data': '',
                'tracking': {
                    'click': null,
                    'complete': null,
                    'firstQuartile': null,
                    'midpoint': null,
                    'start': [],
                    'thirdQuartile': null
                }
            },
            'cacheTTL': 5000,
            'gamerId': '5712983c481291b16e1be03b'
        };
        const campaign = new VastCampaign(new Vast([], []), 'campaignId', json.gamerId, json.abGroup, json.cacheTTL);
        assert.equal(campaign.getTimeoutInSeconds(), 5000);
    });
});
