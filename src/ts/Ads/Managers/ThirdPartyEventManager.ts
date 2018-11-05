import { Campaign } from 'Ads/Models/Campaign';
import { Analytics } from 'Ads/Utilities/Analytics';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { INativeResponse, Request } from 'Core/Utilities/Request';
import { Url } from 'Core/Utilities/Url';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';

enum ThirdPartyEventMethod {
    POST,
    GET
}
export class ThirdPartyEventManager {

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _templateValues: { [id: string]: string } = {};

    public static replaceUrlTemplateValues(urls: string[], templateValues: { [id: string]: string }): string[] {
        const modifiedUrls: string[] = [];
        for (const url of urls) {
            if(url) {
                for(const key in templateValues) {
                    if(templateValues.hasOwnProperty(key)) {
                        const modifiedUrl = url.replace(key, templateValues[key]);
                        modifiedUrls.push(modifiedUrl);
                    }
                }
            }
        }
        return modifiedUrls;
    }

    constructor(nativeBridge: NativeBridge, request: Request, templateValues?: { [id: string]: string }) {
        this._nativeBridge = nativeBridge;
        this._request = request;

        if(templateValues) {
            this.setTemplateValues(templateValues);
        }
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

    public sendWithPost(event: string, sessionId: string, url: string, body?: string, useWebViewUserAgentForTracking?: boolean, headers?: Array<[string, string]>): Promise<INativeResponse> {
        return this.sendEvent(ThirdPartyEventMethod.POST, event, sessionId, url, body, useWebViewUserAgentForTracking, headers);
    }

    public sendWithGet(event: string, sessionId: string, url: string, useWebViewUserAgentForTracking?: boolean, headers?: Array<[string, string]>): Promise<INativeResponse> {
        return this.sendEvent(ThirdPartyEventMethod.GET, event, sessionId, url, undefined, useWebViewUserAgentForTracking, headers);
    }

    private sendEvent(method: ThirdPartyEventMethod, event: string, sessionId: string, url: string, body?: string, useWebViewUserAgentForTracking?: boolean, headers?: Array<[string, string]>): Promise<INativeResponse> {
        const modifiedHeaders = headers || [];
        if (!Request.getHeader(modifiedHeaders, 'User-Agent')) {
            if (typeof navigator !== 'undefined' && navigator.userAgent && useWebViewUserAgentForTracking === true) {
                modifiedHeaders.push(['User-Agent', navigator.userAgent]);
            }
        }

        const urlInternal = this.getUrl(url);

        this._nativeBridge.Sdk.logDebug('Unity Ads third party event: sending ' + event + ' event to ' + urlInternal + ' with headers ' + modifiedHeaders + ' (session ' + sessionId + ')');
        const options = {
            retries: 0,
            retryDelay: 0,
            followRedirects: true,
            retryWithConnectionEvents: false
        };
        let request: Promise<INativeResponse>;
        switch(method) {
            case ThirdPartyEventMethod.POST:
                request = this._request.post(urlInternal, body, modifiedHeaders, options);
                break;
            case ThirdPartyEventMethod.GET:
            default:
                request = this._request.get(urlInternal, modifiedHeaders, options);
        }
        return request.catch(error => {
            let errorInternal = error;
            const urlParts = Url.parse(urlInternal);
            if(error instanceof RequestError) {
                errorInternal = new DiagnosticError(new Error(error.message), {
                    request: error.nativeRequest,
                    event: event,
                    sessionId: sessionId,
                    url: urlInternal,
                    response: error.nativeResponse,
                    host: urlParts.host,
                    protocol: urlParts.protocol
                });
            }
            return Analytics.trigger('third_party_event_failed', errorInternal);
        });
    }

    public setTemplateValues(templateValues: { [id: string]: string }): void {
        this._templateValues = templateValues;
    }

    public setTemplateValue(key: string, value: string): void {
        this._templateValues[key] = value;
    }

    public sendPerformanceTrackingEvent(campaign: Campaign, event: ICometTrackingUrlEvents): Promise<void> {
        if (campaign instanceof PerformanceCampaign) {
            const urls = campaign.getTrackingUrls();
            // Object.keys... is Currently to protect against the integration tests FAB dependency on static performance configurations not including the tracking URLs
            if (urls && urls[event] && Object.keys(urls[event]).length !== 0) {
                for (const eventUrl of urls[event]) {
                    if (eventUrl) {
                        this.sendWithGet(event, campaign.getSession().getId(), eventUrl);
                    } else {
                        const error = {
                            eventUrl: eventUrl,
                            event: event
                        };
                        SessionDiagnostics.trigger('invalid_tracking_url', error, campaign.getSession());
                    }
                }
            }
        }
        return Promise.resolve();
    }

    private getUrl(url: string): string {
        let modifiedUrl = url;
        if(modifiedUrl) {
            for(const key in this._templateValues) {
                if(this._templateValues.hasOwnProperty(key)) {
                    modifiedUrl = modifiedUrl.replace(key, this._templateValues[key]);
                }
            }
        }

        return modifiedUrl;
    }
}
