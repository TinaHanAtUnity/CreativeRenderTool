import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { TestFixtures } from '../../TestHelpers/TestFixtures';

import VastCompanionXml from 'xml/VastCompanionAd.xml';
import VastCompanionAdWithoutImagesXml from 'xml/VastCompanionAdWithoutImages.xml';

describe('VastCampaign', () => {
    it('should return default cache TTL of 1 hour represented in seconds', () => {
        const vast = new Vast([], []);
        sinon.stub(vast, 'getVideoUrl').returns('https://video.url');
        const campaign = new VastCampaign(vast, 'campaignId', 'gamerId', 1);
        assert.equal(campaign.getTimeout(), 3600);
    });

    it('should return default cache TTL represented in seconds if server provides TTL of 0', () => {
        const vast = new Vast([], []);
        sinon.stub(vast, 'getVideoUrl').returns('https://video.url');
        const campaign = new VastCampaign(vast, 'campaignId', 'gamerId', 1, 0);
        assert.equal(campaign.getTimeout(), 3600);
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
        const vast = new Vast([], []);
        sinon.stub(vast, 'getVideoUrl').returns('https://video.url');
        const campaign = new VastCampaign(vast, 'campaignId', json.gamerId, json.abGroup, json.cacheTTL);
        assert.equal(campaign.getTimeout(), 5000);
    });

    describe('when VAST has a companion ad', () => {
        it('should have an endscreen when VAST has portrait or landscape url', () => {
            const vastParser = TestFixtures.getVastParser();
            const vast = vastParser.parseVast(VastCompanionXml);
            const vastCampaign = new VastCampaign(vast, '12345', 'gamerId', 1);
            assert.equal(vastCampaign.hasEndscreen(), true);
        });

        it('should not have an endscreen when both portrait and landscape urls missing', () => {
            const vastParser = TestFixtures.getVastParser();
            const vast = vastParser.parseVast(VastCompanionAdWithoutImagesXml);
            const vastCampaign = new VastCampaign(vast, '12345', 'gamerId', 1);
            assert.equal(vastCampaign.hasEndscreen(), false);
        });
    });
});
