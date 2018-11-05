import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { StorageOperation, IStorageBatch, IStorageCommand, StorageCommandType } from 'Core/Utilities/StorageOperation';
import { Observable0 } from 'Core/Utilities/Observable';

export class StorageBridge {
    public onPublicStorageWrite = new Observable0();
    public onPrivateStorageWrite = new Observable0();

    private _nativeBridge: NativeBridge;
    private _publicStorageQueue: IStorageBatch; // queue for storage operations to public storage
    private _privateStorageQueue: IStorageBatch; // queue for storage operations to private storage
    private _storageBatchTimer: number;

    private _storageBatchInterval: number = 1000; // default value is 1000 milliseconds

    constructor(nativeBridge: NativeBridge, interval?: number) {
        this._nativeBridge = nativeBridge;
        this._publicStorageQueue = {
            commands: []
        };
        this._privateStorageQueue = {
            commands: []
        };

        if(interval) {
            this._storageBatchInterval = interval;
        }
    }

    public queue(operation: StorageOperation) {
        const type = operation.getType();
        const batch = operation.getBatch();

        // empty batches are valid, just cleanly ignore them
        if(batch.commands.length === 0) {
            return;
        }

        if(type === StorageType.PUBLIC) {
            this._publicStorageQueue.commands = this._publicStorageQueue.commands.concat(batch.commands);
        } else {
            this._privateStorageQueue.commands = this._privateStorageQueue.commands.concat(batch.commands);
        }

        if(!this._storageBatchTimer) {
            this._storageBatchTimer = window.setTimeout(() => {
                this.executeBatch(StorageType.PUBLIC, this._publicStorageQueue);
                this.executeBatch(StorageType.PRIVATE, this._privateStorageQueue);
                delete this._storageBatchTimer;
            }, this._storageBatchInterval);
        }
    }

    public isEmpty(): boolean {
        return this._publicStorageQueue.commands.length === 0 && this._privateStorageQueue.commands.length === 0;
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
            this.onPublicStorageWrite.trigger();
        } else {
            this._privateStorageQueue = {
                commands: []
            };
            this.onPrivateStorageWrite.trigger();
        }
    }
}
