import { NativeBridge } from 'NativeBridge';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

export class Request {

    private _nativeBridge: NativeBridge;

    private _urlCallbacks: Object = {};
    private _resolveCallbacks: Object = {};

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.subscribe('URL_COMPLETE', this.onUrlComplete.bind(this));
        this._nativeBridge.subscribe('URL_FAILED', this.onUrlFailed.bind(this));
        this._nativeBridge.subscribe('RESOLVE_RESOLVED', this.onResolveComplete.bind(this));
        this._nativeBridge.subscribe('RESOLVE_FAILED', this.onResolveFailed.bind(this));
    }

    public resolve(host: string): Promise<any[]> {
        let promise = this.registerCallback(this._resolveCallbacks, host);
        this._nativeBridge.invoke('Url', 'resolve', [host]);
        return promise;
    }

    public get(url: string, headers?: [string, string][]): Promise<any[]> {
        if(typeof headers === 'undefined') {
            headers = [];
        }
        let promise = this.registerCallback(this._urlCallbacks, url);
        this._nativeBridge.invoke('Url', 'get', [url, headers]);
        return promise;
    }

    public post(url: string, data?: {}, headers?: [string, string][]): Promise<any[]> {
        if(typeof data === 'undefined') {
            data = {};
        }
        if(typeof headers === 'undefined') {
            headers = [];
        }
        headers.push(['Content-Type', 'application/json']);
        let promise = this.registerCallback(this._urlCallbacks, url);
        this._nativeBridge.invoke('Url', 'post', [url, JSON.stringify(data), headers]);
        return promise;
    }

    private registerCallback(callbacks, url): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            let callbackObject = {};
            callbackObject[RequestStatus.COMPLETE] = resolve;
            callbackObject[RequestStatus.FAILED] = reject;

            let callbackList: Function[] = callbacks[url];
            if(callbackList) {
                callbacks[url].push(callbackObject);
            } else {
                callbacks[url] = [callbackObject];
            }
        });
    }

    private onUrlComplete(url: string, response: string): void {
        let callbacks: Function[] = this._urlCallbacks[url];
        if(callbacks) {
            callbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.COMPLETE]([response]);
            });
            delete this._urlCallbacks[url];
        }
    }

    private onUrlFailed(url: string, error: string): void {
        let callbacks: Function[] = this._urlCallbacks[url];
        if(callbacks) {
            callbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.FAILED]([error]);
            });
            delete this._urlCallbacks[url];
        }
    }

    private onResolveComplete(host: string, ip: string): void {
        let callbacks: Function[] = this._resolveCallbacks[host];
        if(callbacks) {
            callbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.COMPLETE]([host, ip]);
            });
            delete this._resolveCallbacks[host];
        }
    }

    private onResolveFailed(host: string, error: string, message: string): void {
        let callbacks: Function[] = this._resolveCallbacks[host];
        if(callbacks) {
            callbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.FAILED]([error, message]);
            });
            delete this._resolveCallbacks[host];
        }
    }

}
