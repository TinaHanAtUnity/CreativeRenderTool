import { NativeBridge } from 'Native/NativeBridge';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

export class Resolve {

    private static _callbackId = 1;
    private static _callbacks: { [key: number]: { [key: number]: Function } } = {};

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.Resolve.onComplete.subscribe((id, host, ip) => this.onResolveComplete(id, host, ip));
        this._nativeBridge.Resolve.onFailed.subscribe((id, host, error, message) => this.onResolveFailed(id, host, error, message));
    }

    public resolve(host: string): Promise<[string, string, string]> {
        let id = Resolve._callbackId++;
        let promise = this.registerCallback(id);
        this._nativeBridge.Resolve.resolve(id.toString(), host);
        return promise;
    }

    private registerCallback(id: number): Promise<[string, string, string]> {
        return new Promise<[string, string, string]>((resolve, reject) => {
            let callbackObject: { [key: number]: Function } = {};
            callbackObject[RequestStatus.COMPLETE] = resolve;
            callbackObject[RequestStatus.FAILED] = reject;
            Resolve._callbacks[id] = callbackObject;
        });
    }

    private onResolveComplete(id: string, host: string, ip: string): void {
        let callbackObject = Resolve._callbacks[id];
        if(callbackObject) {
            callbackObject[RequestStatus.COMPLETE]([host, ip]);
            delete Resolve._callbacks[id];
        }
    }

    private onResolveFailed(id: string, host: string, error: string, message: string): void {
        let callbackObject = Resolve._callbacks[id];
        if(callbackObject) {
            callbackObject[RequestStatus.FAILED]([error, message]);
            delete Resolve._callbacks[id];
        }
    }

}
