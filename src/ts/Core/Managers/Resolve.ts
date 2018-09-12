import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';
import { Core } from '../Core';

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

    private _core: Core;

    constructor(core: Core) {
        this._core = core;
        this._core.Api.Resolve.onComplete.subscribe((id, host, ip) => Resolve.onResolveComplete(id, host, ip));
        this._core.Api.Resolve.onFailed.subscribe((id, host, error, message) => Resolve.onResolveFailed(id, host, error, message));
    }

    public resolve(host: string): Promise<[string, string, string]> {
        const id = Resolve._callbackId++;
        const promise = this.registerCallback(id);
        this._core.Api.Resolve.resolve(id.toString(), host);
        return promise;
    }

    private registerCallback(id: number): Promise<[string, string, string]> {
        return new Promise<[string, string, string]>((resolve, reject) => {
            Resolve._callbacks[id] = new CallbackContainer(resolve, reject);
        });
    }

}
