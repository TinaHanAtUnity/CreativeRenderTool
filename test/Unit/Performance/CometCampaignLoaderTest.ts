import { assert } from 'chai';
import 'mocha';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { CometCampaignLoader } from 'Performance/Parsers/CometCampaignLoader';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Session } from 'Ads/Models/Session';
import { PrivacyMethod } from 'Ads/Models/Privacy';

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

    it('should reload campaign with privacy', () => {
        const expectedPrivacy = {
            method: PrivacyMethod.UNITY_CONSENT,
            firstRequest: false,
            permissions: { ads: true, gameExp: true, external: true }
        };
        const session: Session = new Session('expected_session_id');
        session.setPrivacy(expectedPrivacy);

        const originalCampaign: PerformanceCampaign = TestFixtures.getCampaign(session);

        const serializedCampaign = originalCampaign.toJSON();

        const loader: CometCampaignLoader = new CometCampaignLoader();

        const newCampaign: PerformanceCampaign | undefined = loader.load(serializedCampaign);

        assert.isDefined(newCampaign, 'performance campaign reload failed');
        const actualSession = newCampaign!.getSession();
        assert.equal(actualSession.getId(), 'expected_session_id');
        assert.deepEqual(actualSession.getPrivacy(), expectedPrivacy);
    });

    it('should reload comet campaign with square end screen asset', () => {
        const originalCampaign: PerformanceCampaign = TestFixtures.getCampaignWithSquareEndScreenAsset();

        const serializedCampaign = originalCampaign.toJSON();

        const loader: CometCampaignLoader = new CometCampaignLoader();

        const newCampaign: PerformanceCampaign | undefined = loader.load(serializedCampaign);

        assert.isDefined(newCampaign, 'performance campaign with square asset reload failed');

        if(newCampaign) {
            assert.deepEqual(newCampaign.getDTO(), originalCampaign.getDTO(), 'reloaded performance campaign data does not match original');
            assert.isDefined(newCampaign.getSquare(), 'square asset reload failed');
            if(newCampaign.getSquare() && originalCampaign.getSquare()) {
                assert.deepEqual(newCampaign.getSquare()!.getDTO(), originalCampaign.getSquare()!.getDTO(), 'reloaded square asset does not match original');
            }
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
