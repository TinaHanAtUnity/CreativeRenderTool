import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { ForceQuitManager, IForceQuitData } from 'Managers/ForceQuitManager';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from 'Helpers/TestFixtures';

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
            adSession: TestFixtures.getSession()
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
                assert.deepEqual(forceQuitData, data, 'Returned data did not equal the force quit data');
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
            deleteStub.resolves(true);
            return forceQuitManager.destroyForceQuitKey().then((res) => {
                sinon.assert.calledOnce(deleteStub);
                sinon.assert.calledWith(deleteStub, StorageType.PRIVATE, ForceQuitKey);
                assert.isTrue(res, 'Return value did not equal true');
            });
        });

        it('should fail to delete the force quit key', () => {
            deleteStub.rejects(undefined);
            return forceQuitManager.destroyForceQuitKey().then((res) => {
                sinon.assert.calledOnce(deleteStub);
                sinon.assert.calledWith(deleteStub, StorageType.PRIVATE, ForceQuitKey);
                assert.isFalse(res, 'Return value was not false');
            });
        });
    });
});
