import { NativeApi, ApiPackage } from 'Native/NativeApi';
import { IARFrameInfo, IARFrameScale } from 'Utilities/ARUtil';
import { NativeBridge } from 'Native/NativeBridge';

export class IosARApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AR', ApiPackage.AR);
    }

    public isARSupported(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isARSupported', ['ARWorldTrackingConfiguration']);
    }

    public getFrameInfo(): Promise<IARFrameInfo> {
        return this._nativeBridge.invoke<IARFrameInfo>(this._fullApiClassName, 'getFrameInfo');
    }

    public setFrameScaling(scale: IARFrameScale): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setFrameScaling', [scale]);
    }

    public advanceFrame(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'advanceFrame');
    }
}
