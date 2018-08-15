import { NativeBridge } from 'Native/NativeBridge';

type NativeInvocation = [string, string, any[], string];

export class BatchInvocation {

    private _nativeBridge: NativeBridge;
    private _batch: NativeInvocation[] = [];

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public queue<T>(className: string, methodName: string, parameters: any[] = []): Promise<T> {
        return this.rawQueue<T>(className, methodName, parameters);
    }

    public rawQueue<T>(fullClassName: string, methodName: string, parameters: any[] = []): Promise<T> {
        return new Promise<T>((resolve, reject): void => {
            const id = this._nativeBridge.registerCallback(resolve, reject);
            this._batch.push([fullClassName, methodName, parameters, id.toString()]);
        });
    }

    public getBatch(): NativeInvocation[] {
        return this._batch;
    }
}
