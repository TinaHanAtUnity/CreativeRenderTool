import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Double } from 'Core/Utilities/Double';

export class AndroidPreferencesApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Preferences', ApiPackage.CORE);
    }

    public hasKey(name: string, key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'hasKey', [name, key]);
    }

    public getString(name: string, key: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getString', [name, key]);
    }

    public setString(name: string, key: string, value: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setString', [name, key, value]);
    }

    public getInt(name: string, key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getInt', [name, key]);
    }

    public setInt(name: string, key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setInt', [name, key, value]);
    }

    public getLong(name: string, key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getLong', [name, key]);
    }

    public setLong(name: string, key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setLong', [name, key, value]);
    }

    public getBoolean(name: string, key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getBoolean', [name, key]);
    }

    public setBoolean(name: string, key: string, value: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setBoolean', [name, key, value]);
    }

    public getFloat(name: string, key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getFloat', [name, key]);
    }

    public setFloat(name: string, key: string, value: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setFloat', [name, key, new Double(value)]);
    }

    public removeKey(name: string, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'removeKey', [name, key]);
    }
}
