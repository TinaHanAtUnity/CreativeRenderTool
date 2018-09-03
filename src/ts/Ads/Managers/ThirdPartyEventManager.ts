import { Campaign } from 'Ads/Models/Campaign';
import { Analytics } from 'Ads/Utilities/Analytics';
import { DiagnosticError } from 'Common/Errors/DiagnosticError';
import { RequestError } from 'Common/Errors/RequestError';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { INativeResponse, Request } from 'Core/Utilities/Request';
import { Url } from 'Core/Utilities/Url';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';

export class ThirdPartyEventManager {

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _templateValues: { [id: string]: string } = {};

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

    public sendEvent(event: string, sessionId: string, url: string, useWebViewUserAgentForTracking?: boolean, headers?: Array<[string, string]>): Promise<INativeResponse> {
        headers = headers || [];
        if (!Request.getHeader(headers, 'User-Agent')) {
            if (typeof navigator !== 'undefined' && navigator.userAgent && useWebViewUserAgentForTracking === true) {
                headers.push(['User-Agent', navigator.userAgent]);
            }
        }

        url = this.getUrl(url);

        this._nativeBridge.Sdk.logDebug('Unity Ads third party event: sending ' + event + ' event to ' + url + ' with headers ' + headers + ' (session ' + sessionId + ')');
        return this._request.get(url, headers, {
            retries: 0,
            retryDelay: 0,
            followRedirects: true,
            retryWithConnectionEvents: false
        }).catch(error => {
            const urlParts = Url.parse(url);
            if(error instanceof RequestError) {
                error = new DiagnosticError(new Error(error.message), {
                    request: error.nativeRequest,
                    event: event,
                    sessionId: sessionId,
                    url: url,
                    response: error.nativeResponse,
                    host: urlParts.host,
                    protocol: urlParts.protocol
                });
            }
            return Analytics.trigger('third_party_event_failed', error);
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
                        this.sendEvent(event, campaign.getSession().getId(), eventUrl);
                    } else {
                        const error = {
                            eventUrl: eventUrl,
                            event: event
                        };
                        Diagnostics.trigger('invalid_tracking_url', error, campaign.getSession());
                    }
                }
            }
        }
        return Promise.resolve();
    }

    private getUrl(url: string): string {
        if(url) {
            for(const key in this._templateValues) {
                if(this._templateValues.hasOwnProperty(key)) {
                    url = url.replace(key, this._templateValues[key]);

                }
            }
        }

        return url;
    }
}
