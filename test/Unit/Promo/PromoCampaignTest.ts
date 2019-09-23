import { assert } from 'chai';

import DummyPromo from 'json/DummyPromoCampaign.json';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('PromoCampaign', () => {

    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            const json = JSON.parse(DummyPromo);
            const campaign = TestFixtures.getPromoCampaign();

            assert.equal(campaign.getId(), json.promo.id);
        });
    });

    describe('disableCache', () => {
        it('should be false when user agent is invalid', () => {
            const campaign = TestFixtures.getPromoCampaign();
            assert.isFalse(campaign.disableCache(''));
            assert.isFalse(campaign.disableCache('Mozilla'));
            assert.isFalse(campaign.disableCache('Chrome/'));
        });
        it('should be true when user agent is valid', () => {
            const campaign = TestFixtures.getPromoCampaign();
            assert.isTrue(campaign.disableCache('Chrome/77.105.123.2'));
            assert.isTrue(campaign.disableCache('Chrome/100.02.23.9'));
            assert.isTrue(campaign.disableCache('Mozilla/5.0 (Linux; Android 10; Pixel Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.92 Mobile Safari/537.36'));
        });
    });
});
