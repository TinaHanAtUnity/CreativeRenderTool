import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class AndroidCacheApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache');
    }

    public getMetaData(fileId: string, properties: number[]): Promise<Array<[number, any]>> {
        return this._nativeBridge.invoke<Array<[number, any]>>(this._apiClass, 'getMetaData', [fileId, properties]);
    }
}
