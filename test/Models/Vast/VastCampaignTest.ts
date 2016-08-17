import 'mocha';
import {assert} from 'chai';
import {VastCampaign} from '../../../src/ts/Models/Vast/VastCampaign';
import {Vast} from '../../../src/ts/Models/Vast/Vast';

describe('VastCampaign', () => {
    it('should return default cache TTL of 1 hour represented in seconds', () => {
        let campaign = new VastCampaign(new Vast([], [], {}), 'campaignId', 'gamerId', 1);
        assert.equal(campaign.getCacheTTLInSeconds(), 3600);
    });

    it('should return default cache TTL represented in seconds if server provides TTL of 0', () => {
        let campaign = new VastCampaign(new Vast([], [], {}), 'campaignId', 'gamerId', 1, 0);
        assert.equal(campaign.getCacheTTLInSeconds(), 3600);
    });

    it('should return cache TTL provided by the server', () => {
        let json = {
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
        let campaign = new VastCampaign(new Vast([], [], {}), 'campaignId', json.gamerId, json.abGroup, json.cacheTTL);
        assert.equal(campaign.getCacheTTLInSeconds(), 5000);
    });
});
