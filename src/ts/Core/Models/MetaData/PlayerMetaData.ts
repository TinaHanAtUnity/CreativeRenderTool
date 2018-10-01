import { BaseMetaData, IMetaData } from 'Core/Models/MetaData/BaseMetaData';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';

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

    public fetch(nativeBridge: NativeBridge, keys?: string[]): Promise<boolean> {
        return super.fetch(nativeBridge, keys).then((exists) => {
            if (exists) {
                return nativeBridge.Storage.delete(StorageType.PUBLIC, this.getCategory()).then(() => {
                    nativeBridge.Storage.write(StorageType.PUBLIC);
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

    public getDTO(): { [key: string]: unknown } {
        return {
            'sid': this.getServerId()
        };
    }
}
