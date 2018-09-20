import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Placement } from 'Ads/Models/Placement';
import { StorageType } from 'Core/Native/Storage';

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
});
