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
    followRedirects: boolean;
    retryWithConnectionEvents: boolean;
}

interface INativeRequest {
    method: RequestMethod;
    url: string;
    data?: string;
    headers: [string, string][];
    retries: number;
    retryDelay: number;
    waitNetworkConnected: boolean;
    options: IRequestOptions;
}

export interface INativeResponse {
    url: string;
    response: string;
    responseCode: number;
    headers: [string, string][];
}

export class Request {

    private static _allowedResponseCodes = [200, 302, 501];

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
    }

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.Request.onComplete.subscribe(this.onRequestComplete.bind(this));
        this._nativeBridge.Request.onFailed.subscribe(this.onRequestFailed.bind(this));
        this._wakeUpManager.onNetworkConnected.subscribe(this.onNetworkConnected.bind(this));
    }

    public get(url: string, headers: [string, string][] = [], retries: number = 0, retryDelay: number = 0, options?: IRequestOptions): Promise<INativeResponse> {
        if(typeof options === 'undefined') {
            options = {
                followRedirects: false,
                retryWithConnectionEvents: false
            };
        }

        let id = Request._callbackId++;
        let promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.GET,
            url: url,
            headers: headers,
            retries: retries,
            retryDelay: retryDelay,
            waitNetworkConnected: false,
            options: options
        });
        return promise;
    }

    public post(url: string, data: string = '', headers: [string, string][] = [], retries: number = 0, retryDelay: number = 0, options?: IRequestOptions): Promise<INativeResponse> {
        if(typeof options === 'undefined') {
            options = {
                followRedirects: false,
                retryWithConnectionEvents: false
            };
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
            retryDelay: retryDelay,
            waitNetworkConnected: false,
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
                return this._nativeBridge.Request.get(id.toString(), nativeRequest.url, nativeRequest.headers);

            case RequestMethod.POST:
                return this._nativeBridge.Request.post(id.toString(), nativeRequest.url, nativeRequest.data, nativeRequest.headers);

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
            if(responseCode === 302 && nativeRequest.options.followRedirects) {
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
            if(nativeRequest.retries > 0) {
                nativeRequest.retries--;
                setTimeout(() => {
                    this.invokeRequest(id, nativeRequest);
                }, nativeRequest.retryDelay);
            } else {
                if(nativeRequest.options.retryWithConnectionEvents) {
                    nativeRequest.waitNetworkConnected = true;
                } else {
                    this.finishRequest(id, RequestStatus.FAILED, [nativeRequest, 'FAILED_AFTER_RETRIES']);
                }
            }
        }
    }

    private onRequestFailed(rawId: string, url: string, error: string): void {
        let id = parseInt(rawId, 10);
        this.finishRequest(id, RequestStatus.FAILED, [Request._requests[id], error]);
    }

    private onNetworkConnected(): void {
        
        ;
    }
}