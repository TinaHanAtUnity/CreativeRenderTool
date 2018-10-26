import { assert } from 'chai';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MraidLoader } from 'MRAID/Parsers/MraidLoader';

import { TestFixtures } from 'TestHelpers/TestFixtures';

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
