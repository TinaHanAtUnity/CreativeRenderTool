import { AdapterMetaData } from 'Models/MetaData/AdapterMetaData';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { NativeBridge } from 'Native/NativeBridge';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';
import { StorageType } from 'Native/Api/Storage';

// todo: refactor this ugly POS
export class MetaDataManager {

    private static _adapter: AdapterMetaData;
    private static _framework: FrameworkMetaData;
    private static _mediation: MediationMetaData;

    public static hasAdapter(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.get(StorageType.PUBLIC, 'adapter').then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }

    public static getAdapter(nativeBridge: NativeBridge): Promise<AdapterMetaData> {
        return MetaDataManager.hasAdapter(nativeBridge).then((exists) => {
            if(!exists) {
                return Promise.resolve(undefined);
            }
            if(MetaDataManager._adapter) {
                return Promise.resolve(MetaDataManager._adapter);
            }
            return Promise.all([
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'adapter.name.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'adapter.version.value').catch(() => undefined)
            ]).then(([name, version]) => {
                MetaDataManager._adapter = new AdapterMetaData(name, version);
                return MetaDataManager._adapter;
            });
        });
    }

    public static hasFramework(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.get(StorageType.PUBLIC, 'framework').then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }

    public static getFramework(nativeBridge: NativeBridge): Promise<FrameworkMetaData> {
        return MetaDataManager.hasFramework(nativeBridge).then((exists) => {
            if (!exists) {
                return Promise.resolve(undefined);
            }
            if (MetaDataManager._framework) {
                return Promise.resolve(MetaDataManager._framework);
            }
            return Promise.all([
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'framework.name.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'framework.version.value').catch(() => undefined)
            ]).then(([name, version]) => {
                MetaDataManager._framework = new FrameworkMetaData(name, version);
                return MetaDataManager._framework;
            });
        });
    }

    public static hasMediation(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.get(StorageType.PUBLIC, 'mediation').then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }

    public static getMediation(nativeBridge: NativeBridge): Promise<MediationMetaData> {
        return MetaDataManager.hasMediation(nativeBridge).then((exists) => {
            if (!exists) {
                return Promise.resolve(undefined);
            }
            if (MetaDataManager._mediation) {
                return Promise.resolve(MetaDataManager._mediation);
            }
            return Promise.all([
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'mediation.name.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'mediation.version.value').catch(() => undefined),
                nativeBridge.Storage.get<number>(StorageType.PUBLIC, 'mediation.ordinal.value').catch(() => undefined)
            ]).then(([name, version, ordinal]) => {
                MetaDataManager._mediation = new MediationMetaData(name, version, ordinal);
                return MetaDataManager._mediation;
            });
        });
    }

    public static hasPlayer(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.get(StorageType.PUBLIC, 'player').then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }

    public static getPlayer(nativeBridge: NativeBridge): Promise<PlayerMetaData> {
        return MetaDataManager.hasPlayer(nativeBridge).then((exists) => {
            if (!exists) {
                return Promise.resolve(undefined);
            }
            return Promise.all([
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.sid.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.name.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'player.gender.value').catch(() => undefined),
                nativeBridge.Storage.get<number>(StorageType.PUBLIC, 'player.age.value').catch(() => undefined)
            ]).then(([sid, name, gender, age]) => {
                nativeBridge.Storage.delete(StorageType.PUBLIC, 'player');
                return new PlayerMetaData(sid, name, gender, age);
            });
        });
    }

}
