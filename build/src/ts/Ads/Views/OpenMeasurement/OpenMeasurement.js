import OMID3p from 'html/omid/omid3p.html';
import OMIDTemplate from 'html/OMID.html';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { View } from 'Core/Views/View';
import { Platform } from 'Core/Constants/Platform';
import { OMIDEventBridge } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { Template } from 'Core/Utilities/Template';
import { VerificationReasonCode } from 'VAST/Models/VastAdVerification';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Url } from 'Core/Utilities/Url';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { AccessMode, OMID3pEvents, SessionEvents, MediaType, VideoEventAdaptorType } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { SDKMetrics, OMMetric, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
var AdSessionType;
(function (AdSessionType) {
    AdSessionType["NATIVE"] = "native";
    AdSessionType["HTML"] = "html";
})(AdSessionType || (AdSessionType = {}));
export const PARTNER_NAME = 'Unity3d';
export const DEFAULT_VENDOR_KEY = 'default_key';
export const OM_JS_VERSION = '1.2.10';
export const OMID_P = `${PARTNER_NAME}/${OM_JS_VERSION}`;
export const SDK_APIS = '7';
export class OpenMeasurement extends View {
    constructor(platform, core, clientInfo, campaign, placement, deviceInfo, thirdPartyEventManager, vendorKey, vastAdVerification) {
        super(platform, 'openMeasurement_' + (vendorKey ? vendorKey : DEFAULT_VENDOR_KEY));
        this._sessionFinishCalled = false;
        this._sessionStartProcessedByOmidScript = false;
        this._sessionFinishProcessedByOmidScript = false;
        this._template = new Template(OMIDTemplate);
        this._omAdSessionId = JaegerUtilities.uuidv4();
        this._bindings = [];
        this._core = core;
        this._clientInfo = clientInfo;
        this._campaign = campaign;
        this._thirdPartyEventManager = thirdPartyEventManager;
        // TODO: Make vendor key non-optional
        if (vendorKey) {
            this._vendorKey = vendorKey;
        }
        this._placement = placement;
        this._deviceInfo = deviceInfo;
        if (vastAdVerification) {
            this._adVerification = vastAdVerification;
        }
        this._omBridge = new OMIDEventBridge(core, {
            onEventProcessed: (eventType, vendor) => this.onEventProcessed(eventType, vendor)
        }, this._omIframe, this, this._campaign);
    }
    getVastVerification() {
        return this._adVerification;
    }
    // only needed to build impression adview for VAST campaigns
    setOMAdViewBuilder(omAdViewBuilder) {
        this._omAdViewBuilder = omAdViewBuilder;
    }
    setAdmobOMSessionId(admobSessionInterfaceId) {
        this._admobOMSessionId = admobSessionInterfaceId;
    }
    getOMAdSessionId() {
        return this._omAdSessionId;
    }
    addToViewHierarchy() {
        this.render();
        this.addMessageListener();
        document.body.appendChild(this.container());
    }
    removeFromViewHieararchy() {
        this.removeMessageListener();
        if (this.container().parentElement) {
            document.body.removeChild(this.container());
        }
        if (!this._sessionFinishProcessedByOmidScript && !this._sessionStartProcessedByOmidScript) {
            SessionDiagnostics.trigger('ias_failed_register_events', {}, this._campaign.getSession());
        }
    }
    triggerAdEvent(type, payload) {
        this._omBridge.triggerAdEvent(type, payload);
    }
    triggerVideoEvent(type, payload) {
        this._omBridge.triggerVideoEvent(type, payload);
    }
    addMessageListener() {
        if (this._omBridge) {
            this._omBridge.connect();
        }
    }
    removeMessageListener() {
        if (this._omBridge) {
            this._omBridge.disconnect();
        }
    }
    injectAdVerifications() {
        const verificationResources = [this.setUpVerificationResource(this._adVerification)];
        return this.injectVerificationResources(verificationResources);
    }
    getOmidBridge() {
        return this._omBridge;
    }
    render() {
        super.render();
        this._omIframe = this._container.querySelector('#omid-iframe');
        this._omIframe.id += this._omAdSessionId;
        this._omIframe.srcdoc = MacroUtil.replaceMacro(OMID3p, { '{{ DEFAULT_KEY_ }}': DEFAULT_VENDOR_KEY, '{{ IFRAME_ID_ }}': this._omIframe.id });
        this._omIframe.style.position = 'absolute';
        this._omIframe.style.top = '0';
        this._omIframe.style.left = '0';
        this._omIframe.style.display = 'none';
        this._omIframe.style.width = '100vw';
        this._omIframe.style.height = '100vh';
        this._omIframe.style.border = 'none';
        this._omBridge.setIframe(this._omIframe);
        // Used for all ad, video, and session events
        if (this._campaign instanceof AdMobCampaign && this._admobOMSessionId) {
            this._omAdSessionId = this._admobOMSessionId;
        }
    }
    impression(impressionValues) {
        this._omBridge.triggerAdEvent(OMID3pEvents.OMID_IMPRESSION, impressionValues);
    }
    /**
     * Must ensure this is only called once per background and foreground
     * Videos are in the STOPPED state before they begin playing and this gets called during the Foreground event
     * onContainerBackground and Foreground are subscribed to multiple events Activity.ts
     * Current Calculation Locations: VastAdUnit onContainerBackground, onContainerForeground
     */
    geometryChange(viewport, adView) {
        this._omBridge.triggerAdEvent(OMID3pEvents.OMID_GEOMETRY_CHANGE, { viewport, adView });
    }
    getVerificationResource() {
        return this._verificationResource;
    }
    /*
    * SessionStart:
    * First event that MUST be fired for a session to begin
    * Has the necessary data to fill in the context and verificationParameters of the event data
    * If this is not fired prior to lifecycle events the lifecycle events will not be logged
    */
    sessionStart(sessionEvent) {
        this._sessionStartEventData = sessionEvent;
        this._omBridge.triggerSessionEvent(sessionEvent);
    }
    /**
     * SessionFinish:
     */
    sessionFinish() {
        const event = {
            adSessionId: this.getOMAdSessionId(),
            timestamp: Date.now(),
            type: 'sessionFinish',
            data: {}
        };
        if (!this._sessionFinishCalled) {
            this._omBridge.triggerSessionEvent(event);
            this._sessionFinishCalled = true;
        }
    }
    /**
     * sessionError - Fired on in-video-session errors
     */
    sessionError(event, description) {
        event.data = {
            errorType: 'video',
            message: description
        };
        this._omBridge.triggerSessionEvent(event);
    }
    /**
     * Used to ensure OMID#SessionStart is fired prior to video playback events
     * Used to ensure DOM is removed prior to OMID#SessionFinish
     */
    onEventProcessed(eventType, vendorKey) {
        if (eventType === SessionEvents.SESSION_START) {
            this._sessionStartProcessedByOmidScript = true;
            if (CustomFeatures.isIASVendor(vendorKey)) {
                SDKMetrics.reportMetricEvent(OMMetric.IASVerificationSessionStarted);
            }
            if (this._campaign instanceof VastCampaign) {
                return this.sendVASTStartEvents(vendorKey);
            }
        }
        if (eventType === SessionEvents.SESSION_FINISH) {
            this._sessionFinishProcessedByOmidScript = true;
            if (CustomFeatures.isIASVendor(vendorKey)) {
                SDKMetrics.reportMetricEvent(OMMetric.IASVerificationSessionFinished);
            }
            // IAB recommended -> Set a 1 second timeout to allow the Complete and AdSessionFinishEvent calls
            // to reach server before removing the Verification Client from the DOM
            window.setTimeout(() => this.removeFromViewHieararchy(), 1000);
        }
        if (eventType === 'loadError') {
            SDKMetrics.reportMetricEvent(OMMetric.OMInjectionFailure);
            this.sendErrorEvent(VerificationReasonCode.ERROR_RESOURCE_LOADING);
        }
        if (eventType === 'vendorkeyMismatch') {
            this._core.Sdk.logDebug('Vendor attribute was either never registered or vendor attribute does not match registered key. SessionStart not called.');
        }
        if (eventType === 'sessionRegistered') {
            /**
             * Edge Case:
             * This check is here to ensure the impression values for native/vast videos are correct when fired
             * Because IAS registers late and because admob does not use our native video player
             * the video view data will be accurate by impression time. For non-ias/admob vendors, however,
             * we must wait for that data to return which is why we dont call session start as soon as the
             * om session is registered.
             * admob-session-interface - calls session start for admob
             * vast video event handler - calls session start for vast
             */
            if (CustomFeatures.isWhitelistedOMVendor(vendorKey) || this._campaign instanceof AdMobCampaign) {
                if (this._sessionStartEventData) {
                    this.sessionStart(this._sessionStartEventData);
                }
            }
        }
        return Promise.resolve();
    }
    sendVASTStartEvents(vendorKey) {
        let IASScreenWidth = 0;
        let IASScreenHeight = 0;
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {
            if (this._platform === Platform.ANDROID) {
                screenWidth = OpenMeasurementUtilities.pxToDp(screenWidth, this._deviceInfo);
                screenHeight = OpenMeasurementUtilities.pxToDp(screenHeight, this._deviceInfo);
            }
            IASScreenWidth = screenWidth;
            IASScreenHeight = screenHeight;
            this.impression(this.buildVastImpressionValues(MediaType.VIDEO, AccessMode.LIMITED, screenWidth, screenHeight));
            if (CustomFeatures.isWhitelistedOMVendor(vendorKey)) {
                this.sendIASEvents(IASScreenWidth, IASScreenHeight);
            }
        });
    }
    sendIASEvents(IASScreenWidth, IASScreenHeight) {
        const viewPort = OpenMeasurementUtilities.calculateViewPort(IASScreenWidth, IASScreenHeight);
        const adView = this._omAdViewBuilder.calculateVastAdView(100, [], true, [], IASScreenWidth, IASScreenHeight);
        this.geometryChange(viewPort, adView);
    }
    buildVastImpressionValues(mediaTypeValue, accessMode, screenWidth, screenHeight) {
        const impressionObject = {
            mediaType: mediaTypeValue
        };
        if (mediaTypeValue === MediaType.VIDEO) {
            impressionObject.videoEventAdaptorType = VideoEventAdaptorType.JS_CUSTOM;
            impressionObject.videoEventAdaptorVersion = OMID_P;
        }
        if (accessMode === AccessMode.LIMITED) {
            const measuringElementAvailable = true;
            impressionObject.viewport = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);
            impressionObject.adView = this._omAdViewBuilder.buildVastImpressionAdView(screenWidth, screenHeight, measuringElementAvailable);
        }
        return impressionObject;
    }
    setUpVerificationResource(verification) {
        return {
            // There will only ever be one verification resource per verification. TODO: update model
            resourceUrl: verification.getVerficationResources()[0].getResourceUrl(),
            vendorKey: verification.getVerificationVendor(),
            verificationParameters: verification.getVerificationParameters()
        };
    }
    injectVerificationResources(verificationResources) {
        const promises = [];
        // TODO: Fix to only support one verification resource per OpenMeasurement instance
        verificationResources.forEach((resource) => {
            promises.push(this.injectResourceIntoDom(resource.resourceUrl, resource.vendorKey, resource.verificationParameters));
        });
        return Promise.all(promises).then(() => {
            const verificationScriptsInjected = true;
            this._omBridge.setVerificationsInjected(verificationScriptsInjected);
        });
    }
    injectResourceIntoDom(resourceUrl, vendorKey, verificationParameters) {
        return this.checkVendorResourceURL(resourceUrl).then(() => {
            this.injectAsString(resourceUrl, vendorKey);
            this.populateVendorKey(vendorKey);
            this._verificationResource = {
                resourceUrl: resourceUrl,
                vendorKey: vendorKey,
                verificationParameters: verificationParameters
            };
            if (CustomFeatures.isIASVendor(vendorKey)) {
                SDKMetrics.reportMetricEvent(OMMetric.IASVerificatonInjected);
            }
            if (CustomFeatures.isDoubleClickGoogle(vendorKey) && this._campaign instanceof AdMobCampaign) {
                SDKMetrics.reportMetricEventWithTags(AdmobMetric.DoubleClickOMInjections, {
                    'dckey': OpenMeasurementUtilities.getDcKeyMetricTag(vendorKey)
                });
            }
            return Promise.resolve();
        }).catch((e) => {
            this._core.Sdk.logDebug(`Could not load open measurement verification script: ${e}`);
            if (CustomFeatures.isIASVendor(vendorKey)) {
                SDKMetrics.reportMetricEvent(OMMetric.IASVerificatonInjectionFailed);
            }
        });
    }
    // TODO: Remove as we now capture vendor key in constuctor
    populateVendorKey(vendorKey) {
        this._vendorKey = vendorKey;
    }
    checkVendorResourceURL(resourceUrl) {
        if (CustomFeatures.isUnsupportedOMVendor(resourceUrl)) {
            this.sendErrorEvent(VerificationReasonCode.VERIFICATION_RESOURCE_REJECTED);
            return Promise.reject('verification resource rejected');
        }
        else if (!Url.isValid(resourceUrl)) {
            this.sendErrorEvent(VerificationReasonCode.ERROR_RESOURCE_LOADING);
            return Promise.reject('verification resource is malformed');
        }
        return Promise.resolve();
    }
    sendErrorEvent(reasonCode) {
        const adVerificationErrorURL = this._adVerification.getVerificationTrackingEvent();
        if (adVerificationErrorURL) {
            this._thirdPartyEventManager.sendWithGet('adVerificationErrorEvent', this._campaign.getSession().getId(), adVerificationErrorURL, undefined, undefined, { '%5BREASON%5D': reasonCode.toString() });
        }
    }
    injectAsString(resourceUrl, vendorKey) {
        const dom = new DOMParser().parseFromString(this._omIframe.srcdoc, 'text/html');
        const scriptEl = dom.createElement('script');
        dom.head.appendChild(scriptEl);
        scriptEl.id = `verificationScript#${vendorKey}`;
        scriptEl.setAttribute('onerror', 'window.omid3p.postback(\'onEventProcessed\', {eventType: \'loadError\'})');
        scriptEl.setAttribute('type', 'text/javascript');
        scriptEl.setAttribute('src', resourceUrl);
        this._omIframe.setAttribute('srcdoc', dom.documentElement.outerHTML);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3Blbk1lYXN1cmVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9PcGVuTWVhc3VyZW1lbnQvT3Blbk1lYXN1cmVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLHVCQUF1QixDQUFDO0FBQzNDLE9BQU8sWUFBWSxNQUFNLGdCQUFnQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDNUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSW5ELE9BQU8sRUFBRSxzQkFBc0IsRUFBc0IsTUFBTSxnQ0FBZ0MsQ0FBQztBQUM1RixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsVUFBVSxFQUFrRCxZQUFZLEVBQXNELGFBQWEsRUFBRSxTQUFTLEVBQWlCLHFCQUFxQixFQUFrQyxNQUFNLG9EQUFvRCxDQUFDO0FBQ2xTLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzdFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBRXRFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLG9EQUFvRCxD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