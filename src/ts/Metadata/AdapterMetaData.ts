import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

export class AdapterMetaData {

    public static getName(nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'adapter.name.value');
    }

    public static getVersion(nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'adapter.version.value');
    }

}
