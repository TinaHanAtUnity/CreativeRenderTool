import 'mocha';
import { assert } from 'chai';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { CometCampaignLoader } from 'Performance/Parsers/CometCampaignLoader';

describe('CometCampaignLoaderTest', () => {
    it('should reload comet campaign', () => {
        const originalCampaign: PerformanceCampaign = TestFixtures.getCampaign();

        const serializedCampaign = originalCampaign.toJSON();

        const loader: CometCampaignLoader = new CometCampaignLoader();

        const newCampaign: PerformanceCampaign | undefined = loader.load(serializedCampaign);

        assert.isDefined(newCampaign, 'performance campaign reload failed');

        if(newCampaign) {
            assert.deepEqual(newCampaign.getDTO(), originalCampaign.getDTO(), 'reloaded performance campaign data does not match original');
        }
    });

    it('should not reload broken comet campaign', () => {
        const originalCampaign: PerformanceCampaign = TestFixtures.getCampaign();

        let serializedCampaign = originalCampaign.toJSON();

        // intentionally make "id" field a number instead of string to test handling of broken campaigns
        const tmp = JSON.parse(serializedCampaign);
        tmp.id = 12345;
        serializedCampaign = JSON.stringify(tmp);

        const loader: CometCampaignLoader = new CometCampaignLoader();

        const newCampaign: PerformanceCampaign | undefined = loader.load(serializedCampaign);

        assert.isUndefined(newCampaign, 'broken performance campaign was reloaded instead of failing');
    });

    it('should not load broken json', () => {
        const loader: CometCampaignLoader = new CometCampaignLoader();

        const newCampaign: PerformanceCampaign | undefined = loader.load('test');

        assert.isUndefined(newCampaign, 'Comet campaign loader loaded broken JSON instead of failing');
    });
});
