import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { StorageOperation, IStorageBatch, IStorageCommand, StorageCommandType } from 'Core/Utilities/StorageOperation';

export class StorageBridge {
    private static _storageBatchInterval = 1000; // milliseconds

    private _nativeBridge: NativeBridge;
    private _publicStorageQueue: IStorageBatch; // queue for storage operations to public storage
    private _privateStorageQueue: IStorageBatch; // queue for storage operations to private storage
    private _storageBatchTimer: any;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._publicStorageQueue = {
            commands: []
        };
        this._privateStorageQueue = {
            commands: []
        };
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

    private executeBatch(type: StorageType, batch: IStorageBatch) {
        if(batch.commands.length === 0) {
            return;
        }

        let command: IStorageCommand;
        for(command of batch.commands) {
            if(command.type === StorageCommandType.SET) {
                this._nativeBridge.Storage.set(type, command.key, command.value);
            } else if(command.type === StorageCommandType.DELETE) {
                this._nativeBridge.Storage.delete(type, command.key);
            }
        }

        this._nativeBridge.Storage.write(type);

        if(type === StorageType.PUBLIC) {
            this._publicStorageQueue = {
                commands: []
            };
        } else {
            this._privateStorageQueue = {
                commands: []
            };
        }
    }
}
