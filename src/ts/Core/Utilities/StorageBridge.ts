import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { StorageOperation, StorageBatch, StorageCommand, StorageCommandType } from 'Core/Utilities/StorageOperation';

export class StorageBridge {
    private static _storageBatchInterval = 1000; // milliseconds

    private _nativeBridge: NativeBridge;
    private _publicStorageQueue: StorageBatch; // queue for storage operations to public storage
    private _privateStorageQueue: StorageBatch; // queue for storage operations to private storage
    private _storageBatchTimer: any;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._publicStorageQueue.commands = [];
        this._privateStorageQueue.commands = [];
    }

    public queue(operation: StorageOperation) {
        const type = operation.getType();
        const batch = operation.getBatch();

        // empty batches are valid, just cleanly ignore them
        if(batch.commands.length === 0) {
            return;
        }

        if(type === StorageType.PUBLIC) {
            this._publicStorageQueue.commands.concat(batch.commands);
        } else {
            this._privateStorageQueue.commands.concat(batch.commands);
        }

        if(!this._storageBatchTimer) {
            this._storageBatchTimer = setTimeout(() => {
                this.executeBatch(StorageType.PUBLIC, this._publicStorageQueue);
                this.executeBatch(StorageType.PRIVATE, this._privateStorageQueue);
                delete this._storageBatchTimer;
            }, StorageBridge._storageBatchInterval);
        }
    }

    private executeBatch(type: StorageType, batch: StorageBatch) {
        if(batch.commands.length === 0) {
            return;
        }

        let operation: StorageCommand;
        for(operation of batch.commands) {
            if(operation.type === StorageCommandType.SET) {
                this._nativeBridge.Storage.set(type, operation.key, operation.value);
            } else if(operation.type === StorageCommandType.DELETE) {
                this._nativeBridge.Storage.delete(type, operation.key);
            }
        }

        this._nativeBridge.Storage.write(type);

        if(type === StorageType.PUBLIC) {
            this._publicStorageQueue.commands = [];
        } else {
            this._privateStorageQueue.commands = [];
        }
    }
}
