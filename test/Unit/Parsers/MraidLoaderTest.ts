import 'mocha';
import { assert } from 'chai';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MraidLoader } from 'MRAID/Parsers/MraidLoader';
import { CometCampaignLoader } from 'src/ts/Performance/Parsers/CometCampaignLoader';
import { PerformanceCampaign } from 'src/ts/Performance/Models/PerformanceCampaign';

describe('MraidLoaderTest', () => {
    it('should reload playable MRAID campaign', () => {
        const originalCampaign: MRAIDCampaign = TestFixtures.getPlayableMRAIDCampaign();

        const serializedCampaign = originalCampaign.toJSON();

        const loader: MraidLoader = new MraidLoader();

        const newCampaign: MRAIDCampaign | undefined = loader.load(serializedCampaign);

        assert.isDefined(newCampaign, 'playable MRAID campaign reload failed');

        if(newCampaign) {
            assert.deepEqual(newCampaign.getDTO(), originalCampaign.getDTO(), 'reloaded playable MRAID campaign data does not match original');
        }
    });

    it('should reload programmatic MRAID campaign', () => {
        const originalCampaign: MRAIDCampaign = TestFixtures.getProgrammaticMRAIDCampaign();

        const serializedCampaign = originalCampaign.toJSON();

        const loader: MraidLoader = new MraidLoader();

        const newCampaign: MRAIDCampaign | undefined = loader.load(serializedCampaign);

        assert.isDefined(newCampaign, 'programmatic MRAID campaign reload failed');

        if(newCampaign) {
            assert.deepEqual(newCampaign.getDTO(), originalCampaign.getDTO(), 'reloaded programmatic MRAID campaign data does not match original');
        }
    });

    it('should not load broken json', () => {
        const loader: MraidLoader = new MraidLoader();

        const newCampaign: MRAIDCampaign | undefined = loader.load('test');

        assert.isUndefined(newCampaign, 'MRAID campaign loader loaded broken JSON instead of failing');
    });
});
