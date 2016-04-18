import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

export class MediationMetaData {

    public static getName(nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'mediation.name.value');
    }

    public static getVersion(nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'mediation.version.value');
    }

    public static getOrdinal(nativeBridge: NativeBridge): Promise<number> {
        return nativeBridge.Storage.get<number>(StorageType.PUBLIC, 'mediation.ordinal.value');
    }

}
