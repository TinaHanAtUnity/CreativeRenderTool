import { RequestApi } from 'Native/Api/Request';
import { ResolveApi } from 'Native/Api/Resolve';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

class NativeRequest {
    public successCallback: Function;
    public failedCallback: Function;
    public id: string;
    public method: string;
    public url: string;
    public data: string;
    public headers: [string, string][];
    public retries: number;
    public retryDelay: number;
}

export class NativeResponse {
    public id: string;
    public url: string;
    public response: string;
    public responseCode: string;
    public headers: string;
}

export class Request {

    private _resolveCallbacks: Object = {};

    private _requests: NativeRequest[] = [];
    private _requestId: number = 1;

    constructor() {
        RequestApi.onComplete.subscribe(this.onUrlComplete.bind(this));
        RequestApi.onFailed.subscribe(this.onUrlFailed.bind(this));
        ResolveApi.onComplete.subscribe(this.onResolveComplete.bind(this));
        ResolveApi.onFailed.subscribe(this.onResolveFailed.bind(this));
    }

    public resolve(host: string): Promise<[string, string, string]> {
        let id: string = this.getRequestId();
        let promise = this.registerCallback(this._resolveCallbacks, id);
        ResolveApi.resolve(id, host);
        return promise;
    }

    public get(url: string, headers?: [string, string][], retries?: number, retryDelay?: number): Promise<NativeResponse> {
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
        nativeRequest.url = url;
        nativeRequest.headers = headers;
        nativeRequest.retries = retries;
        nativeRequest.retryDelay = retryDelay;

        let promise = this.registerRequest(nativeRequest);
        return this.invokeRequest(nativeRequest).then(() => {
            return promise;
        });
    }

    public post(url: string, data?: string, headers?: [string, string][], retries?: number, retryDelay?: number): Promise<NativeResponse> {
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
        nativeRequest.url = url;
        nativeRequest.data = data;
        nativeRequest.headers = headers;
        nativeRequest.retries = retries;
        nativeRequest.retryDelay = retryDelay;

        let promise = this.registerRequest(nativeRequest);
        this.invokeRequest(nativeRequest);
        return promise;
    }

    private registerCallback(callbacks, id): Promise<[string, string, string]> {
        return new Promise<[string, string, string]>((resolve, reject) => {
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

    private registerRequest(nativeRequest: NativeRequest): Promise<NativeResponse> {
        return new Promise<NativeResponse>((resolve, reject) => {
            nativeRequest.successCallback = resolve;
            nativeRequest.failedCallback = reject;
            this._requests[nativeRequest.id] = nativeRequest;
        });
    }

    private onUrlComplete(id: string, url: string, response: string): void {
        if(this._requests[id]) {
            let nativeResponse = new NativeResponse();
            nativeResponse.id = id;
            nativeResponse.url = url;
            nativeResponse.response = response;
            this._requests[id].successCallback(nativeResponse);
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

    private invokeRequest(nativeRequest: NativeRequest): Promise<string> {
        if(nativeRequest.method === 'get') {
            return RequestApi.get(nativeRequest.id, nativeRequest.url, nativeRequest.headers);
        } else if(nativeRequest.method === 'post') {
            return RequestApi.post(nativeRequest.id, nativeRequest.url, nativeRequest.data, nativeRequest.headers);
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
