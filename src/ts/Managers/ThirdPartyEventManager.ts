import { NativeBridge } from 'Native/NativeBridge';
import { Request, INativeResponse } from 'Utilities/Request';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Analytics } from 'Utilities/Analytics';
import { RequestError } from 'Errors/RequestError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { Url } from 'Utilities/Url';
import { Promises } from 'Utilities/Promises';

const DefaultTrackingTimeout = 2000;

export class ThirdPartyEventManager {

    private _nativeBridge: NativeBridge;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, request: Request) {
        this._nativeBridge = nativeBridge;
        this._request = request;
    }

    public clickAttributionEvent(url: string, redirects: boolean, useWebViewUA?: boolean): Promise<INativeResponse> {
        const headers: Array<[string, string]> = [];
        if (typeof navigator !== 'undefined' && navigator.userAgent && useWebViewUA) {
            headers.push(['User-Agent', navigator.userAgent]);
        }
        return this._request.get(url, headers, {
            retries: 0,
            retryDelay: 0,
            followRedirects: redirects,
            retryWithConnectionEvents: false
        });
    }

    public sendEvent(event: string, sessionId: string, url: string, useWebViewUserAgentForTracking?: boolean, headers?: Array<[string, string]>): Promise<INativeResponse> {
        headers = headers || [];
        if (!Request.getHeader(headers, 'User-Agent')) {
            if (typeof navigator !== 'undefined' && navigator.userAgent && useWebViewUserAgentForTracking === true) {
                headers.push(['User-Agent', navigator.userAgent]);
            }
        }

        this._nativeBridge.Sdk.logDebug('Unity Ads third party event: sending ' + event + ' event to ' + url + ' with headers ' + headers + ' (session ' + sessionId + ')');

        return Promises.withTimeout(new Promise<INativeResponse>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    const response: INativeResponse = {
                        url: url,
                        responseCode: xhr.status,
                        response: xhr.responseText,
                        headers: []
                    };
                    if (xhr.status >= 200 && xhr.status <= 399) {
                        resolve(response);
                    } else {
                        const error = new RequestError(`Request to ${url} returned response code ${xhr.status}`, {}, response);
                        reject(error);
                    }
                }
            };
            xhr.open('GET', url, true);
            xhr.send();
        }), DefaultTrackingTimeout).catch((error) => {
            const urlParts = Url.parse(url);
            if(error instanceof RequestError) {
                error = new DiagnosticError(new Error(error.message), {
                    request: (<RequestError>error).nativeRequest,
                    event: event,
                    sessionId: sessionId,
                    url: url,
                    response: (<RequestError>error).nativeResponse,
                    host: urlParts.host,
                    protocol: urlParts.protocol
                });
            }
            return Analytics.trigger('third_party_event_failed', error);
        });
    }
}
