import { Model } from 'Models/Model';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

export class PlayerMetaData extends Model {

    private _serverId: string;

    public static exists(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.getKeys(StorageType.PUBLIC, 'player', false).then(keys => {
            return keys.length > 0;
        });
    }

    public static fetch(nativeBridge: NativeBridge): Promise<PlayerMetaData> {
        return PlayerMetaData.exists(nativeBridge).then(exists => {
            if(!exists) {
                return Promise.resolve(undefined);
            }
            return nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.server_id.value').catch(() => undefined).then(serverId => {
                nativeBridge.Storage.delete(StorageType.PUBLIC, 'player');
                return new PlayerMetaData(serverId);
            });
        });
    }

    constructor(serverId: string) {
        super();
        this._serverId = serverId;
    }

    public getServerId(): string {
        return this._serverId;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'sid': this._serverId
        };
    }

}
