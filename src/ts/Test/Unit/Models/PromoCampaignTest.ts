import 'mocha';
import { assert } from 'chai';

import DummyPromo from 'json/DummyPromoCampaign.json';
import { PromoCampaign } from "Models/PromoCampaign";

describe('PromoCampaign', () => {

    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            const json = JSON.parse(DummyPromo);
            const campaign = new PromoCampaign(json.campaign, json.gamerId, json.abGroup);

            assert.equal(campaign.getId(), json.campaign.id);
            assert.equal(campaign.getAbGroup(), json.abGroup);
            assert.equal(campaign.getGamerId(), json.gamerId);
        });
    });
});
