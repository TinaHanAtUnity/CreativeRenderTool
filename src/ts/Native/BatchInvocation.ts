import { NativeBridge } from 'Native/NativeBridge';

type NativeInvocation = [string, string, any[], string];

export class BatchInvocation {

    private _nativeBridge: NativeBridge;
    private _batch: NativeInvocation[] = [];

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public queue<T>(className: string, methodName: string, parameters = []): Promise<T> {
        return this.rawQueue<T>(NativeBridge.ApiPackageName, className, methodName, parameters);
    }

    public rawQueue<T>(packageName: string, className: string, methodName: string, parameters = []): Promise<T> {
        return new Promise<T>((resolve, reject): void => {
            let id = this._nativeBridge.registerCallback(resolve, reject);
            let fullClassName: string;
            if(window['platform'] === 'android') {
                fullClassName = packageName + '.' + className;
            } else {
                fullClassName = 'UADSApi' + className;
            }
            this._batch.push([fullClassName, methodName, parameters, id.toString()]);
        });
    }

    public getBatch(): NativeInvocation[] {
        return this._batch;
    }

}
