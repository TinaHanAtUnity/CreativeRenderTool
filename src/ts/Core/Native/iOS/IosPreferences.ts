import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Double } from 'Core/Utilities/Double';

export class IosPreferencesApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Preferences', ApiPackage.CORE);
    }

    public hasKey(key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'hasKey', [key]);
    }

    public getString(key: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._fullApiClassName, 'getString', [key]);
    }

    public setString(value: string, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setString', [value, key]);
    }

    public getInt(key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'getInt', [key]);
    }

    public setInt(value: number, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setInt', [value, key]);
    }

    public getLong(key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getLong', [key]);
    }

    public setLong(value: number, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setLong', [value, key]);
    }

    public getBoolean(key: string): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getBoolean', [key]);
    }

    public setBoolean(value: boolean, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setBoolean', [value, key]);
    }

    public getFloat(key: string): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getFloat', [key]);
    }

    public setFloat(value: number, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setFloat', [new Double(value), key]);
    }

    public removeKey(key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'removeKey', [key]);
    }
}
