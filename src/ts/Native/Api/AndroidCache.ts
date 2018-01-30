import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class AndroidCacheApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache');
    }

    public getMetaData(fileId: string, properties: number[]): Promise<Array<[number, any]>> {
        return this._nativeBridge.invoke<Array<[number, any]>>(this._apiClass, 'getMetaData', [fileId, properties]);
    }

    public getCacheDirectoryType(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getCacheDirectoryType');
    }

    public getCacheDirectoryExists(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getCacheDirectoryExists');
    }

    public reCreateCacheDirectory(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'reCreateCacheDirectory');
    }
}
