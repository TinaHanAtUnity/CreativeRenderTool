import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Double } from 'Utilities/Double';

export class IosPreferencesApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Preferences');
    }

    public hasKey(key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'hasKey', [key]);
    }

    public getString(key: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getString', [key]);
    }

    public setString(value: string, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setString', [value, key]);
    }

    public getInt(key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'getInt', [key]);
    }

    public setInt(value: number, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setInt', [value, key]);
    }

    public getLong(key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getLong', [key]);
    }

    public setLong(value: number, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setLong', [value, key]);
    }

    public getBoolean(key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getBoolean', [key]);
    }

    public setBoolean(value: boolean, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setBoolean', [value, key]);
    }

    public getFloat(key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFloat', [key]);
    }

    public setFloat(value: number, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setFloat', [new Double(value), key]);
    }

    public removeKey(key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'removeKey', [key]);
    }
}
