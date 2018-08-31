import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';

export class IosCacheApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache', ApiPackage.CORE);
    }

    public getVideoInfo(fileId: string): Promise<[number, number, number]> {
        return this._nativeBridge.invoke<[number, number, number]>(this._fullApiClassName, 'getVideoInfo', [fileId]);
    }
}
