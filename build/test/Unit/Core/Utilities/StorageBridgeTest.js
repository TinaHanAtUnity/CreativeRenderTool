import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { StorageType } from 'Core/Native/Storage';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { StorageOperation } from 'Core/Utilities/StorageOperation';
import 'mocha';
import * as sinon from 'sinon';
import { StorageBridgeHelper } from 'TestHelpers/StorageBridgeHelper';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('StorageBridgeTest', () => {
    let backend;
    let nativeBridge;
    let core;
    let storageBridge;
    let storageSetSpy;
    let storageDeleteSpy;
    let storageWriteSpy;
    beforeEach(() => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        storageSetSpy = sinon.spy(core.Storage, 'set');
        storageDeleteSpy = sinon.spy(core.Storage, 'delete');
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
        const testKey = 'testKey';
        const testValue = 'testValue';
        const storagePromise = StorageBridgeHelper.waitForPublicStorageBatch(storageBridge);
        const operation = new StorageOperation(StorageType.PUBLIC);
        operation.set(testKey, testValue);
        storageBridge.queue(operation);
        return storagePromise.then(() => {
            assert.isTrue(storageSetSpy.calledOnceWithExactly(StorageType.PUBLIC, testKey, testValue), 'storage set to public storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PUBLIC), 'storage write to public storage was not executed properly');
        });
    });
    it('should execute one delete to public storage', () => {
        const testKey = 'testKey';
        const storagePromise = StorageBridgeHelper.waitForPublicStorageBatch(storageBridge);
        const operation = new StorageOperation(StorageType.PUBLIC);
        operation.delete(testKey);
        storageBridge.queue(operation);
        return storagePromise.then(() => {
            assert.isTrue(storageDeleteSpy.calledOnceWithExactly(StorageType.PUBLIC, testKey), 'storage delete to public storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PUBLIC), 'storage write to public storage was not executed properly');
        });
    });
    it('should execute one set to private storage', () => {
        const testKey = 'testKey';
        const testValue = 'testValue';
        const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.set(testKey, testValue);
        storageBridge.queue(operation);
        return storagePromise.then(() => {
            assert.isTrue(storageSetSpy.calledOnceWithExactly(StorageType.PRIVATE, testKey, testValue), 'storage set to private storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PRIVATE), 'storage write to private storage was not executed properly');
        });
    });
    it('should execute one delete to private storage', () => {
        const testKey = 'testKey';
        const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.delete(testKey);
        storageBridge.queue(operation);
        return storagePromise.then(() => {
            assert.isTrue(storageDeleteSpy.calledOnceWithExactly(StorageType.PRIVATE, testKey), 'storage delete to private storage was not executed properly');
            assert.isTrue(storageWriteSpy.calledOnceWithExactly(StorageType.PRIVATE), 'storage write to private storage was not executed properly');
        });
    });
    it('should execute multiple operations to public storage', () => {
        const setKeyOne = 'setKeyOne';
        const setValueOne = 'setValueOne';
        const setKeyTwo = 'setKeyTwo';
        const setValueTwo = 'setValueTwo';
        const deleteKey = 'deleteKey';
        const storagePromise = StorageBridgeHelper.waitForPublicStorageBatch(storageBridge);
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
        const setKeyOne = 'setKeyOne';
        const setValueOne = 'setValueOne';
        const setKeyTwo = 'setKeyTwo';
        const setValueTwo = 'setValueTwo';
        const deleteKey = 'deleteKey';
        const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
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
        const setKey = 'setKey';
        const setValue = 'setValue';
        const deleteKey = 'deleteKey';
        const publicStoragePromise = StorageBridgeHelper.waitForPublicStorageBatch(storageBridge);
        const privateStoragePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmFnZUJyaWRnZVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9VdGlsaXRpZXMvU3RvcmFnZUJyaWRnZVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxRQUFRLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO0lBQy9CLElBQUksT0FBZ0IsQ0FBQztJQUNyQixJQUFJLFlBQTBCLENBQUM7SUFDL0IsSUFBSSxJQUFjLENBQUM7SUFDbkIsSUFBSSxhQUE0QixDQUFDO0lBQ2pDLElBQUksYUFBa0IsQ0FBQztJQUN2QixJQUFJLGdCQUFxQixDQUFDO0lBQzFCLElBQUksZUFBb0IsQ0FBQztJQUV6QixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkUsSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMs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