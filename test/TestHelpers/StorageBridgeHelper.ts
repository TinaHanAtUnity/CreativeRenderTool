import { StorageBridge } from 'Core/Utilities/StorageBridge';

export class StorageBridgeHelper {
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
