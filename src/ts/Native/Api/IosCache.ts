import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class IosCacheApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache', ApiPackage.CORE);
    }

    public getVideoInfo(fileId: string): Promise<[number, number, number]> {
        return this._nativeBridge.invoke<[number, number, number]>(this.getFullApiClassName(), 'getVideoInfo', [fileId]);
    }
}
