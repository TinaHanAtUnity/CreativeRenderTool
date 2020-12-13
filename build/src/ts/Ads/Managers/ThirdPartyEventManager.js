import { Analytics } from 'Ads/Utilities/Analytics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
import { SDKMetrics, MiscellaneousMetric } from 'Ads/Utilities/SDKMetrics';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { FailedPTSEventManager } from 'Ads/Managers/FailedPTSEventManager';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
var ThirdPartyEventMethod;
(function (ThirdPartyEventMethod) {
    ThirdPartyEventMethod[ThirdPartyEventMethod["POST"] = 0] = "POST";
    ThirdPartyEventMethod[ThirdPartyEventMethod["GET"] = 1] = "GET";
})(ThirdPartyEventMethod || (ThirdPartyEventMethod = {}));
export var ThirdPartyEventMacro;
(function (ThirdPartyEventMacro) {
    ThirdPartyEventMacro["ZONE"] = "%ZONE%";
    ThirdPartyEventMacro["SDK_VERSION"] = "%SDK_VERSION%";
    ThirdPartyEventMacro["GAMER_SID"] = "%GAMER_SID%";
    ThirdPartyEventMacro["OM_ENABLED"] = "%25OM_ENABLED%25";
    ThirdPartyEventMacro["OM_VENDORS"] = "%25OM_VENDORS%25";
    ThirdPartyEventMacro["OMIDPARTNER"] = "[OMIDPARTNER]";
    ThirdPartyEventMacro["CACHEBUSTING"] = "[CACHEBUSTING]";
    ThirdPartyEventMacro["AD_UNIT_ID_OPERATIVE"] = "%AD_UNIT_ID%";
    ThirdPartyEventMacro["AD_UNIT_ID_IMPRESSION"] = "%25AD_UNIT_ID%25";
})(ThirdPartyEventMacro || (ThirdPartyEventMacro = {}));
export var TrackingEvent;
(function (TrackingEvent) {
    TrackingEvent["IMPRESSION"] = "impression";
    TrackingEvent["CLICK"] = "click";
    TrackingEvent["START"] = "start";
    TrackingEvent["SHOW"] = "show";
    TrackingEvent["LOADED"] = "loaded";
    TrackingEvent["FIRST_QUARTILE"] = "firstQuartile";
    TrackingEvent["MIDPOINT"] = "midpoint";
    TrackingEvent["THIRD_QUARTILE"] = "thirdQuartile";
    TrackingEvent["COMPLETE"] = "complete";
    TrackingEvent["ERROR"] = "error";
    TrackingEvent["SKIP"] = "skip";
    TrackingEvent["STALLED"] = "stalled";
    TrackingEvent["COMPANION_CLICK"] = "companionClick";
    TrackingEvent["COMPANION"] = "companion";
    TrackingEvent["VIDEO_ENDCARD_CLICK"] = "videoEndCardClick";
    TrackingEvent["MUTE"] = "mute";
    TrackingEvent["UNMUTE"] = "unmute";
    TrackingEvent["PAUSED"] = "paused";
    TrackingEvent["RESUME"] = "resume";
    TrackingEvent["CREATIVE_VIEW"] = "creativeView";
    TrackingEvent["PURCHASE"] = "purchase";
})(TrackingEvent || (TrackingEvent = {}));
export class ThirdPartyEventManager {
    // TODO: Make storageBridge required param if resending the failed PTS Events accounts for the discrepancy
    constructor(core, request, templateValues, storageBridge) {
        this._templateValues = {};
        this._core = core;
        this._request = request;
        this._storageBridge = storageBridge;
        if (templateValues) {
            this.setTemplateValues(templateValues);
        }
    }
    sendTrackingEvents(campaign, event, adDescription, useWebViewUserAgentForTracking, headers) {
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
            const ptsHeaders = [['Content-Type', 'application/json']];
            events.push(this._request.post('https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics', metricData, ptsHeaders, requestOptions));
        }
        for (const url of urls) {
            events.push(this.sendWithGet(`${adDescription} ${event}`, sessionId, url, useWebViewUserAgentForTracking, headers));
        }
        return Promise.all(events);
    }
    replaceTemplateValuesAndEncodeUrls(urls) {
        return urls.map((url) => {
            return this.replaceTemplateValuesAndEncodeUrl(url);
        });
    }
    clickAttributionEvent(url, redirects, useWebViewUA) {
        const headers = [];
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
    sendWithPost(event, sessionId, url, body, useWebViewUserAgentForTracking, headers) {
        return this.sendEvent(ThirdPartyEventMethod.POST, event, sessionId, url, body, useWebViewUserAgentForTracking, headers);
    }
    sendWithGet(event, sessionId, url, useWebViewUserAgentForTracking, headers, additionalMacros) {
        return this.sendEvent(ThirdPartyEventMethod.GET, event, sessionId, url, undefined, useWebViewUserAgentForTracking, headers, additionalMacros);
    }
    sendEvent(method, event, sessionId, url, body, useWebViewUserAgentForTracking, headers, additionalMacros) {
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
        let request;
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
    setTemplateValues(templateValues) {
        this._templateValues = templateValues;
    }
    setTemplateValue(key, value) {
        this._templateValues[key] = value;
    }
    replaceTemplateValuesAndEncodeUrl(url, additionalMacros) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRQYXJ0eUV2ZW50TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvVGhpcmRQYXJ0eUV2ZW50TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLEVBQW1CLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQy9FLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN6QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFM0UsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRTlELElBQUsscUJBR0o7QUFIRCxXQUFLLHFCQUFxQjtJQUN0QixpRUFBSSxDQUFBO0lBQ0osK0RBQUcsQ0FBQTtBQUNQLENBQUMsRUFISSxxQkFBcUIsS0FBckIscUJBQXFCLFFBR3pCO0FBRUQsTUFBTSxDQUFOLElBQVksb0JBVVg7QUFWRCxXQUFZLG9CQUFvQjtJQUM1Qix1Q0FBZSxDQUFBO0lBQ2YscURBQTZCLENBQUE7SUFDN0IsaURBQXlCLENBQUE7SUFDekIsdURBQStCLENBQUE7SUFDL0IsdURBQStCLENBQUE7SUFDL0IscURBQTZC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