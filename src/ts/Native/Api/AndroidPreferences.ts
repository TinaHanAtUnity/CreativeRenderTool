import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Double } from 'Utilities/Double';

export class AndroidPreferencesApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Preferences');
    }

    public hasKey(name: string, key: string) {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'hasKey', [name, key]);
    }

    public getString(name: string, key: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getString', [name, key]);
    }

    public setString(name: string, key: string, value: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setString', [name, key, value]);
    }

    public getInt(name: string, key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getInt', [name, key]);
    }

    public setInt(name: string, key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setInt', [name, key, value]);
    }

    public getLong(name: string, key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getLong', [name, key]);
    }

    public setLong(name: string, key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setLong', [name, key, value]);
    }

    public getBoolean(name: string, key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getBoolean', [name, key]);
    }

    public setBoolean(name: string, key: string, value: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setBoolean', [name, key, value]);
    }

    public getFloat(name: string, key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFloat', [name, key]);
    }

    public setFloat(name: string, key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setFloat', [name, key, new Double(value)]);
    }
}
