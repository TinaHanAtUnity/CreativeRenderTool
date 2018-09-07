import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

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
});
