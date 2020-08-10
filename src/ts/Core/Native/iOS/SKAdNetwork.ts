import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class SKAdNetworkApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'SKAdNetwork', ApiPackage.CORE);
    }

    public available(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'available', []);
    }

    public updateConversionValue(conversionValue: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'updateConversionValue', [conversionValue]);
    }

    public registerAppForAdNetworkAttribution(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'registerAppForAdNetworkAttribution', []);
    }

}
