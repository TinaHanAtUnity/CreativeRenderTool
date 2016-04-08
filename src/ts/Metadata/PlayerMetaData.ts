import { StorageManager, StorageType } from 'Managers/StorageManager';

export class PlayerMetaData {

    public static getSid(storageManager: StorageManager): Promise<string> {
        return storageManager.get(StorageType.PUBLIC, 'player.sid.value').then(sid => {
            storageManager.delete(StorageType.PUBLIC, 'player.sid');
            return sid;
        }).catch(error => {
            return undefined;
        });
    }

}
