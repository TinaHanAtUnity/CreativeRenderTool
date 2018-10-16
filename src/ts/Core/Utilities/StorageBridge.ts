import { StorageType } from 'Core/Native/Storage';
import { IStorageBatch, IStorageCommand, StorageCommandType, StorageOperation } from 'Core/Utilities/StorageOperation';
import { Observable0 } from 'Core/Utilities/Observable';
import { ICoreApi } from '../ICore';

export class StorageBridge {
    public onPublicStorageWrite = new Observable0();
    public onPrivateStorageWrite = new Observable0();

    private _core: ICoreApi;
    private _publicStorageQueue: IStorageBatch; // queue for storage operations to public storage
    private _privateStorageQueue: IStorageBatch; // queue for storage operations to private storage
    private _storageBatchTimer: number;

    private _storageBatchInterval: number = 1000; // default value is 1000 milliseconds

    constructor(core: ICoreApi, interval?: number) {
        this._core = core;
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
                this._core.Storage.set(type, command.key, command.value);
            } else if(command.type === StorageCommandType.DELETE) {
                this._core.Storage.delete(type, command.key);
            }
        }

        this._core.Storage.write(type);

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
