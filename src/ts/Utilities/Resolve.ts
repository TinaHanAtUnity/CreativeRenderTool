import { NativeBridge } from 'Native/NativeBridge';
import { CallbackContainer } from './CallbackContainer';

export class Resolve {

    private static _callbackId = 1;
    private static _callbacks: { [key: string]: CallbackContainer<[string, string, string]> } = {};

    private static onResolveComplete(id: string, host: string, ip: string): void {
        const callbackObject = Resolve._callbacks[id];
        if(callbackObject) {
            callbackObject.resolve([id, host, ip]);
            delete Resolve._callbacks[id];
        }
    }

    private static onResolveFailed(id: string, host: string, error: string, message: string): void {
        const callbackObject = Resolve._callbacks[id];
        if(callbackObject) {
            callbackObject.reject([error, message]);
            delete Resolve._callbacks[id];
        }
    }

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.Resolve.onComplete.subscribe((id, host, ip) => Resolve.onResolveComplete(id, host, ip));
        this._nativeBridge.Resolve.onFailed.subscribe((id, host, error, message) => Resolve.onResolveFailed(id, host, error, message));
    }

    public resolve(host: string): Promise<[string, string, string]> {
        const id = Resolve._callbackId++;
        const promise = this.registerCallback(id);
        this._nativeBridge.Resolve.resolve(id.toString(), host);
        return promise;
    }

    private registerCallback(id: number): Promise<[string, string, string]> {
        return new Promise<[string, string, string]>((resolve, reject) => {
            Resolve._callbacks[id] = new CallbackContainer(resolve, reject);
        });
    }

}
