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
            adSession: TestFixtures.getSession()
        };

    });

    afterEach(() => {
        setStub.restore();
        writeStub.restore();
        getStub.restore();
        deleteStub.restore();
    });

    describe('createForceQuitKey', () => {
        it('should create and store the force quit key', () => {
            setStub.returns(Promise.resolve());
            writeStub.returns(Promise.resolve());
        return forceQuitManager.createForceQuitKey(forceQuitData).then(() => {
                sinon.assert.calledOnce(setStub);
                assert.equal(setStub.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(setStub.firstCall.args[1], ForceQuitKey);
                assert.deepEqual(setStub.firstCall.args[2], forceQuitData);
                sinon.assert.calledOnce(writeStub);
                assert.equal(writeStub.firstCall.args[0], StorageType.PRIVATE);
            });
        });
    });

    describe('getForceQuitData', () => {
        it('should get the force quit data', () => {
            getStub.returns(Promise.resolve(forceQuitData));
            return forceQuitManager.getForceQuitData().then((data) => {
                sinon.assert.calledOnce(getStub);
                assert.equal(getStub.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(getStub.firstCall.args[1], ForceQuitKey);
                assert.deepEqual(forceQuitData, data, 'Returned data did not equal the force quit data');
            });
        });

        it('should not contain force quit data', () => {
            getStub.returns(Promise.resolve(undefined));
            return forceQuitManager.getForceQuitData().then((data) => {
                sinon.assert.calledOnce(getStub);
                assert.equal(getStub.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(getStub.firstCall.args[1], ForceQuitKey);
                assert.isUndefined(data, 'Returned data was not undefined');
            });
        });

        it('should fail to get the force quit data', () => {
            getStub.returns(Promise.reject(undefined));
            return forceQuitManager.getForceQuitData().then((data) => {
                sinon.assert.calledOnce(getStub);
                assert.equal(getStub.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(getStub.firstCall.args[1], ForceQuitKey);
                assert.isUndefined(data, 'Returned force quit data was not undefined');
            });
        });
    });

    describe('destroyForceQuitKey', () => {
        it('should delete the force quit key', () => {
            deleteStub.returns(Promise.resolve(true));
            return forceQuitManager.destroyForceQuitKey().then((res) => {
                sinon.assert.calledOnce(deleteStub);
                assert.equal(deleteStub.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(deleteStub.firstCall.args[1], ForceQuitKey);
                assert.isTrue(res, 'Return value did not equal true');
            });
        });

        it('should fail to delete the force quit key', () => {
            deleteStub.returns(Promise.reject(undefined));
            return forceQuitManager.destroyForceQuitKey().then((res) => {
                sinon.assert.calledOnce(deleteStub);
                assert.equal(deleteStub.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(deleteStub.firstCall.args[1], ForceQuitKey);
                assert.isFalse(res, 'Return value was not false');
            });
        });
    });
});
