import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Double } from 'Utilities/Double';

export class IosPreferencesApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Preferences', ApiPackage.CORE);
    }

    public hasKey(key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'hasKey', [key]);
    }

    public getString(key: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getString', [key]);
    }

    public setString(value: string, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setString', [value, key]);
    }

    public getInt(key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'getInt', [key]);
    }

    public setInt(value: number, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setInt', [value, key]);
    }

    public getLong(key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getLong', [key]);
    }

    public setLong(value: number, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setLong', [value, key]);
    }

    public getBoolean(key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'getBoolean', [key]);
    }

    public setBoolean(value: boolean, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setBoolean', [value, key]);
    }

    public getFloat(key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getFloat', [key]);
    }

    public setFloat(value: number, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setFloat', [new Double(value), key]);
    }

    public removeKey(key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'removeKey', [key]);
    }
}
