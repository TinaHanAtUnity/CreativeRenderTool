import { Platform } from 'Core/Constants/Platform';
import { RequestError } from 'Core/Errors/RequestError';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

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
    timeout?: number;
}

interface INativeRequest {
    method: RequestMethod;
    url: string;
    data?: string;
    headers: Array<[string, string]>;
    retryCount: number;
    options: IRequestOptions;
}

export interface INativeResponse {
    url: string;
    response: string;
    responseCode: number;
    headers: Array<[string, string]>;
}

export class Request {

    public static AllowedResponseCodes = new RegExp('2[0-9]{2}');
    public static RedirectResponseCodes = new RegExp('30[0-8]');
    public static ErrorResponseCodes = new RegExp('[4-5][0-9]{2}');

    public static getHeader(headers: Array<[string, string]>, headerName: string): string | null {
        for(const header of headers) {
            const key = header[0];
            const value = header[1];
            if (key && key.match(new RegExp(headerName, 'i'))) {
                return value;
            }
        }
        return null;
    }

    public static is2xxSuccessful(sc: number): boolean {
        return sc >= 200 && sc < 300;
    }

    public static is3xxRedirect(sc: number): boolean {
        return sc >= 300 && sc < 400;
    }

    private static _connectTimeout = 30000;
    private static _readTimeout = 30000;
    private static _redirectLimit = 10;

    private static _callbackId: number = 1;
    private static _callbacks: { [key: number]: CallbackContainer<INativeResponse> } = {};
    private static _requests: { [key: number]: INativeRequest } = {};
    private static _authorizations: Array<{ host: RegExp; authorizationHeader: string }> = [];

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

    public static setAuthorizationHeaderForHost(hostRegex: string, authorizationHeader: string) {
        Request._authorizations.push({
            host: new RegExp(hostRegex),
            authorizationHeader: authorizationHeader.trim()
        });
    }

    public static clearAllAuthorization() {
        Request._authorizations = [];
    }

    public static applyAuthorizationHeader(url: string, headers: Array<[string, string]> = []): Array<[string, string]> {
        if (this._authorizations.length === 0) {
            return headers;
        }

        let authorizationHeader = '';

        for (const pair of Request._authorizations) {
            if (pair.host.test(url)) {
                authorizationHeader = pair.authorizationHeader;
                break;
            }
        }

        if (authorizationHeader.length === 0) {
            return headers;
        }

        return [
            ...headers,
            ['Authorization', authorizationHeader]
        ];
    }

    public get(url: string, headers: Array<[string, string]> = [], options?: IRequestOptions): Promise<INativeResponse> {
        if(typeof options === 'undefined') {
            options = Request.getDefaultRequestOptions();
        }

        const id = Request._callbackId++;
        const promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.GET,
            url: url,
            headers: Request.applyAuthorizationHeader(url, headers),
            retryCount: 0,
            options: options
        });
        return promise;
    }

    public post(url: string, data: string = '', headers: Array<[string, string]> = [], options?: IRequestOptions): Promise<INativeResponse> {
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
            headers: Request.applyAuthorizationHeader(url, headers),
            retryCount: 0,
            options: options
        });
        return promise;
    }

    public head(url: string, headers: Array<[string, string]> = [], options?: IRequestOptions): Promise<INativeResponse> {
        if(typeof options === 'undefined') {
            options = Request.getDefaultRequestOptions();
        }

        // fix for Android 4.0 and older, https://code.google.com/p/android/issues/detail?id=24672
        if(this._nativeBridge.getPlatform() === Platform.ANDROID && this._nativeBridge.getApiLevel() < 16) {
            headers.push(['Accept-Encoding', '']);
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

    // Follows the redirects of a URL, returning the final location.
    public followRedirectChain(url: string, resolveOnHttpError = false): Promise<string> {
        let redirectCount = 0;
        return new Promise((resolve, reject) => {
            const makeRequest = (requestUrl: string) => {
                redirectCount++;
                requestUrl = requestUrl.trim();
                if (redirectCount >= Request._redirectLimit) {
                    reject(new Error('redirect limit reached'));
                } else if (requestUrl.indexOf('http') === -1) {
                    // market:// or itunes:// urls can be opened directly
                    resolve(requestUrl);
                } else {
                    this.head(requestUrl).then((response: INativeResponse) => {
                        if (Request.is3xxRedirect(response.responseCode)) {
                            const location = Request.getHeader(response.headers, 'location');
                            if (location) {
                                makeRequest(location);
                            } else {
                                reject(new Error(`${response.responseCode} response did not have a "Location" header`));
                            }
                        } else if (Request.is2xxSuccessful(response.responseCode)) {
                            resolve(requestUrl);
                        } else {
                            if (resolveOnHttpError) {
                                resolve(requestUrl);
                            } else {
                                reject(new Error(`Request to ${requestUrl} failed with status ${response.responseCode}`));
                            }
                        }
                    }).catch(reject);
                }
            };
            makeRequest(url);
        });
    }

    private registerCallback(id: number): Promise<INativeResponse> {
        return new Promise<INativeResponse>((resolve, reject) => {
            Request._callbacks[id] = new CallbackContainer(resolve, reject);
        });
    }

    private invokeRequest(id: number, nativeRequest: INativeRequest): Promise<string> {
        let connectTimeout = Request._connectTimeout;
        let readTimeout = Request._readTimeout;
        if(nativeRequest.options.timeout) {
            connectTimeout = nativeRequest.options.timeout;
            readTimeout = nativeRequest.options.timeout;
        }

        Request._requests[id] = nativeRequest;
        switch(nativeRequest.method) {
            case RequestMethod.GET:
                return this._nativeBridge.Request.get(id.toString(), nativeRequest.url, nativeRequest.headers, connectTimeout, readTimeout);

            case RequestMethod.POST:
                return this._nativeBridge.Request.post(id.toString(), nativeRequest.url, nativeRequest.data || '', nativeRequest.headers, connectTimeout, readTimeout);

            case RequestMethod.HEAD:
                return this._nativeBridge.Request.head(id.toString(), nativeRequest.url, nativeRequest.headers, connectTimeout, readTimeout);

            default:
                throw new Error('Unsupported request method "' + nativeRequest.method + '"');
        }
    }

    private finishRequest(id: number, status: RequestStatus, ...parameters: any[]) {
        const callbackObject = Request._callbacks[id];
        if(callbackObject) {
            if(status === RequestStatus.COMPLETE) {
                callbackObject.resolve(...parameters);
            } else {
                callbackObject.reject(...parameters);
            }
            delete Request._callbacks[id];
            delete Request._requests[id];
        }
    }

    private handleFailedRequest(id: number, nativeRequest: INativeRequest, errorMessage: string, nativeResponse?: INativeResponse): void {
        if(nativeRequest.retryCount < nativeRequest.options.retries) {
            nativeRequest.retryCount++;
            setTimeout(() => {
                this.invokeRequest(id, nativeRequest);
            }, nativeRequest.options.retryDelay);
        } else {
            if(!nativeRequest.options.retryWithConnectionEvents) {
                this.finishRequest(id, RequestStatus.FAILED, new RequestError(errorMessage, nativeRequest, nativeResponse));
            }
        }
    }

    private onRequestComplete(rawId: string, url: string, response: string, responseCode: number, headers: Array<[string, string]>): void {
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
        if(Request.AllowedResponseCodes.exec(responseCode.toString())) {
            this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
        } else if(Request.RedirectResponseCodes.exec(responseCode.toString())) {
            if(nativeRequest.options.followRedirects) {
                const location = Request.getHeader(headers, 'location');
                if(location && this.followRedirects(location)) {
                    nativeRequest.url = location;
                    this.invokeRequest(id, nativeRequest);
                } else {
                    this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
                }
            } else {
                this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
            }
        } else if(Request.ErrorResponseCodes.exec(responseCode.toString())) {
            this.finishRequest(id, RequestStatus.FAILED, new RequestError('FAILED_WITH_ERROR_RESPONSE', nativeRequest, nativeResponse));
        } else {
            this.finishRequest(id, RequestStatus.FAILED, new RequestError('FAILED_WITH_UNKNOWN_RESPONSE_CODE', nativeRequest, nativeResponse));
        }
    }

    private followRedirects(location: string) {
        if(location.match(/^https?/i) && !location.match(/^https:\/\/itunes\.apple\.com/i) && !location.match(/\.apk$/i)) {
            return true;
        } else {
            return false;
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
