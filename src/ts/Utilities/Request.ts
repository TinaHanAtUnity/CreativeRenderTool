import { NativeBridge } from 'Native/NativeBridge';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

const enum RequestMethod {
    GET,
    POST
}

interface INativeRequest {
    method: RequestMethod;
    url: string;
    data?: string;
    headers: [string, string][];
    retries: number;
    retryDelay: number;
}

export interface INativeResponse {
    url: string;
    response: string;
    responseCode: number;
    headers: [string, string][];
}

export class Request {

    private static _allowedResponseCodes = [200, 304, 501];

    private static _callbackId: number = 1;
    private static _callbacks: { [key: number]: { [key: number]: Function } } = {};
    private static _requests: { [key: number]: INativeRequest } = {};

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.Request.onComplete.subscribe(this.onRequestComplete.bind(this));
        this._nativeBridge.Request.onFailed.subscribe(this.onRequestFailed.bind(this));
    }

    public get(url: string, headers?: [string, string][], retries = 0, retryDelay = 0): Promise<INativeResponse> {
        if(typeof headers === 'undefined') {
            headers = [];
        }

        let id = Request._callbackId++;
        let promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.GET,
            url: url,
            headers: headers,
            retries: retries,
            retryDelay: retryDelay
        });
        return promise;
    }

    public post(url: string, data = '', headers?: [string, string][], retries = 0, retryDelay = 0): Promise<INativeResponse> {
        if(typeof headers === 'undefined') {
            headers = [];
        }
        headers.push(['Content-Type', 'application/json']);

        let id = Request._callbackId++;
        let promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.POST,
            url: url,
            data: data,
            headers: headers,
            retries: retries,
            retryDelay: retryDelay
        });
        return promise;
    }

    private registerCallback(id: number): Promise<INativeResponse> {
        return new Promise<INativeResponse>((resolve, reject) => {
            let callbackObject: { [key: number]: Function } = {};
            callbackObject[RequestStatus.COMPLETE] = resolve;
            callbackObject[RequestStatus.FAILED] = reject;
            Request._callbacks[id] = callbackObject;
        });
    }

    private invokeRequest(id: number, nativeRequest: INativeRequest): Promise<string> {
        Request._requests[id] = nativeRequest;
        switch(nativeRequest.method) {
            case RequestMethod.GET:
                return this._nativeBridge.Request.get(id.toString(), nativeRequest.url, nativeRequest.headers);

            case RequestMethod.POST:
                return this._nativeBridge.Request.post(id.toString(), nativeRequest.url, nativeRequest.data, nativeRequest.headers);

            default:
                throw new Error('Unsupported request method "' + nativeRequest.method + '"');
        }
    }

    private onRequestComplete(id: string, url: string, response: string, responseCode: number, headers: [string, string][]): void {
        let callbackObject = Request._callbacks[id];
        if(callbackObject) {
            let nativeResponse: INativeResponse = {
                url: url,
                response: response,
                responseCode: responseCode,
                headers: headers
            };
            if(Request._allowedResponseCodes.indexOf(responseCode) !== -1) {
                callbackObject[RequestStatus.COMPLETE](nativeResponse);
                delete Request._callbacks[id];
                delete Request._requests[id];
            } else {
                let nativeRequest = Request._requests[id];
                if(nativeRequest) {
                    if(nativeRequest.retries > 0) {
                        nativeRequest.retries--;
                        setTimeout(() => {
                            this.invokeRequest(parseInt(id, 10), nativeRequest);
                        }, nativeRequest.retryDelay);
                    } else {
                        callbackObject[RequestStatus.FAILED]([nativeRequest, 'FAILED_AFTER_RETRIES']);
                        delete Request._callbacks[id];
                        delete Request._requests[id];
                    }
                }
            }
        }
    }

    private onRequestFailed(id: string, url: string, error: string): void {
        let callbackObject = Request._callbacks[id];
        if(callbackObject) {
            callbackObject[RequestStatus.FAILED]([Request._requests[id], error]);
            delete Request._callbacks[id];
            delete Request._requests[id];
        }
    }

}
