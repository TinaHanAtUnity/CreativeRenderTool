import { ICoreApi } from 'Core/ICore';
import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';

export class ResolveManager {

    private static _callbackId = 1;
    private static _callbacks: { [key: string]: CallbackContainer<[string, string, string]> } = {};

    private static onResolveComplete(id: string, host: string, ip: string): void {
        const callbackObject = ResolveManager._callbacks[id];
        if(callbackObject) {
            callbackObject.resolve([id, host, ip]);
            delete ResolveManager._callbacks[id];
        }
    }

    private static onResolveFailed(id: string, host: string, error: string, message: string): void {
        const callbackObject = ResolveManager._callbacks[id];
        if(callbackObject) {
            callbackObject.reject([error, message]);
            delete ResolveManager._callbacks[id];
        }
    }

    private _core: ICoreApi;

    constructor(core: ICoreApi) {
        this._core = core;
        this._core.Resolve.onComplete.subscribe((id, host, ip) => ResolveManager.onResolveComplete(id, host, ip));
        this._core.Resolve.onFailed.subscribe((id, host, error, message) => ResolveManager.onResolveFailed(id, host, error, message));
    }

    public resolve(host: string): Promise<[string, string, string]> {
        const id = ResolveManager._callbackId++;
        const promise = this.registerCallback(id);
        this._core.Resolve.resolve(id.toString(), host);
        return promise;
    }

    private registerCallback(id: number): Promise<[string, string, string]> {
        return new Promise<[string, string, string]>((resolve, reject) => {
            ResolveManager._callbacks[id] = new CallbackContainer(resolve, reject);
        });
    }

}
