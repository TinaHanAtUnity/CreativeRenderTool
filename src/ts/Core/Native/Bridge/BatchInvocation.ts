import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

type NativeInvocation = [string, string, unknown[], string];

export class BatchInvocation {

    private _nativeBridge: NativeBridge;
    private _batch: NativeInvocation[] = [];

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public queue<T>(className: string, methodName: string, parameters: unknown[] = []): Promise<T> {
        return this.rawQueue<T>(className, methodName, parameters);
    }

    public rawQueue<T>(fullClassName: string, methodName: string, parameters: unknown[] = []): Promise<T> {
        return new Promise<T>((resolve, reject): void => {
            const id = this._nativeBridge.registerCallback(resolve, reject);
            this._batch.push([fullClassName, methodName, parameters, id.toString()]);
        });
    }

    public getBatch(): NativeInvocation[] {
        return this._batch;
    }
}
