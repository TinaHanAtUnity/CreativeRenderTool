import { StorageApi, StorageType } from 'Native/Api/Storage';

export class PlayerMetaData {

    public static getSid(): Promise<string> {
        return StorageApi.get(StorageType.PUBLIC, 'player.sid.value').then(sid => {
            StorageApi.delete(StorageType.PUBLIC, 'player.sid');
            return sid;
        }).catch(error => {
            return undefined;
        });
    }

}
