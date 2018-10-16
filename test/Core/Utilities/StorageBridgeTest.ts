import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { StorageType } from 'Core/Native/Storage';
import { StorageOperation } from 'Core/Utilities/StorageOperation';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Platform } from '../../../src/ts/Core/Constants/Platform';
import { Backend } from '../../../src/ts/Backend/Backend';
import { ICoreApi } from '../../../src/ts/Core/Core';

class TestHelper {
    public static waitForPublicStorageBatch(storageBridge: StorageBridge): Promise<void> {
        return new Promise((resolve, reject) => {
            const storageObserver = () => {
                storageBridge.onPublicStorageWrite.unsubscribe(storageObserver);
                resolve();
            };
            storageBridge.onPublicStorageWrite.subscribe(storageObserver);
        });
    }

    public static waitForPrivateStorageBatch(storageBridge: StorageBridge): Promise<void> {
        return new Promise((resolve, reject) => {
            const storageObserver = () => {
                storageBridge.onPrivateStorageWrite.unsubscribe(storageObserver);
                resolve();
            };
            storageBridge.onPrivateStorageWrite.subscribe(storageObserver);
        });
    }
}

describe('StorageBridgeTest', () => {
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let storageBridge: StorageBridge;
    let storageSetSpy: any;
    let storageDeleteSpy: any;
    let storageWriteSpy: any;

    beforeEach(() => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        storageSetSpy = sinon.spy(core.Storage, 'set');
        storageDeleteSpy = sinon.spy(core.Storage,'delete');
        storageWriteSpy = sinon.spy(core.Storage, 'write');
        storageBridge = new StorageBridge(core, 1);
    });

    it('should ignore empty public storate batch operation', () => {
        const operation = new StorageOperation(StorageType.PUBLIC);
        storageBridge.queue(operation);
        assert.isTrue(storageBridge.isEmpty(), 'StorageBridge was not empty after adding empty public storage batch operation');
    });

    it('should ignore empty private storage batch operation', () => {
        const operation = new StorageOperation(StorageType.PRIVATE);
        storageBridge.queue(operation);
        assert.isTrue(storageBridge.isEmpty(), 'StorageBridge was not empty after adding empty private storage operation');
    });

    it('should execute one set to public storage', () => {
        const testKey: string = 'testKey';
        const testValue: string = 'testValue';

        const storagePromise = TestHelper.waitForPublicStorageBatch(storageBridge);

        const operation = new StorageOperation(StorageType.PUBLIC);
        operation.set(testKey, testValue);
        storageBridge.queue(operation);

        return storagePromise.then(() => {
            assert.isTrue(storageSetSpy.calledOnceWithExactly(StorageType.PUBLIC, testKey, testValue), 'storage set to public storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PUBLIC), 'storage write to public storage was not executed properly');
        });
    });

    it('should execute one delete to public storage', () => {
        const testKey: string = 'testKey';

        const storagePromise = TestHelper.waitForPublicStorageBatch(storageBridge);

        const operation = new StorageOperation(StorageType.PUBLIC);
        operation.delete(testKey);
        storageBridge.queue(operation);

        return storagePromise.then(() => {
            assert.isTrue(storageDeleteSpy.calledOnceWithExactly(StorageType.PUBLIC, testKey), 'storage delete to public storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PUBLIC), 'storage write to public storage was not executed properly');
        });
    });

    it('should execute one set to private storage', () => {
        const testKey: string = 'testKey';
        const testValue: string = 'testValue';

        const storagePromise = TestHelper.waitForPrivateStorageBatch(storageBridge);

        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.set(testKey, testValue);
        storageBridge.queue(operation);

        return storagePromise.then(() => {
            assert.isTrue(storageSetSpy.calledOnceWithExactly(StorageType.PRIVATE, testKey, testValue), 'storage set to private storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PRIVATE), 'storage write to private storage was not executed properly');
        });
    });

    it('should execute one delete to private storage', () => {
        const testKey: string = 'testKey';

        const storagePromise = TestHelper.waitForPrivateStorageBatch(storageBridge);

        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.delete(testKey);
        storageBridge.queue(operation);

        return storagePromise.then(() => {
            assert.isTrue(storageDeleteSpy.calledOnceWithExactly(StorageType.PRIVATE, testKey), 'storage delete to private storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PRIVATE), 'storage write to private storage was not executed properly');
        });
    });

    it('should execute multiple operations to public storage', () => {
        const setKeyOne: string = 'setKeyOne';
        const setValueOne: string = 'setValueOne';
        const setKeyTwo: string = 'setKeyTwo';
        const setValueTwo: string = 'setValueTwo';
        const deleteKey: string = 'deleteKey';

        const storagePromise = TestHelper.waitForPublicStorageBatch(storageBridge);

        const setOperation = new StorageOperation(StorageType.PUBLIC);
        setOperation.set(setKeyOne, setValueOne);
        setOperation.set(setKeyTwo, setValueTwo);
        storageBridge.queue(setOperation);

        const deleteOperation = new StorageOperation(StorageType.PUBLIC);
        deleteOperation.delete(deleteKey);
        storageBridge.queue(deleteOperation);

        return storagePromise.then(() => {
            assert.deepStrictEqual(storageSetSpy.getCall(0).args, [StorageType.PUBLIC, setKeyOne, setValueOne], 'first storage set to public storage was not executed properly');
            assert.deepStrictEqual(storageSetSpy.getCall(1).args, [StorageType.PUBLIC, setKeyTwo, setValueTwo], 'second storage set to public storage was not executed properly');
            assert.isTrue(storageDeleteSpy.calledOnceWithExactly(StorageType.PUBLIC, deleteKey), 'final storage delete to public storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PUBLIC), 'storage write to public storage was not executed properly');
        });
    });

    it('should execute multiple operations to private storage', () => {
        const setKeyOne: string = 'setKeyOne';
        const setValueOne: string = 'setValueOne';
        const setKeyTwo: string = 'setKeyTwo';
        const setValueTwo: string = 'setValueTwo';
        const deleteKey: string = 'deleteKey';

        const storagePromise = TestHelper.waitForPrivateStorageBatch(storageBridge);

        const setOperation = new StorageOperation(StorageType.PRIVATE);
        setOperation.set(setKeyOne, setValueOne);
        setOperation.set(setKeyTwo, setValueTwo);
        storageBridge.queue(setOperation);

        const deleteOperation = new StorageOperation(StorageType.PRIVATE);
        deleteOperation.delete(deleteKey);
        storageBridge.queue(deleteOperation);

        return storagePromise.then(() => {
            assert.deepStrictEqual(storageSetSpy.getCall(0).args, [StorageType.PRIVATE, setKeyOne, setValueOne], 'first storage set to private storage was not executed properly');
            assert.deepStrictEqual(storageSetSpy.getCall(1).args, [StorageType.PRIVATE, setKeyTwo, setValueTwo], 'second storage set to private storage was not executed properly');
            assert.isTrue(storageDeleteSpy.calledOnceWithExactly(StorageType.PRIVATE, deleteKey), 'final storage delete to private storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PRIVATE), 'storage write to private storage was not executed properly');
        });
    });

    it('should execute operations to private and public storages', () => {
        const setKey: string = 'setKey';
        const setValue: string = 'setValue';
        const deleteKey: string = 'deleteKey';

        const publicStoragePromise = TestHelper.waitForPublicStorageBatch(storageBridge);
        const privateStoragePromise = TestHelper.waitForPrivateStorageBatch(storageBridge);

        const privateOperation = new StorageOperation(StorageType.PRIVATE);
        privateOperation.set(setKey, setValue);
        storageBridge.queue(privateOperation);

        const publicOperation = new StorageOperation(StorageType.PUBLIC);
        publicOperation.delete(deleteKey);
        storageBridge.queue(publicOperation);

        return Promise.all([publicStoragePromise, privateStoragePromise]).then(() => {
            assert.isTrue(storageSetSpy.calledOnceWithExactly(StorageType.PRIVATE, setKey, setValue), 'storage set to private storage was not executed properly');
            assert.isTrue(storageDeleteSpy.calledOnceWithExactly(StorageType.PUBLIC, deleteKey), 'storage delete to public storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledWithExactly(StorageType.PUBLIC), 'storage write to public storage was not executed when writing both storages');
            assert.isTrue(storageWriteSpy.calledWithExactly(StorageType.PRIVATE), 'storage write to private storage was not executed when writing both storages');
        });
    });
});
