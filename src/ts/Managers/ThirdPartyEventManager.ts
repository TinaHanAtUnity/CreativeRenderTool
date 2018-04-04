import { NativeBridge } from 'Native/NativeBridge';
import { Request, INativeResponse } from 'Utilities/Request';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Analytics } from 'Utilities/Analytics';
import { RequestError } from 'Errors/RequestError';
import { Diagnostics } from 'Utilities/Diagnostics';

export class ThirdPartyEventManager {

    private _nativeBridge: NativeBridge;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, request: Request) {
        this._nativeBridge = nativeBridge;
        this._request = request;
    }

    public clickAttributionEvent(url: string, redirects: boolean): Promise<INativeResponse> {
        return this._request.get(url, [], {
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
        return this._request.get(url, headers, {
            retries: 0,
            retryDelay: 0,
            followRedirects: true,
            retryWithConnectionEvents: false
        }).then((response) => {
            if (!Request.is2xxSuccessful(response.responseCode)) {
                throw new Error(`Received error response code of ${response.responseCode} from tracker ${url}`);
            }

            return response;
        }).catch(error => {
            if(error instanceof RequestError) {
                error = new DiagnosticError(new Error(error.message), {
                    request: (<RequestError>error).nativeRequest,
                    event: event,
                    sessionId: sessionId,
                    url: url,
                    response: (<RequestError>error).nativeResponse
                });
            }
            Diagnostics.trigger('third_party_event_failed', error);
            return Analytics.trigger('third_party_event_failed', error);
        });
    }
}
