import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Double } from 'Utilities/Double';

export class AndroidPreferencesApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Preferences', ApiPackage.CORE);
    }

    public hasKey(name: string, key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'hasKey', [name, key]);
    }

    public getString(name: string, key: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this.getFullApiClassName(), 'getString', [name, key]);
    }

    public setString(name: string, key: string, value: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setString', [name, key, value]);
    }

    public getInt(name: string, key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getInt', [name, key]);
    }

    public setInt(name: string, key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setInt', [name, key, value]);
    }

    public getLong(name: string, key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getLong', [name, key]);
    }

    public setLong(name: string, key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setLong', [name, key, value]);
    }

    public getBoolean(name: string, key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'getBoolean', [name, key]);
    }

    public setBoolean(name: string, key: string, value: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setBoolean', [name, key, value]);
    }

    public getFloat(name: string, key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this.getFullApiClassName(), 'getFloat', [name, key]);
    }

    public setFloat(name: string, key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setFloat', [name, key, new Double(value)]);
    }

    public removeKey(name: string, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'removeKey', [name, key]);
    }
}
