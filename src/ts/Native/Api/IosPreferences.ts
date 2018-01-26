import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Double } from 'Utilities/Double';

export class IosPreferencesApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Preferences');
    }

    public hasKey(key: string) {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'hasKey', [key]);
    }

    public getString(key: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getString', [key]);
    }

    public setString(key: string, value: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setString', [key, value]);
    }

    public getInt(key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getInt', [key]);
    }

    public setInt(key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setInt', [key, value]);
    }

    public getLong(key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getLong', [key]);
    }

    public setLong(key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setLong', [key, value]);
    }

    public getBoolean(key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getBoolean', [key]);
    }

    public setBoolean(key: string, value: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setBoolean', [key, value]);
    }

    public getFloat(key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFloat', [key]);
    }

    public setFloat(key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setFloat', [key, new Double(value)]);
    }
}
