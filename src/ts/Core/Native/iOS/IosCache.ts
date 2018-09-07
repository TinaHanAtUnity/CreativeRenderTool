import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class IosCacheApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache', ApiPackage.CORE);
    }

    public getVideoInfo(fileId: string): Promise<[number, number, number]> {
        return this._nativeBridge.invoke<[number, number, number]>(this._fullApiClassName, 'getVideoInfo', [fileId]);
    }
}
