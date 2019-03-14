import { Campaign } from 'Ads/Models/Campaign';
import { Analytics } from 'Ads/Utilities/Analytics';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

enum ThirdPartyEventMethod {
    POST,
    GET
}

export enum ThirdPartyEventMacro {
    ZONE = '%ZONE%',
    SDK_VERSION = '%SDK_VERSION%',
    GAMER_SID = '%GAMER_SID%'
}

export type TemplateValueMap = { [id: string]: string };

export class ThirdPartyEventManager {

    private _core: ICoreApi;
    private _request: RequestManager;
    private _templateValues: { [id: string]: string } = {};

    constructor(core: ICoreApi, request: RequestManager, templateValues?: TemplateValueMap) {
        this._core = core;
        this._request = request;

        if (templateValues) {
            this.setTemplateValues(templateValues);
        }
    }

    public replaceTemplateValuesAndEncodeUrls(urls: string[]): string[] {
        return urls.map((url) => {
            return this.replaceTemplateValuesAndEncodeUrl(url);
        });
    }

    public clickAttributionEvent(url: string, redirects: boolean, useWebViewUA?: boolean): Promise<INativeResponse> {
        const headers: [string, string][] = [];
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

    public sendWithPost(event: string, sessionId: string, url: string, body?: string, useWebViewUserAgentForTracking?: boolean, headers?: [string, string][]): Promise<INativeResponse> {
        return this.sendEvent(ThirdPartyEventMethod.POST, event, sessionId, url, body, useWebViewUserAgentForTracking, headers);
    }

    public sendWithGet(event: string, sessionId: string, url: string, useWebViewUserAgentForTracking?: boolean, headers?: [string, string][]): Promise<INativeResponse> {
        return this.sendEvent(ThirdPartyEventMethod.GET, event, sessionId, url, undefined, useWebViewUserAgentForTracking, headers);
    }

    private sendEvent(method: ThirdPartyEventMethod, event: string, sessionId: string, url: string, body?: string, useWebViewUserAgentForTracking?: boolean, headers?: [string, string][]): Promise<INativeResponse> {
        headers = headers || [];
        if (!RequestManager.getHeader(headers, 'User-Agent')) {
            if (typeof navigator !== 'undefined' && navigator.userAgent && useWebViewUserAgentForTracking === true) {
                headers.push(['User-Agent', navigator.userAgent]);
            }
        }

        url = this.replaceTemplateValuesAndEncodeUrl(url);

        this._core.Sdk.logDebug('Unity Ads third party event: sending ' + event + ' event to ' + url + ' with headers ' + headers + ' (session ' + sessionId + ')');
        const options = {
            retries: 0,
            retryDelay: 0,
            followRedirects: true,
            retryWithConnectionEvents: false
        };
        let request: Promise<INativeResponse>;
        switch (method) {
            case ThirdPartyEventMethod.POST:
                request = this._request.post(url, body, headers, options);
                break;
            case ThirdPartyEventMethod.GET:
            default:
                request = this._request.get(url, headers, options);
        }
        return request.catch(error => {
            const urlParts = Url.parse(url);
            const auctionProtocol = SdkStats.getAuctionProtocol();
            const diagnosticData = {
                request: error.nativeRequest,
                event: event,
                sessionId: sessionId,
                url: url,
                response: error.nativeResponse,
                host: urlParts.host,
                protocol: urlParts.protocol,
                auctionProtocol: auctionProtocol
            };
            if(error instanceof RequestError) {
                error = new DiagnosticError(new Error(error.message), diagnosticData);
            }
            // Auction V5 start dip investigation
            if (auctionProtocol === 5 && (event.indexOf('start') !== -1 || event.indexOf('impression') !== -1)) {
                Diagnostics.trigger('third_party_sendevent_failed_v5', diagnosticData);
            }
            return Analytics.trigger('third_party_event_failed', error);
        });
    }

    public setTemplateValues(templateValues: TemplateValueMap): void {
        this._templateValues = templateValues;
    }

    public setTemplateValue(key: ThirdPartyEventMacro, value: string): void {
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

    private replaceTemplateValuesAndEncodeUrl(url: string): string {
        if (url) {
            for (const key in this._templateValues) {
                if (this._templateValues.hasOwnProperty(key)) {
                    url = url.replace(key, this._templateValues[key]);
                }
            }
        }

        return Url.encode(url);
    }
}

export interface IThirdPartyEventManagerFactory {
    create(templateValues: TemplateValueMap): ThirdPartyEventManager;
}

export class ThirdPartyEventManagerFactory implements IThirdPartyEventManagerFactory {

    private _core: ICoreApi;
    private _requestManager: RequestManager;

    constructor(core: ICoreApi, requestManager: RequestManager) {
        this._core = core;
        this._requestManager = requestManager;
    }

    public create(templateValues: TemplateValueMap): ThirdPartyEventManager {
        return new ThirdPartyEventManager(this._core, this._requestManager, templateValues);
    }
}
