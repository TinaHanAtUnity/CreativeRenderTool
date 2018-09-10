import { BaseMetaData, IMetaData } from 'Core/Models/MetaData/BaseMetaData';
import { StorageApi, StorageType } from 'Core/Native/Storage';

interface IPlayerMetaData extends IMetaData {
    server_id: string;
}

export class PlayerMetaData extends BaseMetaData<IPlayerMetaData> {

    constructor() {
        super('PlayerMetaData', {
            ... BaseMetaData.Schema,
            server_id: ['string']
        });

        this.set('keys', ['server_id']);
        this.set('category', 'player');
    }

    public fetch(storage: StorageApi, keys?: string[]): Promise<boolean> {
        return super.fetch(storage, keys).then((exists) => {
            if (exists) {
                return storage.delete(StorageType.PUBLIC, this.getCategory()).then(() => {
                    storage.write(StorageType.PUBLIC);
                    return true;
                });
            } else {
                return Promise.resolve(false);
            }
        });
    }

    public getServerId(): string {
        return this.get('server_id');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'sid': this.getServerId()
        };
    }
}
