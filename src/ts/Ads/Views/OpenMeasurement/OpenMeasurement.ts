import OMID3p from 'html/omid/omid3p.html';
import OMIDTemplate from 'html/OMID.html';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { View } from 'Core/Views/View';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { OMIDEventBridge } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { Template } from 'Core/Utilities/Template';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Placement } from 'Ads/Models/Placement';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { VerificationReasonCode, VastAdVerification } from 'VAST/Models/VastAdVerification';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { AccessMode, IVerificationScriptResource, IImpressionValues, OMID3pEvents, IVastProperties, IViewPort, IAdView, ISessionEvent, SessionEvents, MediaType, VideoPosition, VideoEventAdaptorType, ObstructionReasons, IRectangle } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { ProgrammaticTrackingService, OMMetric, AdmobMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';
import { Campaign } from 'Ads/Models/Campaign';

interface IVerificationVendorMap {
    [vendorKey: string]: string;
}

enum AdSessionType {
    NATIVE = 'native',
    HTML = 'html'
}

interface IOmidJsInfo {
    omidImplementer: string;
    serviceVersion: string;
    sessionClientVersion: string;
    partnerName: string;
    partnerVersion: string;
}

interface IApp {
    libraryVersion: string;
    appId: string;
}

interface IDeviceInfo {
    deviceType: string;
    os: string;
    osVersion: string;
}

interface IContext {
    apiVersion: string;
    environment: string;
    accessMode: AccessMode;
    videoElement?: HTMLVideoElement | null; // Only required for AccessMode.FULL video
    slotElement?: HTMLElement;              // Only required for AccessMode.FULL display
    adSessionType: AdSessionType;
    adServingId?: string;                   // VAST optional field - <AdServingId>
    transactionId?: string;                 // VAST optional field - VAST 4.1 [TRANSACTIONID]
    podSequence?: string;                   // VAST optional field - sequence <Ad> attribute
    adCount?: number;                       // VAST optional field - number of <InLine> elements
    omidNativeInfo?: {
        partnerName: string;
        partnerVersion: string;
    };
    omidJsInfo: IOmidJsInfo;
    app?: IApp;
    deviceInfo: IDeviceInfo;
    supports: string[];
    customReferenceData?: string;
}

export const PARTNER_NAME = 'Unity3d';
export const DEFAULT_VENDOR_KEY = 'default_key';
export const OM_JS_VERSION = '1.2.10';
export const OMID_P = `${PARTNER_NAME}/${OM_JS_VERSION}`;
export const SDK_APIS = '7';

export class OpenMeasurement<T extends Campaign> extends View<T> {
    private _omIframe: HTMLIFrameElement;
    private _core: ICoreApi;
    private _clientInfo: ClientInfo;
    private _campaign: T;
    private _omBridge: OMIDEventBridge;
    private _request: RequestManager;
    private _omAdSessionId: string;

    private _vendorKey: string;
    private _placement: Placement;
    private _deviceInfo: DeviceInfo;

    private _sessionFinishCalled = false;
    private _sessionStartEventData: ISessionEvent;
    private _sessionStartProcessedByOmidScript = false;
    private _sessionFinishProcessedByOmidScript = false;
    private _adVerification: VastAdVerification;
    private _omAdViewBuilder: OpenMeasurementAdViewBuilder;
    private _verificationResource: IVerificationScriptResource;

    // GUID for running all current omid3p with same sessionid as session interface
    private _admobOMSessionId: string;

    constructor(platform: Platform, core: ICoreApi, clientInfo: ClientInfo, campaign: T, placement: Placement, deviceInfo: DeviceInfo, request: RequestManager, vendorKey: string | undefined, vastAdVerification?: VastAdVerification) {
        super(platform, 'openMeasurement_' + (vendorKey ? vendorKey : DEFAULT_VENDOR_KEY));

        this._template = new Template(OMIDTemplate);

        this._omAdSessionId = JaegerUtilities.uuidv4();
        this._bindings = [];
        this._core = core;
        this._clientInfo = clientInfo;
        this._campaign = campaign;

        // TODO: Make vendor key non-optional
        if (vendorKey) {
            this._vendorKey = vendorKey;
        }

        this._placement = placement;
        this._deviceInfo = deviceInfo;
        this._request = request;

        if (vastAdVerification) {
            this._adVerification = vastAdVerification;
        }

        this._omBridge = new OMIDEventBridge(core, {
            onEventProcessed: (eventType, vendor) => this.onEventProcessed(eventType, vendor)
        }, this._omIframe, this, this._campaign);
    }

    public getVastVerification(): VastAdVerification {
        return this._adVerification;
    }

    // only needed to build impression adview for VAST campaigns
    public setOMAdViewBuilder(omAdViewBuilder: OpenMeasurementAdViewBuilder) {
        this._omAdViewBuilder = omAdViewBuilder;
    }

    public setAdmobOMSessionId(admobSessionInterfaceId: string) {
        this._admobOMSessionId = admobSessionInterfaceId;
    }

    public getOMAdSessionId(): string {
        return this._omAdSessionId;
    }

    public addToViewHierarchy(): void {
        this.render();
        this.addMessageListener();
        document.body.appendChild(this.container());
    }

    public removeFromViewHieararchy(): void {
        this.removeMessageListener();
        if (this.container().parentElement) {
            document.body.removeChild(this.container());
        }

        if (!this._sessionFinishProcessedByOmidScript && !this._sessionStartProcessedByOmidScript) {
            SessionDiagnostics.trigger('ias_failed_register_events', {}, this._campaign.getSession());
        }
    }

    public triggerAdEvent(type: string, payload?: unknown) {
        this._omBridge.triggerAdEvent(type, payload);
    }

    public triggerVideoEvent(type: string, payload?: unknown) {
        this._omBridge.triggerVideoEvent(type, payload);
    }

    public addMessageListener() {
        if (this._omBridge) {
            this._omBridge.connect();
        }
    }

    public removeMessageListener() {
        if (this._omBridge) {
            this._omBridge.disconnect();
        }
    }

    public injectAdVerifications(): Promise<void> {
        const verificationResources: IVerificationScriptResource[] = [this.setUpVerificationResource(this._adVerification)];
        return this.injectVerificationResources(verificationResources);
    }

    public getOmidBridge(): OMIDEventBridge {
        return this._omBridge;
    }

    public render(): void {
        super.render();

        this._omIframe = <HTMLIFrameElement> this._container.querySelector('#omid-iframe');
        this._omIframe.srcdoc = MacroUtil.replaceMacro(OMID3p, {'{{ DEFAULT_KEY_ }}': DEFAULT_VENDOR_KEY });

        this._omIframe.id += this._omAdSessionId;
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

    public impression(impressionValues: IImpressionValues) {
        this._omBridge.triggerAdEvent(OMID3pEvents.OMID_IMPRESSION, impressionValues);
    }

    /**
     * Video-only event. The player has loaded and buffered the creative’s
     * media and assets either fully or to the extent that it is ready
     * to play the media. Corresponds to the VAST  loaded  event.
     */
    public loaded(vastProperties: IVastProperties) {
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_LOADED, {vastProperties});
    }

    /**
     * Must ensure this is only called once per background and foreground
     * Videos are in the STOPPED state before they begin playing and this gets called during the Foreground event
     * onContainerBackground and Foreground are subscribed to multiple events Activity.ts
     * Current Calculation Locations: VastAdUnit onContainerBackground, onContainerForeground
     */
    public geometryChange(viewport: IViewPort, adView: IAdView) {
        this._omBridge.triggerAdEvent(OMID3pEvents.OMID_GEOMETRY_CHANGE, {viewport, adView});
    }

    public getVerificationResource(): IVerificationScriptResource {
        return this._verificationResource;
    }

    /*
    * SessionStart:
    * First event that MUST be fired for a session to begin
    * Has the necessary data to fill in the context and verificationParameters of the event data
    * If this is not fired prior to lifecycle events the lifecycle events will not be logged
    */
    public sessionStart(sessionEvent: ISessionEvent) {
        this._sessionStartEventData = sessionEvent;
        this._omBridge.triggerSessionEvent(sessionEvent);
    }

   /**
    * SessionFinish:
    */
    public sessionFinish() {
        const event: ISessionEvent = {
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
    public sessionError(event: ISessionEvent, description?: string) {
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
    public onEventProcessed(eventType: string, vendorKey?: string): Promise<void> {
        if (eventType === SessionEvents.SESSION_START) {
            this._sessionStartProcessedByOmidScript = true;

            if (vendorKey === 'IAS') {
                ProgrammaticTrackingService.reportMetricEvent(OMMetric.IASVerificationSessionStarted);
            }

            if (this._campaign instanceof AdMobCampaign) {
                ProgrammaticTrackingService.reportMetricEvent(AdmobMetric.AdmobOMSessionStartObserverCalled);
            }

            if (this._campaign instanceof VastCampaign) {
                return this.sendVASTStartEvents(vendorKey);
            }
        }

        if (eventType === SessionEvents.SESSION_FINISH) {
            this._sessionFinishProcessedByOmidScript = true;
            if (vendorKey === 'IAS' && ProgrammaticTrackingService) {
                ProgrammaticTrackingService.reportMetricEvent(OMMetric.IASVerificationSessionFinished);
            }
            // IAB recommended -> Set a 1 second timeout to allow the Complete and AdSessionFinishEvent calls
            // to reach server before removing the Verification Client from the DOM
            window.setTimeout(() => this.removeFromViewHieararchy(), 1000);
        }

        if (eventType === 'loadError') {
            ProgrammaticTrackingService.reportMetricEvent(OMMetric.OMInjectionFailure);
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
            if (vendorKey === 'IAS' || this._campaign instanceof AdMobCampaign) {
                if (this._sessionStartEventData) {
                    this.sessionStart(this._sessionStartEventData);
                }
            }
        }

        return Promise.resolve();
    }

    private sendVASTStartEvents(vendorKey?: string): Promise<void> {
            let IASScreenWidth = 0;
            let IASScreenHeight = 0;

            return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {

                if (this._platform === Platform.ANDROID) {
                    screenWidth = OpenMeasurementUtilities.pxToDp(screenWidth, <AndroidDeviceInfo> this._deviceInfo);
                    screenHeight = OpenMeasurementUtilities.pxToDp(screenHeight, <AndroidDeviceInfo> this._deviceInfo);
                }

                IASScreenWidth = screenWidth;
                IASScreenHeight = screenHeight;

                this.impression(this.buildVastImpressionValues(MediaType.VIDEO, AccessMode.LIMITED, screenWidth, screenHeight));

                if (vendorKey === 'IAS') {
                    this.sendIASEvents(IASScreenWidth, IASScreenHeight);
                }

                this.loaded({
                    isSkippable: this._placement.allowSkip(),
                    skipOffset: this._placement.allowSkipInSeconds(),
                    isAutoplay: true,                   // Always autoplay for video
                    position: VideoPosition.STANDALONE  // Always standalone video
                });
            });
    }

    private sendIASEvents(IASScreenWidth: number, IASScreenHeight: number) {
            const viewPort = OpenMeasurementUtilities.calculateViewPort(IASScreenWidth, IASScreenHeight);
            const adView = this._omAdViewBuilder.calculateVastAdView(100, [], true, [], IASScreenWidth, IASScreenHeight);

            this.geometryChange(viewPort, adView);
    }

    private buildVastImpressionValues(mediaTypeValue: MediaType, accessMode: AccessMode, screenWidth: number, screenHeight: number): IImpressionValues {
        const impressionObject: IImpressionValues = {
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

    private setUpVerificationResource(verification: VastAdVerification): IVerificationScriptResource {
        return {
            // There will only ever be one verification resource per verification. TODO: update model
            resourceUrl: verification.getVerficationResources()[0].getResourceUrl(),
            vendorKey: verification.getVerificationVendor(),
            verificationParameters: verification.getVerificationParameters()
        };
    }

    public injectVerificationResources(verificationResources: IVerificationScriptResource[]): Promise<void> {
        const promises: Promise<void>[] = [];

        // TODO: Fix to only support one verification resource per OpenMeasurement instance
        verificationResources.forEach((resource) => {
            promises.push(this.injectResourceIntoDom(resource.resourceUrl, resource.vendorKey, resource.verificationParameters!));
        });

        return Promise.all(promises).then(() => {
            const verificationScriptsInjected = true;
            this._omBridge.setVerificationsInjected(verificationScriptsInjected);
        });
    }

    private injectResourceIntoDom(resourceUrl: string, vendorKey: string, verificationParameters: string): Promise<void> {
        return this.checkVendorResourceURL(resourceUrl).then(() => {
            this.injectAsString(resourceUrl, vendorKey);
            this.populateVendorKey(vendorKey);
            this._verificationResource = {
                resourceUrl: resourceUrl,
                vendorKey: vendorKey,
                verificationParameters: verificationParameters
            };

            if (vendorKey === 'IAS' && ProgrammaticTrackingService) {
                ProgrammaticTrackingService.reportMetricEvent(OMMetric.IASVerificatonInjected);
            }

            if (vendorKey.startsWith('doubleclickbygoogle.com') && this._campaign instanceof AdMobCampaign) {
                ProgrammaticTrackingService.reportMetricEvent(AdmobMetric.DoubleClickOMInjections);
            }

            return Promise.resolve();
        }).catch((e) => {
            this._core.Sdk.logDebug(`Could not load open measurement verification script: ${e}`);
            if (vendorKey === 'IAS' && ProgrammaticTrackingService) {
                ProgrammaticTrackingService.reportMetricEvent(OMMetric.IASVerificatonInjectionFailed);
            }
        });
    }

    // TODO: Remove as we now capture vendor key in constuctor
    public populateVendorKey(vendorKey: string) {
        this._vendorKey = vendorKey;
    }

    private checkVendorResourceURL(resourceUrl: string): Promise<void> {
        if (CustomFeatures.isUnsupportedOMVendor(resourceUrl)) {
            this.sendErrorEvent(VerificationReasonCode.VERIFICATION_RESOURCE_REJECTED);
            return Promise.reject('verification resource rejected');
        } else if (!Url.isValid(resourceUrl)) {
            this.sendErrorEvent(VerificationReasonCode.ERROR_RESOURCE_LOADING);
            return Promise.reject('verification resource is malformed');
        }

        return Promise.resolve();
    }

    private sendErrorEvent(reasonCode: VerificationReasonCode) {
        const adVerificationErrorURL = this._adVerification.getFormattedVerificationTrackingEvent(reasonCode);
        if (adVerificationErrorURL) {
            this._request.get(adVerificationErrorURL);
        }
    }

    public injectAsString(resourceUrl: string, vendorKey: string) {
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
