import 'mocha';
import { assert } from 'chai';

import DummyPromo from 'json/DummyPromoCampaign.json';
import { PromoCampaign } from 'Ads/Models/Campaigns/PromoCampaign';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('PromoCampaign', () => {

    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            const json = JSON.parse(DummyPromo);
            const campaign = TestFixtures.getPromoCampaign();

            assert.equal(campaign.getId(), json.promo.id);
        });
    });
});
