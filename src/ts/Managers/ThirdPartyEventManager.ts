import { NativeBridge } from 'Native/NativeBridge';
import { Request, INativeResponse } from 'Utilities/Request';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Analytics } from 'Utilities/Analytics';
import { RequestError } from 'Errors/RequestError';

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

    public thirdPartyEvent(event: string, sessionId: string, url: string): Promise<INativeResponse> {
        this._nativeBridge.Sdk.logInfo('Unity Ads third party event: sending ' + event + ' event to ' + url + ' (session ' + sessionId + ')');
        return this._request.get(url, [], {
            retries: 0,
            retryDelay: 0,
            followRedirects: true,
            retryWithConnectionEvents: false
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
            return Analytics.trigger('third_party_event_failed', error);
        });
    }
}
