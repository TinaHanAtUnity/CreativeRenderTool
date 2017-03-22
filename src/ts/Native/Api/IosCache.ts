import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class IosCacheApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache');
    }

    public getVideoInfo(fileId: string): Promise<[number, number, number]> {
        return this._nativeBridge.invoke<[number, number, number]>(this._apiClass, 'getVideoInfo', [fileId]);
    }
}
