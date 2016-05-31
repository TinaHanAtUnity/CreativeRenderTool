import { Double } from 'Utilities/Double';
import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

export class AndroidVideoPlayerApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'VideoPlayer');
    }

    public getCurrentPosition(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getCurrentPosition');
    }

    public getVolume(): Promise<Double> {
        return this._nativeBridge.invoke<Double>(this._apiClass, 'getVolume');
    }

    public setInfoListenerEnabled(enabled: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setInfoListenerEnabled', [enabled]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }

}
