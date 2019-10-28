import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class ListenerApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Listener', ApiPackage.ADS);
    }

    public sendErrorEvent(error: string, message: string): Promise<void> {
        // Uses same codepath as Ads/Native/Listener.sendErrorEvent
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'sendErrorEvent', [error, message]);
    }

}
