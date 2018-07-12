import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

export class AndroidRequestApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Request', ApiPackage.CORE);
    }

    public setMaximumPoolSize(count: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setMaximumPoolSize', [count]);
    }

    public setKeepAliveTime(keepAliveTime: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setKeepAliveTime', [keepAliveTime]);
    }
}
