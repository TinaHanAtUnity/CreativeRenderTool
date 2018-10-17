import { assert } from 'chai';

import DummyPromo from 'json/DummyPromoCampaign.json';
import 'mocha';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { TestFixtures } from 'test/TestHelpers/TestFixtures';

describe('PromoCampaign', () => {

    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            const json = JSON.parse(DummyPromo);
            const campaign = TestFixtures.getPromoCampaign();

            assert.equal(campaign.getId(), json.promo.id);
        });
    });
});
