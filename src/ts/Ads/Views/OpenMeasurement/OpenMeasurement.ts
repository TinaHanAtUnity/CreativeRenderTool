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
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { AccessMode, IVerificationScriptResource, IImpressionValues, OMID3pEvents, IVastProperties, IViewPort, IAdView, ISessionEvent, SessionEvents, MediaType, VideoPosition, VideoEventAdaptorType, ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { ProgrammaticTrackingService, OMMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';

interface IVerificationVendorMap {
    [vendorKey: string]: string;
}

enum AdSessionType {
    NATIVE = 'native',
    HTML = 'html'
}

interface IOmidJsInfo {
    omidImplementor: string;
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

export class OpenMeasurement extends View<AdMobCampaign> {
    private _omIframe: HTMLIFrameElement;
    private _core: ICoreApi;
    private _clientInfo: ClientInfo;
    private _campaign: AdMobCampaign | VastCampaign;
    private _omBridge: OMIDEventBridge;
    private _request: RequestManager;
    private _omAdSessionId: string;

    private _verificationVendorMap: IVerificationVendorMap;
    private _vendorKeys: string[];
    private _placement: Placement;
    private _deviceInfo: DeviceInfo;

    private _sessionStartCalled = false;
    private _sessionFinishCalled = false;
    private _sessionStartProcessedByOmidScript = false;
    private _sessionFinishProcessedByOmidScript = false;
    private _adVerification: VastAdVerification;
    private _pts: ProgrammaticTrackingService | undefined;

    // GUID for running all current omid3p with same sessionid as session interface
    private _admobOMSessionId: string;

    constructor(platform: Platform, core: ICoreApi, clientInfo: ClientInfo, campaign: AdMobCampaign | VastCampaign, placement: Placement, deviceInfo: DeviceInfo, request: RequestManager, vendorKey: string | undefined, vastAdVerification?: VastAdVerification, pts?: ProgrammaticTrackingService) {
        super(platform, 'openMeasurement_' + (vendorKey ? vendorKey : DEFAULT_VENDOR_KEY));

        this._template = new Template(OMIDTemplate);

        this._omAdSessionId = JaegerUtilities.uuidv4();
        this._bindings = [];
        this._core = core;
        this._verificationVendorMap = {};
        this._clientInfo = clientInfo;
        this._campaign = campaign;
        this._vendorKeys = [];
        this._placement = placement;
        this._deviceInfo = deviceInfo;
        this._request = request;
        this._pts = pts;

        if (vastAdVerification) {
            this._adVerification = vastAdVerification;
        }

        this._omBridge = new OMIDEventBridge(core, {
            onEventProcessed: (eventType, vendor) => this.onEventProcessed(eventType, vendor)
        }, this._omIframe, this);
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
        this._omIframe.srcdoc = OMID3p.replace('{{ DEFAULT_KEY_ }}', DEFAULT_VENDOR_KEY);

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
     * TODO: Calculate Geometry change for Privacy coverage
     */
    public geometryChange(viewport: IViewPort, adView: IAdView) {
        this._omBridge.triggerAdEvent(OMID3pEvents.OMID_GEOMETRY_CHANGE, {viewport, adView});
    }

    /*
    * SessionStart:
    * First event that MUST be fired for a session to begin
    * Has the necessary data to fill in the context and verificationParameters of the event data
    * If this is not fired prior to lifecycle events the lifecycle events will not be logged
    */
    public sessionStart() {
        const event: ISessionEvent = {
            adSessionId: this.getOMAdSessionId(),
            timestamp: Date.now(),
            type: 'sessionStart',
            data: {}
        };
        this._sessionStartCalled = true;

        this._vendorKeys.forEach(vendorKey => {
            if (this._verificationVendorMap[vendorKey]) {
                event.data.verificationParameters = this._verificationVendorMap[vendorKey];
            }
            const contextData: IContext = this.buildSessionContext();
            event.data.context = contextData;
            event.data.vendorkey = vendorKey;

            this._omBridge.triggerSessionEvent(event);
        });
    }

    private buildSessionContext(): IContext {
        const contextData: IContext = {
            apiVersion: OMID_P,                                   // Version code of official OMID JS Verification Client API
            environment: 'app',                                   // OMID JS Verification Client API
            accessMode: AccessMode.LIMITED,                       // Verification code is executed in a sandbox with only indirect information about ad
            adSessionType: AdSessionType.NATIVE,
            omidNativeInfo: {
                partnerName: PARTNER_NAME,
                partnerVersion: this._clientInfo.getSdkVersionName()
            },
            omidJsInfo: {
                omidImplementor: PARTNER_NAME,
                serviceVersion: this._clientInfo.getSdkVersionName(),
                sessionClientVersion: OMID_P,
                partnerName: PARTNER_NAME,
                partnerVersion: this._clientInfo.getSdkVersionName()
            },
            app: {
                libraryVersion: '1.0.0',
                appId: this._clientInfo.getApplicationName()
            },
            deviceInfo: {
                deviceType: this._deviceInfo.getModel(),
                os: Platform[this._platform].toLowerCase(),
                osVersion: this._deviceInfo.getOsVersion()
            },
            supports: ['vlid', 'clid']
        };

        if (contextData.accessMode === AccessMode.FULL) {
            contextData.videoElement = document.querySelector('video');
        }

        return contextData;
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

            if (vendorKey === 'IAS' && this._pts) {
                this._pts.reportMetricEvent(OMMetric.IASVerificationSessionStarted);
            }

            if (this._campaign instanceof VastCampaign) {
                return this.sendVASTStartEvents(vendorKey);
            }
        }

        if (eventType === SessionEvents.SESSION_FINISH) {
            this._sessionFinishProcessedByOmidScript = true;
            if (vendorKey === 'IAS' && this._pts) {
                this._pts.reportMetricEvent(OMMetric.IASVerificationSessionFinished);
            }
            // IAB recommended -> Set a 1 second timeout to allow the Complete and AdSessionFinishEvent calls
            // to reach server before removing the Verification Client from the DOM
            window.setTimeout(() => this.removeFromViewHieararchy(), 1000);
        }

        if (eventType === 'loadError') {
            this.sendErrorEvent(VerificationReasonCode.ERROR_RESOURCE_LOADING);
        }

        if (eventType === 'vendorkeyMismatch') {
            this._core.Sdk.logDebug('Vendor attribute was either never registered or vendor attribute does not match registered key. SessionStart not called.');
        }

        if (eventType === 'sessionRegistered') {
            if (this._campaign instanceof AdMobCampaign) {
                this._omBridge.sendQueuedEvents();
            }
        }

        return Promise.resolve();
    }

    private sendVASTStartEvents(vendorKey?: string): Promise<void> {
            let IASScreenWidth = 0;
            let IASScreenHeight = 0;

            return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {
                const measuringElementAvailable = true;
                IASScreenWidth = screenWidth;
                IASScreenHeight = screenHeight;
                this.impression(this.buildVastImpressionValues(MediaType.VIDEO, AccessMode.LIMITED, screenWidth, screenHeight, measuringElementAvailable));

                if (vendorKey === 'IAS') {
                    this.sendIASEvents(IASScreenWidth, IASScreenHeight);
                } else {
                    this.loaded({
                        isSkippable: this._placement.allowSkip(),
                        skipOffset: this._placement.allowSkipInSeconds(),
                        isAutoplay: true,                   // Always autoplay for video
                        position: VideoPosition.STANDALONE  // Always standalone video
                    });
                }
            });
    }

    private sendIASEvents(IASScreenWidth: number, IASScreenHeight: number) {
        window.setTimeout(() => {
            const viewPort = OpenMeasurementUtilities.calculateViewPort(IASScreenWidth, IASScreenHeight);
            const adView = OpenMeasurementUtilities.calculateVastAdView(100, [], IASScreenWidth, IASScreenHeight, true, []);

            // must be called before geometry change to avoid re-queueing and calling geometry change twice
            this._omBridge.sendQueuedEvents();

            this.geometryChange(viewPort, adView);

            // must be called after geometry change for IAS because they don't register other ad events until after it is called
            this.loaded({
                isSkippable: this._placement.allowSkip(),
                skipOffset: this._placement.allowSkipInSeconds(),
                isAutoplay: true,                   // Always autoplay for video
                position: VideoPosition.STANDALONE  // Always standalone video
            });
        }, 1000);
    }

    private buildVastImpressionValues(mediaTypeValue: MediaType, accessMode: AccessMode, screenWidth: number, screenHeight: number, measuringElementAvailable: boolean): IImpressionValues {
        const impressionObject: IImpressionValues = {
            mediaType: mediaTypeValue
        };

        if (mediaTypeValue === MediaType.VIDEO) {
            impressionObject.videoEventAdaptorType = VideoEventAdaptorType.JS_CUSTOM;
            impressionObject.videoEventAdaptorVersion = OMID_P;
        }

        if (accessMode === AccessMode.LIMITED) {
            impressionObject.viewport = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);
            const screenRectangle = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);

            let percentageInView = 100;
            if (OpenMeasurementUtilities.VideoViewRectangle) {
                percentageInView = OpenMeasurementUtilities.calculateObstructionOverlapPercentage(OpenMeasurementUtilities.VideoViewRectangle, screenRectangle);
            }
            const obstructionReasons: ObstructionReasons[] = [];
            if (percentageInView < 100) {
                obstructionReasons.push(ObstructionReasons.HIDDEN);
            }
            impressionObject.adView = OpenMeasurementUtilities.calculateVastAdView(percentageInView, obstructionReasons, screenWidth, screenHeight, measuringElementAvailable, []);
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
            this._verificationVendorMap[vendorKey] = verificationParameters;

            if (vendorKey === 'IAS' && this._pts) {
                this._pts.reportMetricEvent(OMMetric.IASVerificatonInjected);
            }

            return Promise.resolve();
        }).catch((e) => {
            this._core.Sdk.logDebug(`Could not load open measurement verification script: ${e}`);
            if (vendorKey === 'IAS' && this._pts) {
                this._pts.reportMetricEvent(OMMetric.IASVerificatonInjectionFailed);
            }
        });
    }

    public populateVendorKey(vendorKey: string) {
        this._vendorKeys.push(vendorKey);
    }

    private checkVendorResourceURL(resourceUrl: string): Promise<void> {
        if (CustomFeatures.isUnsupportedOMVendor(resourceUrl)) {
            this.sendErrorEvent(VerificationReasonCode.VERIFICATION_RESOURCE_REJECTED);
            return Promise.reject('verification resource rejected');
        } else if (!resourceUrl.includes('.js')) {
            this.sendErrorEvent(VerificationReasonCode.VERIFICATION_NOT_SUPPORTED);
            return Promise.reject('verification resource not supported');
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