import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';

type NativeInvocation = [string, string, any[], string];

export class BatchInvocation {

    private _nativeBridge: NativeBridge;
    private _batch: NativeInvocation[] = [];

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public queue<T>(className: string, methodName: string, parameters: any[] = []): Promise<T> {
        switch(this._nativeBridge.getPlatform()) {
            case Platform.ANDROID:
                return this.rawQueue<T>('com.unity3d.ads.api.' + className, methodName, parameters);

            case Platform.IOS:
                return this.rawQueue<T>('UADSApi' + className, methodName, parameters);

            default: // for tests
                return this.rawQueue<T>(className, methodName, parameters);
        }
    }

    public rawQueue<T>(fullClassName: string, methodName: string, parameters: any[] = []): Promise<T> {
        return new Promise<T>((resolve, reject): void => {
            let id = this._nativeBridge.registerCallback(resolve, reject);
            this._batch.push([fullClassName, methodName, parameters, id.toString()]);
        });
    }

    public getBatch(): NativeInvocation[] {
        return this._batch;
    }

}
