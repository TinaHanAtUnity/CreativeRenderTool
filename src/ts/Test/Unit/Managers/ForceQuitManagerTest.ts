import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { ForceQuitManager, IForceQuitData } from 'Managers/ForceQuitManager';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';

describe('ForceQuitManagerTest', () => {

    const ForceQuitKey = 'ad.forcequit';
    let nativeBridge: NativeBridge;
    let forceQuitData: IForceQuitData;
    let forceQuitManager: ForceQuitManager;
    let setSpy: sinon.SinonStub;
    let writeSpy: sinon.SinonStub;
    let getSpy: sinon.SinonStub;
    let deleteSpy: sinon.SinonStub;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        forceQuitManager = new ForceQuitManager(nativeBridge);
        setSpy = sinon.stub(nativeBridge.Storage, 'set');
        writeSpy = sinon.stub(nativeBridge.Storage, 'write');
        getSpy = sinon.stub(nativeBridge.Storage, 'get');
        deleteSpy = sinon.stub(nativeBridge.Storage, 'delete');
        forceQuitData = {
            adSession: TestFixtures.getSession()
        };

    });

    afterEach(() => {
        setSpy.restore();
        writeSpy.restore();
        getSpy.restore();
        deleteSpy.restore();
    });

    describe('createForceQuitKey', () => {
        it('should create and store the force quit key', () => {
            setSpy.returns(Promise.resolve());
            writeSpy.returns(Promise.resolve());
        return forceQuitManager.createForceQuitKey(forceQuitData).then(() => {
                sinon.assert.calledOnce(setSpy);
                assert.equal(setSpy.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(setSpy.firstCall.args[1], ForceQuitKey);
                assert.deepEqual(setSpy.firstCall.args[2], forceQuitData);
                sinon.assert.calledOnce(writeSpy);
                assert.equal(writeSpy.firstCall.args[0], StorageType.PRIVATE);
            });
        });
    });

    describe('hasForceQuit', () => {
        it('should contain the force quit key', () => {
            getSpy.returns(Promise.resolve(forceQuitData));
            return forceQuitManager.hasForceQuit().then((res) => {
                sinon.assert.calledOnce(getSpy);
                assert.equal(getSpy.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(getSpy.firstCall.args[1], ForceQuitKey);
                assert.isTrue(res, 'Force quit key return value came back false');
            });
        });

        it('should not contain the force quit key', () => {
            getSpy.returns(Promise.resolve(undefined));
            return forceQuitManager.hasForceQuit().then((res) => {
                sinon.assert.calledOnce(getSpy);
                assert.equal(getSpy.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(getSpy.firstCall.args[1], ForceQuitKey);
                assert.isFalse(res, 'Force quit key return value came back true');
            });
        });

        it('should resolve to false due to storage throwing an error', () => {
            getSpy.returns(Promise.reject(undefined));
            return forceQuitManager.hasForceQuit().then((res) => {
                sinon.assert.calledOnce(getSpy);
                assert.equal(getSpy.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(getSpy.firstCall.args[1], ForceQuitKey);
                assert.isFalse(res, 'Force quit key return value came back true');
            });
        });
    });

    describe('getForceQuitData', () => {
        it('should get the force quit data', () => {
            getSpy.returns(Promise.resolve(forceQuitData));
            return forceQuitManager.getForceQuitData().then((data) => {
                sinon.assert.calledOnce(getSpy);
                assert.equal(getSpy.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(getSpy.firstCall.args[1], ForceQuitKey);
                assert.equal(forceQuitData, data, 'Returned data did not equal the force quit data');
            });
        });

        it('should fail to get the force quit data', () => {
            getSpy.returns(Promise.reject(undefined));
            return forceQuitManager.getForceQuitData().then((data) => {
                sinon.assert.calledOnce(getSpy);
                assert.equal(getSpy.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(getSpy.firstCall.args[1], ForceQuitKey);
                assert.isUndefined(data, 'Returned force quit data was not undefined');
            });
        });
    });

    describe('destroyForceQuitKey', () => {
        it('should delete the force quit key', () => {
            deleteSpy.returns(Promise.resolve(true));
            return forceQuitManager.destroyForceQuitKey().then((res) => {
                sinon.assert.calledOnce(deleteSpy);
                assert.equal(deleteSpy.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(deleteSpy.firstCall.args[1], ForceQuitKey);
                assert.isTrue(res, 'Return value did not equal true');
            });
        });

        it('should fail to delete the force quit key', () => {
            deleteSpy.returns(Promise.reject(undefined));
            return forceQuitManager.destroyForceQuitKey().then((res) => {
                sinon.assert.calledOnce(deleteSpy);
                assert.equal(deleteSpy.firstCall.args[0], StorageType.PRIVATE);
                assert.equal(deleteSpy.firstCall.args[1], ForceQuitKey);
                assert.isFalse(res, 'Return value was not false');
            });
        });
    });
});
