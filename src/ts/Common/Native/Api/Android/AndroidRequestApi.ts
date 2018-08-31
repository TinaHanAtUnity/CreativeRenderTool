import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';

export class AndroidRequestApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Request', ApiPackage.CORE);
    }

    public setMaximumPoolSize(count: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setMaximumPoolSize', [count]);
    }

    public setKeepAliveTime(keepAliveTime: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setKeepAliveTime', [keepAliveTime]);
    }
}
