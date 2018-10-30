import { StorageType } from 'Core/Native/Storage';

export enum StorageCommandType {
    SET,
    DELETE
}

export interface IStorageCommand {
    type: StorageCommandType;
    key: string;
    value?: any;
}

export interface IStorageBatch {
    commands: IStorageCommand[];
}

export class StorageOperation {
    private _type: StorageType;
    private _batch: IStorageBatch;

    constructor(type: StorageType) {
        this._type = type;
        this._batch = {
            commands: []
        };
    }

    public set<T>(key: string, value:T) {
        this._batch.commands.push({
            type: StorageCommandType.SET,
            key: key,
            value: value
        });
    }

    public delete(key: string) {
        this._batch.commands.push({
            type: StorageCommandType.DELETE,
            key: key
        });
    }

    public getType(): StorageType {
        return this._type;
    }

    public getBatch(): IStorageBatch {
        return this._batch;
    }
}
