import { NativeBridge } from 'NativeBridge';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

export class Request {

    private _nativeBridge: NativeBridge;

    private _urlCallbacks: Object = {};
    private _resolveCallbacks: Object = {};

    private _requestId: number = 1;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.subscribe('URL_COMPLETE', this.onUrlComplete.bind(this));
        this._nativeBridge.subscribe('URL_FAILED', this.onUrlFailed.bind(this));
        this._nativeBridge.subscribe('RESOLVE_RESOLVED', this.onResolveComplete.bind(this));
        this._nativeBridge.subscribe('RESOLVE_FAILED', this.onResolveFailed.bind(this));
    }

    public resolve(host: string): Promise<any[]> {
        let id: string = this.getRequestId();
        let promise = this.registerCallback(this._resolveCallbacks, id);
        this._nativeBridge.invoke('Url', 'resolve', [id, host]);
        return promise;
    }

    public get(url: string, headers?: [string, string][]): Promise<any[]> {
        if(typeof headers === 'undefined') {
            headers = [];
        }
        let id: string = this.getRequestId();
        let promise = this.registerCallback(this._urlCallbacks, id);
        this._nativeBridge.invoke('Url', 'get', [id, url, headers]);
        return promise;
    }

    public post(url: string, data?: string, headers?: [string, string][]): Promise<any[]> {
        if(typeof data === 'undefined') {
            data = '';
        }
        if(typeof headers === 'undefined') {
            headers = [];
        }
        headers.push(['Content-Type', 'application/json']);

        let id: string = this.getRequestId();
        let promise = this.registerCallback(this._urlCallbacks, id);
        this._nativeBridge.invoke('Url', 'post', [id, url, data, headers]);
        return promise;
    }

    private registerCallback(callbacks, id): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            let callbackObject = {};
            callbackObject[RequestStatus.COMPLETE] = resolve;
            callbackObject[RequestStatus.FAILED] = reject;

            let callbackList: Function[] = callbacks[id];
            if(callbackList) {
                callbacks[id].push(callbackObject);
            } else {
                callbacks[id] = [callbackObject];
            }
        });
    }

    private onUrlComplete(id: string, url: string, response: string): void {
        let callbacks: Function[] = this._urlCallbacks[id];
        if(callbacks) {
            callbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.COMPLETE]([response]);
            });
            delete this._urlCallbacks[id];
        }
    }

    private onUrlFailed(id: string, url: string, error: string): void {
        let callbacks: Function[] = this._urlCallbacks[id];
        if(callbacks) {
            callbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.FAILED]([error]);
            });
            delete this._urlCallbacks[id];
        }
    }

    private onResolveComplete(id: string, host: string, ip: string): void {
        let callbacks: Function[] = this._resolveCallbacks[id];
        if(callbacks) {
            callbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.COMPLETE]([host, ip]);
            });
            delete this._resolveCallbacks[id];
        }
    }

    private onResolveFailed(id: string, host: string, error: string, message: string): void {
        let callbacks: Function[] = this._resolveCallbacks[id];
        if(callbacks) {
            callbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.FAILED]([error, message]);
            });
            delete this._resolveCallbacks[id];
        }
    }

    private getRequestId(): string {
        let id: string = this._requestId.toString();
        this._requestId++;
        return id;
    }
}