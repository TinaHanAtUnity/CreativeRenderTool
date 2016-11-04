import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { JsonParser } from 'Utilities/JsonParser';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

const enum RequestMethod {
    GET,
    POST,
    HEAD
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

    public static getHeader(headers: [string, string][], headerName: string): string | null {
        for(let i = 0; i < headers.length; ++i) {
            const header = headers[i];
            if(header[0].match(new RegExp(headerName, 'i'))) {
                return header[1];
            }
        }
        return null;
    }

    private static _connectTimeout = 30000;
    private static _readTimeout = 30000;

    private static _allowedResponseCodes = [200, 501, 300, 301, 302, 303, 304, 305, 306, 307, 308];
    private static _allowedResponseCodeRange = new RegExp('2[0-9]{2}');
    private static _redirectResponseCodes = [300, 301, 302, 303, 304, 305, 306, 307, 308];
    private static _errorResponseCodes = [404];

    private static _callbackId: number = 1;
    private static _callbacks: { [key: number]: { [key: number]: Function } } = {};
    private static _requests: { [key: number]: INativeRequest } = {};

    private static getDefaultRequestOptions(): IRequestOptions {
        return {
            retries: 0,
            retryDelay: 0,
            followRedirects: false,
            retryWithConnectionEvents: false
        };
    }

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;

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

        const id = Request._callbackId++;
        const promise = this.registerCallback(id);
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

        const id = Request._callbackId++;
        const promise = this.registerCallback(id);
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

    public head(url: string, headers: [string, string][] = [], options?: IRequestOptions): Promise<INativeResponse> {
        if(typeof options === 'undefined') {
            options = Request.getDefaultRequestOptions();
        }

        const id = Request._callbackId++;
        const promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.HEAD,
            url: url,
            headers: headers,
            retryCount: 0,
            options: options
        });
        return promise;
    }

    private registerCallback(id: number): Promise<INativeResponse> {
        return new Promise<INativeResponse>((resolve, reject) => {
            const callbackObject: { [key: number]: Function } = {};
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
                return this._nativeBridge.Request.post(id.toString(), nativeRequest.url, nativeRequest.data || '', nativeRequest.headers, Request._connectTimeout, Request._readTimeout);

            case RequestMethod.HEAD:
                return this._nativeBridge.Request.head(id.toString(), nativeRequest.url, nativeRequest.headers, Request._connectTimeout, Request._readTimeout);

            default:
                throw new Error('Unsupported request method "' + nativeRequest.method + '"');
        }
    }

    private finishRequest(id: number, status: RequestStatus, ...parameters: any[]) {
        const callbackObject = Request._callbacks[id];
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
        const id = parseInt(rawId, 10);
        const nativeResponse: INativeResponse = {
            url: url,
            response: response,
            responseCode: responseCode,
            headers: headers
        };
        const nativeRequest = Request._requests[id];

        if(!nativeRequest) {
            // ignore events without matching id, might happen when webview reinits
            return;
        }

        if(Request._allowedResponseCodes.indexOf(responseCode) !== -1 || Request._allowedResponseCodeRange.exec(responseCode.toString())) {
            if(Request._redirectResponseCodes.indexOf(responseCode) !== -1 && nativeRequest.options.followRedirects) {
                const location = Request.getHeader(headers, 'location');
                if(location && location.match(/^https?/i)) {
                    nativeRequest.url = location;
                    this.invokeRequest(id, nativeRequest);
                } else {
                    this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
                }
            } else {
                this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
            }
        } else if (Request._errorResponseCodes.indexOf(responseCode) !== -1) {
            const responseObj = JsonParser.parse(nativeResponse.response);
            this.finishRequest(id, RequestStatus.FAILED,
                [nativeRequest, 'FAILED_WITH_ERROR_RESPONSE', new Error(responseObj.error)]);
        } else {
            this.handleFailedRequest(id, nativeRequest, 'FAILED_AFTER_RETRIES');
        }
    }

    private onRequestFailed(rawId: string, url: string, error: string): void {
        const id = parseInt(rawId, 10);
        const nativeRequest = Request._requests[id];

        if(!nativeRequest) {
            // ignore events without matching id, might happen when webview reinits
            return;
        }

        this.handleFailedRequest(id, nativeRequest, error);
    }

    private onNetworkConnected(): void {
        for(const id in Request._requests) {
            if(Request._requests.hasOwnProperty(id)) {
                const request: INativeRequest = Request._requests[id];
                if(request.options.retryWithConnectionEvents && request.options.retries === request.retryCount) {
                    this.invokeRequest(parseInt(id, 10), request);
                }
            }
        }
    }
}
