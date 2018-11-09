import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class AndroidCacheApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache', ApiPackage.CORE);
    }

    public getMetaData(fileId: string, properties: number[]): Promise<[number, any][]> {
        return this._nativeBridge.invoke<[number, any][]>(this._fullApiClassName, 'getMetaData', [fileId, properties]);
    }

    public getCacheDirectoryType(): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getCacheDirectoryType');
    }

    public getCacheDirectoryExists(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getCacheDirectoryExists');
    }

    public recreateCacheDirectory(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'recreateCacheDirectory');
    }
}
