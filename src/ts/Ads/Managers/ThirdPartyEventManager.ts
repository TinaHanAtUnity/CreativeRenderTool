import { Campaign } from 'Ads/Models/Campaign';
import { Analytics } from 'Ads/Utilities/Analytics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
import { SDKMetrics, MiscellaneousMetric } from 'Ads/Utilities/SDKMetrics';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { FailedPTSEventManager } from 'Ads/Managers/FailedPTSEventManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';

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

export enum UnityEventMacro {
    AD_UNIT_ID_OPERATIVE = '%AD_UNIT_ID%',
    AD_UNIT_ID_IMPRESSION = '%25AD_UNIT_ID%25'
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
    private _storageBridge: StorageBridge | undefined;
    private _templateValues: { [id: string]: string } = {};

    // TODO: Make storageBridge required param if resending the failed PTS Events accounts for the discrepancy
    constructor(core: ICoreApi, request: RequestManager, templateValues?: ITemplateValueMap, storageBridge?: StorageBridge) {
        this._core = core;
        this._request = request;
        this._storageBridge = storageBridge;

        if (templateValues) {
            this.setTemplateValues(templateValues);
        }
    }

    public sendTrackingEvents(campaign: Campaign, event: TrackingEvent, adDescription: string, useWebViewUserAgentForTracking?: boolean, headers?: [string, string][]): Promise<INativeResponse[]> {
        const urls = campaign.getTrackingUrlsForEvent(event);
        const sessionId = campaign.getSession().getId();
        const events = [];

        // For the investigation of the batching implementation of metrics in the SDK
        if (event === TrackingEvent.IMPRESSION) {

            // Keep original metric and sampling as it was
            if (CustomFeatures.sampleAtGivenPercent(50)) {
                SDKMetrics.reportMetricEvent(MiscellaneousMetric.ImpressionDuplicate);
            }

            const metricData = JSON.stringify({
                metrics: [
                    {
                        name: MiscellaneousMetric.ImpressionDuplicateNonBatching,
                        value: 1,
                        tags: ['ads_sdk2_tst:true']
                    }
                ]
            });

            const requestOptions = {
                retries: 2,
                retryDelay: 0,
                retryWithConnectionEvents: false,
                followRedirects: false
            };

            const ptsHeaders: [string, string][] = [['Content-Type', 'application/json']];
            events.push(this._request.post('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics', metricData, ptsHeaders, requestOptions));
        }

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

            if (this._storageBridge && method === ThirdPartyEventMethod.GET && Url.isInternalPTSTrackingProtocol(url)) {
                new FailedPTSEventManager(this._core, sessionId, JaegerUtilities.uuidv4()).storeFailedEvent(this._storageBridge, {
                    url: url
                });
            }

            const urlParts = Url.parse(url);
            const auctionProtocol = RequestManager.getAuctionProtocol();
            const diagnosticData = {
                request: error.nativeRequest,
                event: event,
                sessionId: sessionId,
                url: url,
                response: error,
                host: urlParts.host,
                protocol: urlParts.protocol,
                auctionProtocol: auctionProtocol
            };
            if (error instanceof RequestError) {
                error = new DiagnosticError(new Error(error.message), diagnosticData);
            }
            // Auction V5 start dip investigation
            if (CustomFeatures.sampleAtGivenPercent(10)) {
                if (event === TrackingEvent.START || event === TrackingEvent.IMPRESSION) {
                    Diagnostics.trigger('third_party_sendevent_failed', diagnosticData);
                }
            }

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

            url = MacroUtil.replaceMacro(url, { '[TIMESTAMP]': (new Date()).toISOString() });
        }

        return Url.encode(url);
    }
}
