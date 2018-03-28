import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

export class UserCountData {

    public static setRequestCount(requestCount: number, nativeBridge: NativeBridge): void {
        nativeBridge.Storage.set<number>(StorageType.PRIVATE, 'user.requestCount', requestCount);
        nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    public static setClickCount(clickCount: number, nativeBridge: NativeBridge): void {
        nativeBridge.Storage.set<number>(StorageType.PRIVATE, 'user.clickCount', clickCount);
        nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    public static getRequestCount(nativeBridge: NativeBridge): Promise<number> {
        return nativeBridge.Storage.get<number>(StorageType.PRIVATE, 'user.requestCount');
    }

    public static getClickCount(nativeBridge: NativeBridge): Promise<number> {
        return nativeBridge.Storage.get<number>(StorageType.PRIVATE, 'user.clickCount');
    }

}
