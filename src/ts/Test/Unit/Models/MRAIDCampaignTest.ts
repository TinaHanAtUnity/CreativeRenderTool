import 'mocha';
import { assert } from 'chai';

import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { HTML } from 'Models/Assets/HTML';
import DummyMRAID from 'json/DummyMRAIDCampaign.json';

describe('MRAIDCampaign', () => {

    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            const json = JSON.parse(DummyMRAID);
            const asset = new HTML(json.mraid.inlinedURL);
            const campaign = new MRAIDCampaign(json.mraid, json.gamerId, json.abGroup, json.mraid.inlinedURL, '<div>resource</div>');

            assert.equal(campaign.getId(), json.mraid.id);
            assert.equal(campaign.getAbGroup(), json.abGroup);
            assert.equal(campaign.getGamerId(), json.gamerId);
            assert.deepEqual(campaign.getResourceUrl(), asset);
            assert.deepEqual(campaign.getRequiredAssets(), [asset]);
            assert.deepEqual(campaign.getOptionalAssets(), []);
            assert.equal(campaign.getResource(), '<div>resource</div>');
            assert.equal(campaign.getDynamicMarkup(), json.mraid.dynamicMarkup);
        });

        it('should have correct additional tracking from the json', () => {
            const json = JSON.parse(DummyMRAID);
            const campaign = new MRAIDCampaign(json.mraid, json.gamerId, json.abGroup, json.mraid.inlinedURL, '<div>resource</div>', json.mraid.tracking);

            assert.deepEqual(campaign.getTrackingEventUrls(), json.mraid.tracking);
        });

        it('should set resourceUrl', () => {
            const json = JSON.parse(DummyMRAID);
            const campaign = new MRAIDCampaign(json.mraid, json.gamerId, json.abGroup);
            const asset = new HTML('https://resource-url.com');

            campaign.setResourceUrl('https://resource-url.com');

            assert.deepEqual(campaign.getResourceUrl(), asset);
        });

        it('should set resource', () => {
            const json = JSON.parse(DummyMRAID);
            const campaign = new MRAIDCampaign(json.mraid, json.gamerId, json.abGroup);

            campaign.setResource('some resource');

            assert.equal(campaign.getResource(), 'some resource');
        });
    });
});
