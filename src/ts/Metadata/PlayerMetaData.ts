import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';

export class PlayerMetaData {

    public static getSid(nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Storage.get(StorageType.PUBLIC, 'player.sid.value').then(sid => {
            nativeBridge.Storage.delete(StorageType.PUBLIC, 'player.sid');
            return sid;
        }).catch(error => {
            return undefined;
        });
    }

}
