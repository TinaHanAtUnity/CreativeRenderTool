import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

export class FrameworkMetaData {

    public static getName(nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'framework.name.value');
    }

    public static getVersion(nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'framework.version.value');
    }

}
