import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class AndroidCacheApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache');
    }

    public getMetaData(fileId: string, properties: number[]): Promise<Array<[number, any]>> {
        return this._nativeBridge.invoke<Array<[number, any]>>(this.getFullApiClassName(), 'getMetaData', [fileId, properties]);
    }

    public getCacheDirectoryType(): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getCacheDirectoryType');
    }

    public getCacheDirectoryExists(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'getCacheDirectoryExists');
    }

    public recreateCacheDirectory(): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'recreateCacheDirectory');
    }
}
