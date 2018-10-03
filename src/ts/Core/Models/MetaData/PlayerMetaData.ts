import { BaseMetaData, IMetaData } from 'Core/Models/MetaData/BaseMetaData';
import { StorageType } from 'Core/Native/Storage';
import { ICoreApi } from '../../Core';

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

    public fetch(core: ICoreApi, keys?: string[]): Promise<boolean> {
        return super.fetch(core, keys).then((exists) => {
            if (exists) {
                return core.Storage.delete(StorageType.PUBLIC, this.getCategory()).then(() => {
                    core.Storage.write(StorageType.PUBLIC);
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
