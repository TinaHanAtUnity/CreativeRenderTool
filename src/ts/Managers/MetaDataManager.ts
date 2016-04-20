import { AdapterMetaData } from 'Models/MetaData/AdapterMetaData';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { NativeBridge } from 'Native/NativeBridge';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';
import { StorageType } from 'Native/Api/Storage';

export class MetaDataManager {

    public static getAdapter(nativeBridge: NativeBridge): Promise<AdapterMetaData> {
        return Promise.all([
            nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'adapter.name.value').catch(() => undefined),
            nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'adapter.version.value').catch(() => undefined)
        ]).then(([name, version]) => {
            return new AdapterMetaData(name, version);
        });
    }

    public static getFramework(nativeBridge: NativeBridge): Promise<FrameworkMetaData> {
        return Promise.all([
            nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'framework.name.value').catch(() => undefined),
            nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'framework.version.value').catch(() => undefined)
        ]).then(([name, version]) => {
            return new FrameworkMetaData(name, version);
        });
    }

    public static getMediation(nativeBridge: NativeBridge): Promise<MediationMetaData> {
        return Promise.all([
            nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'mediation.name.value').catch(() => undefined),
            nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'mediation.version.value').catch(() => undefined),
            nativeBridge.Storage.get<number>(StorageType.PUBLIC, 'mediation.ordinal.value').catch(() => undefined)
        ]).then(([name, version, ordinal]) => {
            return new MediationMetaData(name, version, ordinal);
        });
    }

    public static getPlayer(nativeBridge: NativeBridge): Promise<PlayerMetaData> {
        return Promise.all([
            nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.sid.value').catch(() => undefined),
            nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.name.value').catch(() => undefined),
            nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.gender.value').catch(() => undefined),
            nativeBridge.Storage.get<number>(StorageType.PUBLIC, 'player.age.value').catch(() => undefined)
        ]).then(([sid, name, gender, age]) => {
            nativeBridge.Storage.delete(StorageType.PUBLIC, 'player');
            return new PlayerMetaData(sid, name, gender, age);
        });
    }

}
