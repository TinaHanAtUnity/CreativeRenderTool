import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class AdsPropertiesApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AdsProperties', ApiPackage.ADS);
    }

    public setShowTimeout(timeout: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setShowTimeout', [timeout]);
    }
}
