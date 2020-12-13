import { Platform } from 'Core/Constants/Platform';
import { RequestError } from 'Core/Errors/RequestError';
import { CallbackContainer } from 'Core/Native/Bridge/CallbackContainer';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
export var AuctionProtocol;
(function (AuctionProtocol) {
    AuctionProtocol[AuctionProtocol["V4"] = 4] = "V4";
    AuctionProtocol[AuctionProtocol["V5"] = 5] = "V5";
    AuctionProtocol[AuctionProtocol["V6"] = 6] = "V6";
})(AuctionProtocol || (AuctionProtocol = {}));
export class RequestManager {
    constructor(platform, core, wakeUpManager, deviceInfo) {
        this._platform = platform;
        this._core = core;
        this._wakeUpManager = wakeUpManager;
        this._deviceInfo = deviceInfo;
        this._core.Request.onComplete.subscribe((rawId, url, response, responseCode, headers) => this.onRequestComplete(rawId, url, response, responseCode, headers));
        this._core.Request.onFailed.subscribe((rawId, url, error) => this.onRequestFailed(rawId, url, error));
        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());
    }
    static getHeader(headers, headerName) {
        for (const header of headers) {
            const key = header[0];
            const value = header[1];
            if (key && key.match(new RegExp(headerName, 'i'))) {
                return value;
            }
        }
        return null;
    }
    static is2xxSuccessful(sc) {
        return sc >= 200 && sc < 300;
    }
    static is3xxRedirect(sc) {
        return sc >= 300 && sc < 400;
    }
    static getDefaultRequestOptions() {
        return {
            retries: 0,
            retryDelay: 0,
            followRedirects: false,
            retryWithConnectionEvents: false
        };
    }
    static configureAuctionProtocol(testMode) {
        if (!RequestManager._auctionProtocol) {
            const forceProtocol = TestEnvironment.get('forceAuctionProtocol');
            switch (forceProtocol) {
                case 'V6':
                    RequestManager._auctionProtocol = AuctionProtocol.V6;
                    return;
                case 'V5':
                    RequestManager._auctionProtocol = AuctionProtocol.V5;
                    return;
                case 'V4':
                    RequestManager._auctionProtocol = AuctionProtocol.V4;
                    return;
                default:
            }
            // TestMode is currently unsupported for other protocols
            // creativeUrl testing is set up to use V4 Protocol
            if (testMode || TestEnvironment.get('creativeUrl')) {
                RequestManager._auctionProtocol = AuctionProtocol.V4;
                return;
            }
            RequestManager._auctionProtocol = AuctionProtocol.V6;
        }
    }
    static setTestAuctionProtocol(protocol) {
        RequestManager._auctionProtocol = protocol;
    }
    static getAuctionProtocol() {
        if (RequestManager._auctionProtocol) {
            return RequestManager._auctionProtocol;
        }
        return AuctionProtocol.V4; // default protocol for legacy tests
    }
    static setAuthorizationHeaderForHost(hostRegex, authorizationHeader) {
        RequestManager._authorizations.push({
            host: new RegExp(hostRegex),
            authorizationHeader: authorizationHeader.trim()
        });
    }
    static clearAllAuthorization() {
        RequestManager._authorizations = [];
    }
    static applyAuthorizationHeader(url, headers = []) {
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
    get(url, headers = [], options) {
        // note: Emergency hack to prevent file URLs from crashing Android native SDK.
        // File URLs should not get this far and they should be rejected earlier.
        // Once validation is fixed, this hack should probably be removed.
        if (url.substring(0, 7) === 'file://') {
            Diagnostics.trigger('rejected_get_file_url', {
                url: url
            });
            return Promise.reject(1 /* FAILED */);
        }
        const id = RequestManager._callbackId++;
        const promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: 0 /* GET */,
            url: url,
            headers: RequestManager.applyAuthorizationHeader(url, headers),
            retryCount: 0,
            options: this.getOptions(options)
        });
        return promise;
    }
    post(url, data = '', headers = [], options) {
        // note: Emergency hack to prevent file URLs from crashing Android native SDK.
        // File URLs should not get this far and they should be rejected earlier.
        // Once validation is fixed, this hack should probably be removed.
        if (url.substring(0, 7) === 'file://') {
            Diagnostics.trigger('rejected_post_file_url', {
                url: url
            });
            return Promise.reject(1 /* FAILED */);
        }
        headers.push(['Content-Type', 'application/json']);
        const id = RequestManager._callbackId++;
        const promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: 1 /* POST */,
            url: url,
            data: data,
            headers: RequestManager.applyAuthorizationHeader(url, headers),
            retryCount: 0,
            options: this.getOptions(options)
        });
        return promise;
    }
    head(url, headers = [], options) {
        // note: Emergency hack to prevent file URLs from crashing Android native SDK.
        // File URLs should not get this far and they should be rejected earlier.
        // Once validation is fixed, this hack should probably be removed.
        if (url.substring(0, 7) === 'file://') {
            Diagnostics.trigger('rejected_head_file_url', {
                url: url
            });
            return Promise.reject(1 /* FAILED */);
        }
        // fix for Android 4.0 and older, https://code.google.com/p/android/issues/detail?id=24672
        if (this._platform === Platform.ANDROID && this._deviceInfo.getApiLevel() < 16) {
            headers.push(['Accept-Encoding', '']);
        }
        const id = RequestManager._callbackId++;
        const promise = this.registerCallback(id);
        this.invokeRequest(id, {
            method: 2 /* HEAD */,
            url: url,
            headers: headers,
            retryCount: 0,
            options: this.getOptions(options)
        });
        return promise;
    }
    // Follows the redirects of a URL, returning the final location.
    followRedirectChain(url, useWebViewUserAgentForTracking = false, redirectBreakers) {
        let redirectCount = 0;
        const headers = [];
        if (useWebViewUserAgentForTracking && typeof navigator !== 'undefined' && navigator.userAgent) {
            headers.push(['User-Agent', navigator.userAgent]);
        }
        return new Promise((resolve, reject) => {
            const makeRequest = (requestUrl) => {
                redirectCount++;
                requestUrl = requestUrl.trim();
                if (redirectCount >= RequestManager._redirectLimit) {
                    reject(new Error('redirect limit reached'));
                }
                else if (requestUrl.indexOf('http') === -1) {
                    // market:// or itunes:// urls can be opened directly
                    resolve(requestUrl);
                }
                else {
                    if (redirectBreakers) {
                        for (const breaker of redirectBreakers) {
                            if (requestUrl.indexOf(breaker) !== -1) {
                                resolve(requestUrl);
                                return;
                            }
                        }
                    }
                    this.head(requestUrl, headers).then((response) => {
                        if (RequestManager.is3xxRedirect(response.responseCode)) {
                            const location = RequestManager.getHeader(response.headers, 'location');
                            if (location) {
                                makeRequest(location);
                            }
                            else {
                                reject(new Error(`${response.responseCode} response did not have a "Location" header`));
                            }
                        }
                        else if (RequestManager.is2xxSuccessful(response.responseCode)) {
                            resolve(requestUrl);
                        }
                        else {
                            reject(new Error(`Request to ${requestUrl} failed with status ${response.responseCode}`));
                        }
                    }).catch(reject);
                }
            };
            makeRequest(url);
        });
    }
    getOptions(options) {
        if (options) {
            return options;
        }
        else {
            return RequestManager.getDefaultRequestOptions();
        }
    }
    registerCallback(id) {
        return new Promise((resolve, reject) => {
            RequestManager._callbacks[id] = new CallbackContainer(resolve, reject);
        });
    }
    invokeRequest(id, nativeRequest) {
        let connectTimeout = RequestManager._connectTimeout;
        let readTimeout = RequestManager._readTimeout;
        if (nativeRequest.options.timeout) {
            connectTimeout = nativeRequest.options.timeout;
            readTimeout = nativeRequest.options.timeout;
        }
        RequestManager._requests[id] = nativeRequest;
        switch (nativeRequest.method) {
            case 0 /* GET */:
                return this._core.Request.get(id.toString(), nativeRequest.url, nativeRequest.headers, connectTimeout, readTimeout);
            case 1 /* POST */:
                return this._core.Request.post(id.toString(), nativeRequest.url, nativeRequest.data || '', nativeRequest.headers, connectTimeout, readTimeout);
            case 2 /* HEAD */:
                return this._core.Request.head(id.toString(), nativeRequest.url, nativeRequest.headers, connectTimeout, readTimeout);
            default:
                throw new Error('Unsupported request method "' + nativeRequest.method + '"');
        }
    }
    finishRequest(id, status, response) {
        const callbackObject = RequestManager._callbacks[id];
        if (callbackObject) {
            if (status === 0 /* COMPLETE */) {
                callbackObject.resolve(response);
            }
            else {
                callbackObject.reject(response);
            }
            delete RequestManager._callbacks[id];
            delete RequestManager._requests[id];
        }
    }
    handleFailedRequest(id, nativeRequest, errorMessage, nativeResponse) {
        if (nativeRequest.retryCount < nativeRequest.options.retries) {
            nativeRequest.retryCount++;
            setTimeout(() => {
                this.invokeRequest(id, nativeRequest);
            }, nativeRequest.options.retryDelay);
        }
        else {
            if (!nativeRequest.options.retryWithConnectionEvents) {
                this.finishRequest(id, 1 /* FAILED */, new RequestError(errorMessage, nativeRequest, nativeResponse));
            }
        }
    }
    onRequestComplete(rawId, url, response, responseCode, headers) {
        const id = parseInt(rawId, 10);
        const nativeResponse = {
            url: url,
            response: response,
            responseCode: responseCode,
            headers: headers
        };
        const nativeRequest = RequestManager._requests[id];
        if (!nativeRequest) {
            // ignore events without matching id, might happen when webview reinits
            return;
        }
        if (RequestManager.AllowedResponseCodes.exec(responseCode.toString())) {
            this.finishRequest(id, 0 /* COMPLETE */, nativeResponse);
        }
        else if (RequestManager.RedirectResponseCodes.exec(responseCode.toString())) {
            if (nativeRequest.options.followRedirects) {
                const location = RequestManager.getHeader(headers, 'location');
                if (location && this.followRedirects(location)) {
                    nativeRequest.url = location;
                    this.invokeRequest(id, nativeRequest);
                }
                else {
                    this.finishRequest(id, 0 /* COMPLETE */, nativeResponse);
                }
            }
            else {
                this.finishRequest(id, 0 /* COMPLETE */, nativeResponse);
            }
        }
        else if (RequestManager.ErrorResponseCodes.exec(responseCode.toString())) {
            this.finishRequest(id, 1 /* FAILED */, new RequestError('FAILED_WITH_ERROR_RESPONSE', nativeRequest, nativeResponse));
        }
        else {
            this.finishRequest(id, 1 /* FAILED */, new RequestError('FAILED_WITH_UNKNOWN_RESPONSE_CODE', nativeRequest, nativeResponse));
        }
    }
    followRedirects(location) {
        if (location.match(/^https?/i) && !location.match(/^https:\/\/itunes\.apple\.com/i) && !location.match(/\.apk$/i)) {
            return true;
        }
        else {
            return false;
        }
    }
    onRequestFailed(rawId, url, error) {
        const id = parseInt(rawId, 10);
        const nativeRequest = RequestManager._requests[id];
        if (!nativeRequest) {
            // ignore events without matching id, might happen when webview reinits
            return;
        }
        this.handleFailedRequest(id, nativeRequest, error);
    }
    onNetworkConnected() {
        for (const id in RequestManager._requests) {
            if (RequestManager._requests.hasOwnProperty(id)) {
                const request = RequestManager._requests[id];
                if (request.options.retryWithConnectionEvents && request.options.retries === request.retryCount) {
                    this.invokeRequest(parseInt(id, 10), request);
                }
            }
        }
    }
}
RequestManager.AllowedResponseCodes = new RegExp('2[0-9]{2}');
RequestManager.RedirectResponseCodes = new RegExp('30[0-8]');
RequestManager.ErrorResponseCodes = new RegExp('[4-5][0-9]{2}');
RequestManager._connectTimeout = 30000;
RequestManager._readTimeout = 30000;
RequestManager._redirectLimit = 10;
RequestManager._callbackId = 1;
RequestManager._callbacks = {};
RequestManager._requests = {};
RequestManager._authorizations = [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9NYW5hZ2Vycy9SZXF1ZXN0TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSXhELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFhakUsTUFBTSxDQUFOLElBQVksZUFJWDtBQUpELFdBQVksZUFBZTtJQUN2QixpREFBTSxDQUFBO0lBQ04saURBQU0sQ0FBQTtJQUNOLGlEQUFNLENBQUE7QUFDVixDQUFDLEVBSlcsZUFBZSxLQUFmLGVBQWUsUUFJMUI7QUEwQkQsTUFBTSxPQUFPLGNBQWM7SUFpRHZCLFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsYUFBNEIsRUFBRSxVQUE4QjtRQUN4RyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztRQUNwQyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUU5QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FB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