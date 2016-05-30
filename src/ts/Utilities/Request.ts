import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

const enum RequestMethod {
    GET,
    POST
}

interface IRequestOptions {
    retries: number;
    retryDelay: number;
    followRedirects: boolean;
    retryWithConnectionEvents: boolean;
}

interface INativeRequest {
    method: RequestMethod;
    url: string;
    data?: string;
    headers: [string, string][];
    retryCount: number;
    options: IRequestOptions;
}

export interface INativeResponse {
    url: string;
    response: string;
    responseCode: number;
    headers: [string, string][];
}

export class Request {

    private static _connectTimeout = 30000;
    private static _readTimeout = 30000;

    private static _allowedResponseCodes = [200, 501, 300, 301, 302, 303, 304, 305, 306, 307, 308];
    private static _redirectResponseCodes = [300, 301, 302, 303, 304, 305, 306, 307, 308];

    private static _callbackId: number = 1;
    private static _callbacks: { [key: number]: { [key: number]: Function } } = {};
    private static _requests: { [key: number]: INativeRequest } = {};

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;

    public static getHeader(headers: [string, string][], headerName: string): string {
        for(let i = 0; i < headers.length; ++i) {
            let header = headers[i];
            if(header[0].match(new RegExp(headerName, 'i'))) {
                return header[1];
            }
        }
        return null;
    }

    private static getDefaultRequestOptions(): IRequestOptions {
        return {
            retries: 0,
            retryDelay: 0,
            followRedirects: false,
            retryWithConnectionEvents: false
        };
    }

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;

        this._nativeBridge.Request.onComplete.subscribe((rawId, url, response, responseCode, headers) => this.onRequestComplete(rawId, url, response, responseCode, headers));
        this._nativeBridge.Request.onFailed.subscribe((rawId, url, error) => this.onRequestFailed(rawId, url, error));
        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());
    }

    public get(url: string, headers: [string, string][] = [], options?: IRequestOptions): Promise<INativeResponse> {
        if(typeof options === 'undefined') {
            options = Request.getDefaultRequestOptions();
        }

        let id = Request._callbackId++;
        let promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.GET,
            url: url,
            headers: headers,
            retryCount: 0,
            options: options
        });
        return promise;
    }

    public post(url: string, data: string = '', headers: [string, string][] = [], options?: IRequestOptions): Promise<INativeResponse> {
        if(typeof options === 'undefined') {
            options = Request.getDefaultRequestOptions();
        }

        headers.push(['Content-Type', 'application/json']);

        let id = Request._callbackId++;
        let promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.POST,
            url: url,
            data: data,
            headers: headers,
            retryCount: 0,
            options: options
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
                return this._nativeBridge.Request.get(id.toString(), nativeRequest.url, nativeRequest.headers, Request._connectTimeout, Request._readTimeout);

            case RequestMethod.POST:
                return this._nativeBridge.Request.post(id.toString(), nativeRequest.url, nativeRequest.data, nativeRequest.headers, Request._connectTimeout, Request._readTimeout);

            default:
                throw new Error('Unsupported request method "' + nativeRequest.method + '"');
        }
    }

    private finishRequest(id: number, status: RequestStatus, ...parameters: any[]) {
        let callbackObject = Request._callbacks[id];
        if(callbackObject) {
            callbackObject[status](...parameters);
            delete Request._callbacks[id];
            delete Request._requests[id];
        }
    }

    private handleFailedRequest(id: number, nativeRequest: INativeRequest, errorMessage: string): void {
        if(nativeRequest.retryCount < nativeRequest.options.retries) {
            nativeRequest.retryCount++;
            setTimeout(() => {
                this.invokeRequest(id, nativeRequest);
            }, nativeRequest.options.retryDelay);
        } else {
            if(!nativeRequest.options.retryWithConnectionEvents) {
                this.finishRequest(id, RequestStatus.FAILED, [nativeRequest, errorMessage]);
            }
        }
    }

    private onRequestComplete(rawId: string, url: string, response: string, responseCode: number, headers: [string, string][]): void {
        let id = parseInt(rawId, 10);
        let nativeResponse: INativeResponse = {
            url: url,
            response: response,
            responseCode: responseCode,
            headers: headers
        };
        let nativeRequest = Request._requests[id];
        if(Request._allowedResponseCodes.indexOf(responseCode) !== -1) {
            if(Request._redirectResponseCodes.indexOf(responseCode) !== -1 && nativeRequest.options.followRedirects) {
                let location = nativeRequest.url = Request.getHeader(headers, 'location');
                if(location.match(/^https?/i)) {
                    this.invokeRequest(id, nativeRequest);
                } else {
                    this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
                }
            } else {
                this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
            }
        } else {
            this.handleFailedRequest(id, nativeRequest, 'FAILED_AFTER_RETRIES');
        }
    }

    private onRequestFailed(rawId: string, url: string, error: string): void {
        let id = parseInt(rawId, 10);
        let nativeRequest = Request._requests[id];
        this.handleFailedRequest(id, nativeRequest, error);
    }

    private onNetworkConnected(): void {
        let id: any;
        for(id in Request._requests) {
            if(Request._requests.hasOwnProperty(id)) {
                let request: INativeRequest = Request._requests[id];
                if(request.options.retryWithConnectionEvents && request.options.retries === request.retryCount) {
                    this.invokeRequest(id, request);
                }
            }
        }
    }
}
