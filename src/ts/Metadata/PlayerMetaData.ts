import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';

export class PlayerMetaData {

    public static getSid(): Promise<string> {
        return NativeBridge.Storage.get(StorageType.PUBLIC, 'player.sid.value').then(sid => {
            NativeBridge.Storage.delete(StorageType.PUBLIC, 'player.sid');
            return sid;
        }).catch(error => {
            return undefined;
        });
    }

}
