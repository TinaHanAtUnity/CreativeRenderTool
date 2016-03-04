import { NativeBridge } from 'NativeBridge';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

class NativeRequest {
    public successCallback: Function;
    public failedCallback: Function;
    public id: string;
    public method: string;
    public arguments: any[];
    public retries: number;
    public retryDelay: number;
}

export class Request {
    private _nativeBridge: NativeBridge;

    private _resolveCallbacks: Object = {};

    private _requests: NativeRequest[] = [];
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

    public get(url: string, headers?: [string, string][], retries?: number, retryDelay?: number): Promise<any[]> {
        if(typeof headers === 'undefined') {
            headers = [];
        }

        if(typeof retries === 'undefined') {
            retries = 0;
        }

        if(typeof retryDelay === 'undefined') {
            retryDelay = 0;
        }

        let id: string = this.getRequestId();
        let nativeRequest: NativeRequest = new NativeRequest();
        nativeRequest.id = id;
        nativeRequest.method = 'get';
        nativeRequest.arguments = [id, url, headers];
        nativeRequest.retries = retries;
        nativeRequest.retryDelay = retryDelay;

        let promise = this.registerRequest(nativeRequest);
        this.invokeRequest(nativeRequest);
        return promise;
    }

    public post(url: string, data?: string, headers?: [string, string][], retries?: number, retryDelay?: number): Promise<any[]> {
        if(typeof data === 'undefined') {
            data = '';
        }

        if(typeof headers === 'undefined') {
            headers = [];
        }
        headers.push(['Content-Type', 'application/json']);

        if(typeof retries === 'undefined') {
            retries = 0;
        }

        if(typeof retryDelay === 'undefined') {
            retryDelay = 0;
        }

        let id: string = this.getRequestId();
        let nativeRequest: NativeRequest = new NativeRequest();
        nativeRequest.id = id;
        nativeRequest.method = 'post';
        nativeRequest.arguments = [id, url, data, headers];
        nativeRequest.retries = retries;
        nativeRequest.retryDelay = retryDelay;

        let promise = this.registerRequest(nativeRequest);
        this.invokeRequest(nativeRequest);
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

    private registerRequest(nativeRequest: NativeRequest): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            nativeRequest.successCallback = resolve;
            nativeRequest.failedCallback = reject;

            this._requests[nativeRequest.id] = nativeRequest;
        });
    }

    private onUrlComplete(id: string, url: string, response: string): void {
        if(this._requests[id]) {
            this._requests[id].successCallback([response]);
            delete this._requests[id];
        }
    }

    private onUrlFailed(id: string, url: string, error: string): void {
        if(this._requests[id]) {
            if(this._requests[id].retries > 0) {
                this._requests[id].retries--;
                setTimeout((() => { this.invokeRequest(this._requests[id]); }), this._requests[id].retryDelay);
            } else {
                this._requests[id].failedCallback([error]);
                delete this._requests[id];
            }
        }
    }

    private invokeRequest(nativeRequest: NativeRequest) {
        this._nativeBridge.invoke('Url', nativeRequest.method, nativeRequest.arguments);
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