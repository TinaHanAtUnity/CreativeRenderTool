import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { ForceQuitManager, IForceQuitData } from 'Managers/ForceQuitManager';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';

describe('ForceQuitManagerTest', () => {

    const ForceQuitKey = 'ForceQuitManager.ForceQuitKey';
    let nativeBridge: NativeBridge;
    let forceQuitData: IForceQuitData;
    let forceQuitManager: ForceQuitManager;
    let setStub: sinon.SinonStub;
    let writeStub: sinon.SinonStub;
    let getStub: sinon.SinonStub;
    let deleteStub: sinon.SinonStub;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        forceQuitManager = new ForceQuitManager(nativeBridge);
        setStub = sinon.stub(nativeBridge.Storage, 'set');
        writeStub = sinon.stub(nativeBridge.Storage, 'write');
        getStub = sinon.stub(nativeBridge.Storage, 'get');
        deleteStub = sinon.stub(nativeBridge.Storage, 'delete');
        forceQuitData = {
            campaignId: TestFixtures.getCampaign().getId(),
            creativeId: TestFixtures.getCampaign().getCreativeId(),
            adType: 'ad'
        };

    });

    describe('createForceQuitKey', () => {
        it('should create and store the force quit key', () => {
            setStub.resolves();
            writeStub.resolves();
            return forceQuitManager.createForceQuitKey(forceQuitData).then(() => {
                sinon.assert.calledOnce(setStub);
                sinon.assert.calledWith(setStub, StorageType.PRIVATE, ForceQuitKey, forceQuitData);
                sinon.assert.calledOnce(writeStub);
                sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
            });
        });
    });

    describe('getForceQuitData', () => {
        it('should get the force quit data', () => {
            getStub.resolves(forceQuitData);
            return forceQuitManager.getForceQuitData().then((data) => {
                sinon.assert.calledOnce(getStub);
                sinon.assert.calledWith(getStub, StorageType.PRIVATE, ForceQuitKey);
                if (data) {
                    assert.equal(forceQuitData.campaignId, data.campaignId, 'Returned data did not equal the force quit data');
                    assert.equal(forceQuitData.creativeId, data.creativeId, 'Returned data did not equal the force quit data');
                    assert.equal(forceQuitData.adType, data.adType, 'Returned data did not equal the force quit data');
                } else {
                    assert.fail();
                }
            });
        });

        it('should not contain force quit data', () => {
            getStub.resolves(undefined);
            return forceQuitManager.getForceQuitData().then((data) => {
                sinon.assert.calledOnce(getStub);
                sinon.assert.calledWith(getStub, StorageType.PRIVATE, ForceQuitKey);
                assert.isUndefined(data, 'Returned data was not undefined');
            });
        });

        it('should fail to get the force quit data', () => {
            getStub.rejects(undefined);
            return forceQuitManager.getForceQuitData().then((data) => {
                sinon.assert.calledOnce(getStub);
                sinon.assert.calledWith(getStub, StorageType.PRIVATE, ForceQuitKey);
                assert.isUndefined(data, 'Returned force quit data was not undefined');
            });
        });
    });

    describe('destroyForceQuitKey', () => {
        it('should delete the force quit key', () => {
            deleteStub.resolves();
            writeStub.resolves();
            return forceQuitManager.destroyForceQuitKey().then((res) => {
                sinon.assert.calledOnce(deleteStub);
                sinon.assert.calledWith(deleteStub, StorageType.PRIVATE, ForceQuitKey);
                sinon.assert.calledOnce(writeStub);
                sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
                assert.isTrue(res, 'Return value did not equal true');
            });
        });

        it('should return false if deleting the force quit key fails', () => {
            deleteStub.rejects();
            return forceQuitManager.destroyForceQuitKey().then((res) => {
                sinon.assert.calledOnce(deleteStub);
                sinon.assert.calledWith(deleteStub, StorageType.PRIVATE, ForceQuitKey);
                sinon.assert.notCalled(writeStub);
                assert.isFalse(res, 'Return value was not false');
            });
        });

        it('should return false if committing the force quit key delete fails', () => {
            deleteStub.resolves();
            writeStub.rejects();
            return forceQuitManager.destroyForceQuitKey().then((res) => {
                sinon.assert.calledOnce(deleteStub);
                sinon.assert.calledWith(deleteStub, StorageType.PRIVATE, ForceQuitKey);
                sinon.assert.calledOnce(writeStub);
                sinon.assert.calledWith(writeStub, StorageType.PRIVATE);
                assert.isFalse(res, 'Return value was not false');
            });
        });
    });
});
