import { Campaign } from 'Ads/Models/Campaign';
import { Analytics } from 'Ads/Utilities/Analytics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';

enum ThirdPartyEventMethod {
    POST,
    GET
}

export enum ThirdPartyEventMacro {
    ZONE = '%ZONE%',
    SDK_VERSION = '%SDK_VERSION%',
    GAMER_SID = '%GAMER_SID%',
    OM_ENABLED = '%25OM_ENABLED%25',
    OM_VENDORS = '%25OM_VENDORS%25',
    OMIDPARTNER = '[OMIDPARTNER]',
    CACHEBUSTING = '[CACHEBUSTING]'
}

export enum TrackingEvent {
    IMPRESSION = 'impression',
    CLICK = 'click',
    START = 'start',
    SHOW = 'show',
    LOADED = 'loaded',
    FIRST_QUARTILE = 'firstQuartile',
    MIDPOINT = 'midpoint',
    THIRD_QUARTILE = 'thirdQuartile',
    COMPLETE = 'complete',
    ERROR = 'error',
    SKIP = 'skip',
    VIEW = 'view',
    STALLED = 'stalled',
    COMPANION_CLICK = 'companionClick',
    COMPANION = 'companion',
    VIDEO_ENDCARD_CLICK = 'videoEndCardClick',
    MUTE = 'mute',
    UNMUTE = 'unmute',
    PAUSED = 'paused',
    RESUME = 'resume',
    CREATIVE_VIEW = 'creativeView',
    PURCHASE = 'purchase'
}

export interface ITemplateValueMap {
    [id: string]: string;
}

export class ThirdPartyEventManager {

    private _core: ICoreApi;
    private _request: RequestManager;
    private _templateValues: { [id: string]: string } = {};

    constructor(core: ICoreApi, request: RequestManager, templateValues?: ITemplateValueMap) {
        this._core = core;
        this._request = request;

        if (templateValues) {
            this.setTemplateValues(templateValues);
        }
    }

    public sendTrackingEvents(campaign: Campaign, event: TrackingEvent, adDescription: string, useWebViewUserAgentForTracking?: boolean, headers?: [string, string][]): Promise<INativeResponse[]> {
        const urls = campaign.getTrackingUrlsForEvent(event);
        const sessionId = campaign.getSession().getId();
        const events = [];

        for (const url of urls) {
            events.push(this.sendWithGet(`${adDescription} ${event}`, sessionId, url, useWebViewUserAgentForTracking, headers));
        }
        return Promise.all(events);
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

    public sendWithGet(event: string, sessionId: string, url: string, useWebViewUserAgentForTracking?: boolean, headers?: [string, string][], additionalMacros?: {[id: string]: string}): Promise<INativeResponse> {
        return this.sendEvent(ThirdPartyEventMethod.GET, event, sessionId, url, undefined, useWebViewUserAgentForTracking, headers, additionalMacros);
    }

    private sendEvent(method: ThirdPartyEventMethod, event: string, sessionId: string, url: string, body?: string, useWebViewUserAgentForTracking?: boolean, headers?: [string, string][], additionalMacros?: {[id: string]: string}): Promise<INativeResponse> {
        headers = headers || [];
        if (!RequestManager.getHeader(headers, 'User-Agent')) {
            if (typeof navigator !== 'undefined' && navigator.userAgent && useWebViewUserAgentForTracking === true) {
                headers.push(['User-Agent', navigator.userAgent]);
            }
        }

        url = this.replaceTemplateValuesAndEncodeUrl(url, additionalMacros);

        this._core.Sdk.logDebug('Unity Ads third party event: sending ' + event + ' event to ' + url + ' with headers ' + headers + ' (session ' + sessionId + ')');
        const options = {
            retries: 0,
            retryDelay: 0,
            followRedirects: true,
            retryWithConnectionEvents: false
        };

        if (Url.isInternalPTSTrackingProtocol(url)) {
            options.retries = 2;
            options.retryDelay = 10000;
        }

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
            return Analytics.trigger('third_party_event_failed', error);
        });
    }

    public setTemplateValues(templateValues: ITemplateValueMap): void {
        this._templateValues = templateValues;
    }

    public setTemplateValue(key: ThirdPartyEventMacro, value: string): void {
        this._templateValues[key] = value;
    }

    private replaceTemplateValuesAndEncodeUrl(url: string, additionalMacros?: {[id: string]: string}): string {
        if (url) {

            url = MacroUtil.replaceMacro(url, this._templateValues);

            if (additionalMacros) {
                url = MacroUtil.replaceMacro(url, additionalMacros);
            }

            url = MacroUtil.replaceMacro(url, {'[TIMESTAMP]': (new Date()).toISOString()});
        }

        return Url.encode(url);
    }
}
