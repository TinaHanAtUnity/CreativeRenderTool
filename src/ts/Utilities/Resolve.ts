import { NativeBridge } from 'Native/NativeBridge';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

export class Resolve {

    private static _callbackId = 1;
    private static _callbacks: { [key: number]: { [key: number]: Function } } = {};

    private _nativeBridge: NativeBridge;

    private static onResolveComplete(id: string, host: string, ip: string): void {
        const callbackObject = Resolve._callbacks[id];
        if(callbackObject) {
            callbackObject[RequestStatus.COMPLETE]([host, ip]);
            delete Resolve._callbacks[id];
        }
    }

    private static onResolveFailed(id: string, host: string, error: string, message: string): void {
        const callbackObject = Resolve._callbacks[id];
        if(callbackObject) {
            callbackObject[RequestStatus.FAILED]([error, message]);
            delete Resolve._callbacks[id];
        }
    }

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
            const callbackObject: { [key: number]: Function } = {};
            callbackObject[RequestStatus.COMPLETE] = resolve;
            callbackObject[RequestStatus.FAILED] = reject;
            Resolve._callbacks[id] = callbackObject;
        });
    }

}
