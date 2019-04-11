import { Platform } from 'Core/Constants/Platform';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { iOSCrashTest } from 'Core/Models/ABGroup';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

const enum RequestMethod {
    GET,
    POST,
    HEAD
}

export enum AuctionProtocol {
    V4 = 4,
    V5 = 5
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

export class RequestManager {

    public static AllowedResponseCodes = new RegExp('2[0-9]{2}');
    public static RedirectResponseCodes = new RegExp('30[0-8]');
    public static ErrorResponseCodes = new RegExp('[4-5][0-9]{2}');

    public static getHeader(headers: [string, string][], headerName: string): string | null {
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
    private static _authorizations: { host: RegExp; authorizationHeader: string }[] = [];
    private static _auctionProtocol: AuctionProtocol | undefined;

    private static getDefaultRequestOptions(): IRequestOptions {
        return {
            retries: 0,
            retryDelay: 0,
            followRedirects: false,
            retryWithConnectionEvents: false
        };
    }

    private readonly _platform: Platform;
    private readonly _core: ICoreApi;
    private readonly _wakeUpManager: WakeUpManager;
    private readonly _deviceInfo?: AndroidDeviceInfo;

    constructor(platform: Platform, core: ICoreApi, wakeUpManager: WakeUpManager, deviceInfo?: AndroidDeviceInfo) {
        this._platform = platform;
        this._core = core;
        this._wakeUpManager = wakeUpManager;
        this._deviceInfo = deviceInfo;

        this._core.Request.onComplete.subscribe((rawId, url, response, responseCode, headers) => this.onRequestComplete(rawId, url, response, responseCode, headers));
        this._core.Request.onFailed.subscribe((rawId, url, error) => this.onRequestFailed(rawId, url, error));
        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());
    }

    public static setAuctionProtocol(coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, platform: Platform, clientInfo: ClientInfo) {
        if (!RequestManager._auctionProtocol) {
            if(TestEnvironment.get('creativeUrl')) {
                RequestManager._auctionProtocol = AuctionProtocol.V4;
                return;
            }

            if (coreConfig.getTestMode()) {
                RequestManager._auctionProtocol = AuctionProtocol.V4;
                return;
            }

            if (CustomFeatures.isAuctionV4Game(clientInfo.getGameId()) && !iOSCrashTest.isValid(coreConfig.getAbGroup())) {
                RequestManager._auctionProtocol = AuctionProtocol.V4;
                return;
            }

            RequestManager._auctionProtocol = AuctionProtocol.V5;
        }
    }

    public static setTestAuctionProtocol(protocol: AuctionProtocol | undefined) {
        RequestManager._auctionProtocol = protocol;
    }

    public static getAuctionProtocol(): AuctionProtocol {
        if (RequestManager._auctionProtocol) {
            return RequestManager._auctionProtocol;
        }
        return AuctionProtocol.V4; // default protocol for legacy tests
    }

    public static setAuthorizationHeaderForHost(hostRegex: string, authorizationHeader: string) {
        RequestManager._authorizations.push({
            host: new RegExp(hostRegex),
            authorizationHeader: authorizationHeader.trim()
        });
    }

    public static clearAllAuthorization() {
        RequestManager._authorizations = [];
    }

    public static applyAuthorizationHeader(url: string, headers: [string, string][] = []): [string, string][] {
        if (this._authorizations.length === 0) {
            return headers;
        }

        let authorizationHeader = '';

        for (const pair of RequestManager._authorizations) {
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

    public get(url: string, headers: [string, string][] = [], options?: IRequestOptions): Promise<INativeResponse> {
        // note: Emergency hack to prevent file URLs from crashing Android native SDK.
        // File URLs should not get this far and they should be rejected earlier.
        // Once validation is fixed, this hack should probably be removed.
        if(url.substring(0, 7) === 'file://') {
            Diagnostics.trigger('rejected_get_file_url', {
                url: url
            });
            return Promise.reject(RequestStatus.FAILED);
        }

        const id = RequestManager._callbackId++;
        const promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.GET,
            url: url,
            headers: RequestManager.applyAuthorizationHeader(url, headers),
            retryCount: 0,
            options: this.getOptions(options)
        });
        return promise;
    }

    public post(url: string, data: string = '', headers: [string, string][] = [], options?: IRequestOptions): Promise<INativeResponse> {
        // note: Emergency hack to prevent file URLs from crashing Android native SDK.
        // File URLs should not get this far and they should be rejected earlier.
        // Once validation is fixed, this hack should probably be removed.
        if(url.substring(0, 7) === 'file://') {
            Diagnostics.trigger('rejected_post_file_url', {
                url: url
            });
            return Promise.reject(RequestStatus.FAILED);
        }

        headers.push(['Content-Type', 'application/json']);

        const id = RequestManager._callbackId++;
        const promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.POST,
            url: url,
            data: data,
            headers: RequestManager.applyAuthorizationHeader(url, headers),
            retryCount: 0,
            options: this.getOptions(options)
        });
        return promise;
    }

    public head(url: string, headers: [string, string][] = [], options?: IRequestOptions): Promise<INativeResponse> {
        // note: Emergency hack to prevent file URLs from crashing Android native SDK.
        // File URLs should not get this far and they should be rejected earlier.
        // Once validation is fixed, this hack should probably be removed.
        if(url.substring(0, 7) === 'file://') {
            Diagnostics.trigger('rejected_head_file_url', {
                url: url
            });
            return Promise.reject(RequestStatus.FAILED);
        }

        // fix for Android 4.0 and older, https://code.google.com/p/android/issues/detail?id=24672
        if(this._platform === Platform.ANDROID && this._deviceInfo!.getApiLevel() < 16) {
            headers.push(['Accept-Encoding', '']);
        }

        const id = RequestManager._callbackId++;
        const promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: RequestMethod.HEAD,
            url: url,
            headers: headers,
            retryCount: 0,
            options: this.getOptions(options)
        });
        return promise;
    }

    // Follows the redirects of a URL, returning the final location.
    public followRedirectChain(url: string, useWebViewUserAgentForTracking = false, redirectBreakers?: string[]): Promise<string> {
        let redirectCount = 0;
        const headers: [string, string][] = [];
        if (useWebViewUserAgentForTracking && typeof navigator !== 'undefined' && navigator.userAgent) {
            headers.push(['User-Agent', navigator.userAgent]);
        }
        return new Promise((resolve, reject) => {
            const makeRequest = (requestUrl: string) => {
                redirectCount++;
                requestUrl = requestUrl.trim();
                if (redirectCount >= RequestManager._redirectLimit) {
                    reject(new Error('redirect limit reached'));
                } else if (requestUrl.indexOf('http') === -1) {
                    // market:// or itunes:// urls can be opened directly
                    resolve(requestUrl);
                } else {
                    if (redirectBreakers) {
                        for (const breaker of redirectBreakers) {
                            if (requestUrl.indexOf(breaker) !== -1) {
                                resolve(requestUrl);
                                return;
                            }
                        }
                    }

                    this.head(requestUrl, headers).then((response: INativeResponse) => {
                        if (RequestManager.is3xxRedirect(response.responseCode)) {
                            const location = RequestManager.getHeader(response.headers, 'location');
                            if (location) {
                                makeRequest(location);
                            } else {
                                reject(new Error(`${response.responseCode} response did not have a "Location" header`));
                            }
                        } else if (RequestManager.is2xxSuccessful(response.responseCode)) {
                            resolve(requestUrl);
                        } else {
                            reject(new Error(`Request to ${requestUrl} failed with status ${response.responseCode}`));
                        }
                    }).catch(reject);
                }
            };
            makeRequest(url);
        });
    }

    private getOptions(options?: IRequestOptions): IRequestOptions {
        if (options) {
            return options;
        } else {
            return RequestManager.getDefaultRequestOptions();
        }
    }

    private registerCallback(id: number): Promise<INativeResponse> {
        return new Promise<INativeResponse>((resolve, reject) => {
            RequestManager._callbacks[id] = new CallbackContainer(resolve, reject);
        });
    }

    private invokeRequest(id: number, nativeRequest: INativeRequest): Promise<string> {
        let connectTimeout = RequestManager._connectTimeout;
        let readTimeout = RequestManager._readTimeout;
        if(nativeRequest.options.timeout) {
            connectTimeout = nativeRequest.options.timeout;
            readTimeout = nativeRequest.options.timeout;
        }

        RequestManager._requests[id] = nativeRequest;
        switch(nativeRequest.method) {
            case RequestMethod.GET:
                return this._core.Request.get(id.toString(), nativeRequest.url, nativeRequest.headers, connectTimeout, readTimeout);

            case RequestMethod.POST:
                return this._core.Request.post(id.toString(), nativeRequest.url, nativeRequest.data || '', nativeRequest.headers, connectTimeout, readTimeout);

            case RequestMethod.HEAD:
                return this._core.Request.head(id.toString(), nativeRequest.url, nativeRequest.headers, connectTimeout, readTimeout);

            default:
                throw new Error('Unsupported request method "' + nativeRequest.method + '"');
        }
    }

    private finishRequest(id: number, status: RequestStatus, response: INativeResponse | RequestError) {
        const callbackObject = RequestManager._callbacks[id];
        if(callbackObject) {
            if(status === RequestStatus.COMPLETE) {
                callbackObject.resolve(<INativeResponse>response);
            } else {
                callbackObject.reject(<RequestError>response);
            }
            delete RequestManager._callbacks[id];
            delete RequestManager._requests[id];
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

    private onRequestComplete(rawId: string, url: string, response: string, responseCode: number, headers: [string, string][]): void {
        const id = parseInt(rawId, 10);
        const nativeResponse: INativeResponse = {
            url: url,
            response: response,
            responseCode: responseCode,
            headers: headers
        };
        const nativeRequest = RequestManager._requests[id];

        if(!nativeRequest) {
            // ignore events without matching id, might happen when webview reinits
            return;
        }
        if(RequestManager.AllowedResponseCodes.exec(responseCode.toString())) {
            this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
        } else if(RequestManager.RedirectResponseCodes.exec(responseCode.toString())) {
            if(nativeRequest.options.followRedirects) {
                const location = RequestManager.getHeader(headers, 'location');
                if(location && this.followRedirects(location)) {
                    nativeRequest.url = location;
                    this.invokeRequest(id, nativeRequest);
                } else {
                    this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
                }
            } else {
                this.finishRequest(id, RequestStatus.COMPLETE, nativeResponse);
            }
        } else if(RequestManager.ErrorResponseCodes.exec(responseCode.toString())) {
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
        const nativeRequest = RequestManager._requests[id];

        if(!nativeRequest) {
            // ignore events without matching id, might happen when webview reinits
            return;
        }

        this.handleFailedRequest(id, nativeRequest, error);
    }

    private onNetworkConnected(): void {
        for(const id in RequestManager._requests) {
            if(RequestManager._requests.hasOwnProperty(id)) {
                const request: INativeRequest = RequestManager._requests[id];
                if(request.options.retryWithConnectionEvents && request.options.retries === request.retryCount) {
                    this.invokeRequest(parseInt(id, 10), request);
                }
            }
        }
    }
}
