import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Placement } from 'Ads/Models/Placement';
import { StorageType } from 'Core/Native/Storage';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

describe('BackupCampaignManagerTest', () => {
    it('should store placement data', () => {
        const setSpy = sinon.spy();
        const writeSpy = sinon.spy();

        const nativeBridge: NativeBridge = <NativeBridge><any>{
            Storage: {
                set: setSpy,
                write: writeSpy
            }
        };

        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(nativeBridge, TestFixtures.getConfiguration());
        const placement: Placement = TestFixtures.getPlacement();
        const testMediaId: string = '12345';

        backupCampaignManager.storePlacement(placement, testMediaId);

        assert.equal(setSpy.callCount, 2, 'two values were not written for backup campaign placement data');
        assert.equal(writeSpy.callCount, 1, 'storage was not written to device storage after setting values');

        assert.equal(setSpy.getCall(0).args[0], StorageType.PRIVATE, 'data was not written to private storage');
        assert.equal(setSpy.getCall(0).args[1], 'backupcampaign.placement.' + placement.getId() + '.mediaid', 'incorrect key for mediaId');
        assert.equal(setSpy.getCall(0).args[2], testMediaId, 'incorrect mediaId');

        assert.equal(setSpy.getCall(1).args[0], StorageType.PRIVATE, 'data was not written to private storage');
        assert.equal(setSpy.getCall(1).args[1], 'backupcampaign.placement.' + placement.getId() + '.adtypes', 'incorrect key for adtypes');
        assert.equal(setSpy.getCall(1).args[2], '["TEST"]', 'incorrect adtype serialization');

        assert.equal(writeSpy.getCall(0).args[0], StorageType.PRIVATE, 'data was not written to private storage');
    });

    it('should store performance campaign data', () => {
        const setSpy = sinon.spy();
        const writeSpy = sinon.spy();

        const nativeBridge: NativeBridge = <NativeBridge><any>{
            Storage: {
                set: setSpy,
                write: writeSpy
            }
        };

        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(nativeBridge, TestFixtures.getConfiguration());

        const campaign: PerformanceCampaign = TestFixtures.getCampaign();
        const testMediaId: string = 'beefcace-abcdefg-deadbeef';

        backupCampaignManager.storeCampaign(campaign);

        assert.equal(setSpy.callCount, 3);
        assert.equal(writeSpy.callCount, 1);

        assert.equal(setSpy.getCall(0).args[0], StorageType.PRIVATE, 'data was not written to private storage');
        assert.equal(setSpy.getCall(0).args[1], 'backupcampaign.campaign.' + testMediaId + '.type', 'incorrect key for campaign type');
        assert.equal(setSpy.getCall(0).args[2], 'performance', 'incorrect name for performance campaign');

        assert.equal(setSpy.getCall(1).args[0], StorageType.PRIVATE, 'data was not written to private storage');
        assert.equal(setSpy.getCall(1).args[1], 'backupcampaign.campaign.' + testMediaId + '.data', 'incorrect key for campaign data');
        assert.equal(setSpy.getCall(1).args[2], campaign.toJSON(), 'incorrect data serialization for performance campaign');

        assert.equal(setSpy.getCall(2).args[0], StorageType.PRIVATE, 'data was not written to private storage');
        assert.equal(setSpy.getCall(2).args[1], 'backupcampaign.campaign.' + testMediaId + '.willexpireat', 'incorrect key for campaign type');
        assert.isTrue(setSpy.getCall(2).args[2] > Date.now() + 6 * 24 * 3600 * 1000, 'performance campaign expiry less than 6 days in the future');
        assert.isTrue(setSpy.getCall(2).args[2] < Date.now() + 8 * 24 * 3600 * 1000, 'performance campaign expiry more than 8 days in the future');

        assert.equal(writeSpy.getCall(0).args[0], StorageType.PRIVATE, 'data was not written to private storage');
    });

    it('should not store placement data when test mode is active', () => {
        const setSpy = sinon.spy();
        const writeSpy = sinon.spy();

        const nativeBridge: NativeBridge = <NativeBridge><any>{
            Storage: {
                set: setSpy,
                write: writeSpy
            }
        };

        const configuration = TestFixtures.getConfiguration();
        sinon.stub(configuration, 'getTestMode').returns(true);
        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(nativeBridge, configuration);
        const placement: Placement = TestFixtures.getPlacement();
        const testMediaId: string = '12345';

        backupCampaignManager.storePlacement(placement, testMediaId);

        assert.equal(setSpy.callCount, 0, 'placement data was set to storage when test mode is active');
        assert.equal(writeSpy.callCount, 0, 'placement data was written to storage when test mode is active');
    });

    it('should not store campaign data when test mode is active', () => {
        const setSpy = sinon.spy();
        const writeSpy = sinon.spy();

        const nativeBridge: NativeBridge = <NativeBridge><any>{
            Storage: {
                set: setSpy,
                write: writeSpy
            }
        };

        const configuration = TestFixtures.getConfiguration();
        sinon.stub(configuration, 'getTestMode').returns(true);
        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(nativeBridge, configuration);
        const campaign: PerformanceCampaign = TestFixtures.getCampaign();

        backupCampaignManager.storeCampaign(campaign);

        assert.equal(setSpy.callCount, 0, 'campaign data was set to storage when test mode is active');
        assert.equal(writeSpy.callCount, 0, 'campaign data was written to storage when test mode is active');
    });

    it('should not load campaigns when test mode is active', () => {
        const configuration = TestFixtures.getConfiguration();
        sinon.stub(configuration, 'getTestMode').returns(true);
        const backupCampaignManager: BackupCampaignManager = new BackupCampaignManager(TestFixtures.getNativeBridge(), configuration);

        return backupCampaignManager.loadCampaign(TestFixtures.getPlacement()).then(campaign => {
            assert.isUndefined(campaign, 'campaign was loaded when test mode is active');
        });
    });
});
