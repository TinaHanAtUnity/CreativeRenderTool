import { IARFrameInfo, IARFrameScale } from 'AR/Utilities/ARUtil';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

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
