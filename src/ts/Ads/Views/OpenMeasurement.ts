import OMID3p from 'html/omid/omid3p.html';
import OMIDContainer from 'html/omid/container.html';
import OMIDTemplate from 'html/OMID.html';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { View } from 'Core/Views/View';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { OMIDEventBridge, IImpressionValues, IVastProperties, VideoPlayerState, InteractionType, ISessionEvent, IVerificationScriptResource, IViewPort, IAdView, VideoPosition, ObstructionReasons, MediaType, AccessMode, VideoEventAdaptorType, IRectangle, OMID3pEvents, SESSIONEvents } from 'Ads/Views/OMIDEventBridge';
import { Template } from 'Core/Utilities/Template';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { VerificationReasonCode, VastAdVerification } from 'VAST/Models/VastAdVerification';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';

interface IVerifationVendorMap {
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
    omidNativeInfo?: {};
    omidJsInfo: IOmidJsInfo;
    app?: IApp;
    deviceInfo: IDeviceInfo;
    supports: string[];
    customReferenceData?: string;
}

enum OMState {
    PLAYING,
    PAUSED,
    COMPLETED,
    STOPPED
}

export const OMID_P = 'Unity/1.2.10';
export const SDK_APIS = '7';

export class OpenMeasurement extends View<AdMobCampaign> {
    private _omIframe: HTMLIFrameElement;
    private _core: ICoreApi;
    private _clientInfo: ClientInfo;
    private _campaign: Campaign;
    private _omBridge: OMIDEventBridge;
    private _request: RequestManager;

    private _verificationVendorMap: IVerifationVendorMap;
    private _vendorKeys: string[];
    private _useOmidForWeb = false;
    private _state: OMState = OMState.STOPPED;
    private _placement: Placement;
    private _deviceInfo: DeviceInfo;
    private _sessionId: string;

    private _videoDuration: number;
    private _startVolume: number;
    private _sessionStartCalled = false;
    private _adVerifications: VastAdVerification[];

    constructor(platform: Platform, core: ICoreApi, clientInfo: ClientInfo, campaign: Campaign, placement: Placement, deviceInfo: DeviceInfo, request: RequestManager, vastAdVerifications: VastAdVerification[]) {
        super(platform, 'openMeasurement');
        this._template = new Template(OMIDTemplate);
        this._bindings = [];
        this._core = core;
        this._verificationVendorMap = {};
        this._clientInfo = clientInfo;
        this._campaign = campaign;
        this._vendorKeys = [];
        this._placement = placement;
        this._deviceInfo = deviceInfo;
        this._request = request;
        this._sessionId = this._campaign.getSession().getId();
        this._adVerifications = vastAdVerifications;

        this._omBridge = new OMIDEventBridge(core, {
            onImpression: (impressionValues) => this.impression(impressionValues),
            onLoaded: (vastProperties) => this.loaded(vastProperties),
            onStart: (duration, videoPlayerVolume) => this.start(duration, videoPlayerVolume),
            onSendFirstQuartile: () => this.sendFirstQuartile(),
            onSendMidpoint: () =>  this.sendMidpoint(),
            onSendThirdQuartile: () => this.sendThirdQuartile(),
            onCompleted: () => this.completed(),
            onPause: () => this.pause(),
            onResume: () => this.resume(),
            onBufferStart: () => this.bufferStart(),
            onBufferFinish: () => this.bufferFinish(),
            onSkipped: () => this.skipped(),
            onVolumeChange: (videoPlayerVolume) => this.volumeChange(videoPlayerVolume),
            onPlayerStateChange: (playerState) => this.playerStateChanged(playerState),
            onAdUserInteraction: (interactionType) => this.adUserInteraction(interactionType),
            onSessionStart: (sessionEvent) => this.sessionStart(sessionEvent),
            onSessionError: (sessionEvent) => this.sessionError(sessionEvent),
            onSessionFinish: (sessionEvent) => this.sessionFinish(sessionEvent),
            onInjectVerificationResources: (verifcationResources) => this.injectVerificationResources(verifcationResources),
            onPopulateVendorKey: (vendorKey) => this.populateVendorKey(vendorKey),
            onEventProcessed: (eventType) => this.onEventProcessed(eventType)
        }, this._omIframe, this._sessionId);

        if (this._useOmidForWeb) {
            this._omBridge.sendSDKVersion(this._clientInfo.getSdkVersionName());
            this._omBridge.sendSessionId(this._sessionId);
        }
    }

    public addToViewHierarchy(): void {
        this.render();
        this.addMessageListener();
        document.body.appendChild(this.container());
    }

    public removeFromViewHieararchy(): void {
        this.removeMessageListener();
        document.body.removeChild(this.container());
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
        const verificationResources: IVerificationScriptResource[] = this.setUpVerificationResources(this._adVerifications);
        return this.injectVerificationResources(verificationResources);
    }

    public render(): void {
        super.render();
        this._omIframe = <HTMLIFrameElement>this._container.querySelector('#omid-iframe');
        this._omIframe.srcdoc = OMID3p;

        if (this._useOmidForWeb) {
            this._omIframe.srcdoc += OMIDContainer;
        }
        this._omBridge.setIframe(this._omIframe);
    }

    public impression(impressionValues: IImpressionValues) {
        this._omBridge.triggerAdEvent(OMID3pEvents.OMID_IMPRESSION, impressionValues);
    }

    /*
     * Video-only event. The player has loaded and buffered the creative’s
     * media and assets either fully or to the extent that it is ready
     * to play the media. Corresponds to the VAST  loaded  event.
     */
    public loaded(vastProperties: IVastProperties) {
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_LOADED, {vastProperties});
    }

    /**
     * start event
     * Video-only event. The player began playback of the video ad creative.
     * Corresponds to the VAST  start event.
     */
    public start(duration: number, videoPlayerVolume: number) {
        this._videoDuration = duration;
        this._startVolume = videoPlayerVolume;
        if (this.getState() === OMState.STOPPED && this._sessionStartCalled) {
            this.setState(OMState.PLAYING);
            this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_START, {duration, videoPlayerVolume});
        }
    }

   /**
    * playerStateChanged
    * Assume NORMAL state at start
    * If playback begins when the player is in a "minimized" or "fullscreen" state
    * then this event is fired immediately following start in order to reflect the current state.
    */
    public playerStateChanged(videoPlayerState: VideoPlayerState) {
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_PLAYER_STATE_CHANGE, { state: videoPlayerState });
    }

    public sendFirstQuartile() {
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_FIRST_QUARTILE);
    }

    public sendMidpoint() {
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_MIDPOINT);
    }

    public sendThirdQuartile() {
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_THIRD_QUARTILE);
    }

    public completed() {
        this.setState(OMState.COMPLETED);
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_COMPLETE);
    }

    public pause() {
        if(this.getState() === OMState.PLAYING) {
            this.setState(OMState.PAUSED);
            this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_PAUSE);
        }
    }

    public resume() {
        if(this.getState() !== OMState.STOPPED && this.getState() === OMState.PAUSED) {
            this.setState(OMState.PLAYING);
            this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_RESUME);
        }
    }

    public skipped() {
        this.setState(OMState.STOPPED);
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_SKIPPED);
    }

    public volumeChange(videoPlayerVolume: number) {
        if(this.getState() !== OMState.COMPLETED) {
            this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_VOLUME_CHANGE, {videoPlayerVolume});
        }
    }

    /*
    * The user has interacted with the ad outside of any standard playback controls
    * (e.g. clicked the ad to load an ad landing page).
    */
    public adUserInteraction(interactionType: InteractionType) {
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_AD_USER_INTERACTION, interactionType);
    }

    // Not used at the moment because vast is not streamed
    public bufferStart() {
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_BUFFER_START);
    }

    // Not used at the moment because vast is not streamed
    public bufferFinish() {
        this._omBridge.triggerVideoEvent(OMID3pEvents.OMID_BUFFER_FINISH);
    }

    /*
    * Must ensure this is only called once per background and foreground
    * Videos are in the STOPPED state before they begin playing and this gets called during the Foreground event
    * onContainerBackground and Foreground are subscribed to multiple events Activity.ts
    * Current Calculation Locations: VastAdUnit onContainerBackground, onContainerForeground
    * TODO: Calculate Geometry change for Privacy coverage
    */
    public geometryChange(viewPort: IViewPort, adView: IAdView) {
        if(this.getState() !== OMState.STOPPED && (this.getState() === OMState.PAUSED || this.getState() === OMState.PLAYING)) {
            this._omBridge.triggerAdEvent(OMID3pEvents.OMID_GEOMETRY_CHANGE, {viewPort, adView});
        }
    }

    /*
    * SessionStart:
    * First event that MUST be fired for a session to begin
    * Has the necessary data to fill in the context and verificationParameters of the event data
    * If this is not fired prior to lifecycle events the lifecycle events will not be logged
    */
    public sessionStart(event: ISessionEvent) {
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
            adSessionType: AdSessionType.HTML,
            omidJsInfo: {
                omidImplementor: 'Unity',
                serviceVersion: this._clientInfo.getSdkVersionName(),
                sessionClientVersion: OMID_P,
                partnerName: 'Unity',
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
    public sessionFinish(event: ISessionEvent) {
        this._omBridge.triggerSessionEvent(event);
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

    public calculateViewPort(screenWidth: number, screenHeight: number): IViewPort {
        return {
            width: screenWidth,
            height: screenHeight
        };
    }

    /*
    * All AdViews will assume fullscreen interstitial video
    * so onscreen geometry, onscreencontainer geometry, and container geometry will be the same as geometry and have [0,0] origin
    */
    public calculateVastAdView(percentInView: number, obstructionReasons: ObstructionReasons[], screenWidth: number, screenHeight: number, measuringElementAvailable: boolean, obstructionRectangles: IRectangle[]): IAdView {
        const adView: IAdView = {
            percentageInView: percentInView,
            geometry: {
                x: 0,
                y: 0,
                width: screenWidth,
                height: screenHeight
            },
            onScreenGeometry: {
                x: 0,
                y: 0,
                width: screenWidth,
                height: screenHeight,
                obstructions: obstructionRectangles
            },
            measuringElement: measuringElementAvailable,
            reasons: obstructionReasons
        };

        /*
        * Only provided if both the native-layer ad view and web-layer
        * ad element exist and are available for measurement
        */
        if (measuringElementAvailable) {
            adView.containerGeometry = {
                x: 0,
                y: 0,
                width: screenWidth,
                height: screenHeight
            };
            adView.onScreenContainerGeometry = {
                x: 0,
                y: 0,
                width: screenWidth,
                height: screenHeight,
                obstructions: []
            };
        }

        return adView;
    }

    /*
    * Used to ensure OMID#SessionStart is fired prior to video playback events
    * Used to ensure DOM is removed prior to OMID#SessionFinish
    */
    public onEventProcessed(eventType: string) {
        if (eventType === SESSIONEvents.SESSION_START) {

            this._sessionStartCalled = true;

            this.loaded({
                isSkippable: this._placement.allowSkip(),
                skipOffset: this._placement.allowSkipInSeconds(),
                isAutoplay: true,                   // Always autoplay for video
                position: VideoPosition.STANDALONE  // Always standalone video
            });

            Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {
                this.impression(this.buildVastImpressionValues(MediaType.VIDEO, AccessMode.LIMITED, screenWidth, screenHeight, true));
            });
        }

        if (eventType === SESSIONEvents.SESSION_FINISH) {
            this.removeFromViewHieararchy();
        }

        if (eventType === 'loadError') {
            this.sendErrorEvent(VerificationReasonCode.ERROR_RESOURCE_LOADING);
        }
    }

    public buildVastImpressionValues(mediaTypeValue: MediaType, accessMode: AccessMode, screenWidth: number, screenHeight: number, measuringElementAvailable: boolean): IImpressionValues {
        const impressionObject: IImpressionValues = {
            mediaType: mediaTypeValue
        };

        if (mediaTypeValue === MediaType.VIDEO) {
            impressionObject.videoEventAdaptorType = VideoEventAdaptorType.JS_CUSTOM;
            impressionObject.videoEventAdaptorVersion = OMID_P;
        }

        if (accessMode === AccessMode.LIMITED) {
            impressionObject.viewPort = this.calculateViewPort(screenWidth, screenHeight);
            impressionObject.adView = this.calculateVastAdView(100, [], screenWidth, screenHeight, measuringElementAvailable, []);
        }

        return impressionObject;
    }

    private getState(): OMState {
        return this._state;
    }

    private setState(state: OMState): void {
        this._state = state;
    }

    private setUpVerificationResources(verifications: VastAdVerification[]): IVerificationScriptResource[] {
        const verificationResources: IVerificationScriptResource[] = [];

        /*
        * This assumes that each VastAdverification has a VerificationResource and a Vendor
        * Both are required by the VAST spec
        */
        verifications.forEach((verification) => {
            const verificationResource: IVerificationScriptResource = {
                // There will only ever be one verification resource per verification. TODO: update model
                resourceUrl: verification.getVerficationResources()[0].getResourceUrl(),
                vendorKey: verification.getVerificationVendor(),
                verificationParameters: verification.getVerificationParameters()
            };
            verificationResources.push(verificationResource);
        });
        return verificationResources;
    }

    public injectVerificationResources(verificationResources: IVerificationScriptResource[]): Promise<void> {
        verificationResources.forEach((resource) => {
            return this.injectResourceIntoDom(resource.resourceUrl, resource.vendorKey, resource.verificationParameters!);
        });

        return Promise.resolve();
    }

    private injectResourceIntoDom(resourceUrl: string, vendorKey: string, verificationParameters: string): Promise<void> {
        return this.checkVendorResourceURL(resourceUrl).then(() => {
            this.injectAsString(resourceUrl, vendorKey);
            this.populateVendorKey(vendorKey);
            this._verificationVendorMap[vendorKey] = verificationParameters;
            return Promise.resolve();
        }).catch((e) => {
            this._core.Sdk.logDebug(`Could not load open measurement verification script: ${e}`);
        });
    }

    public populateVendorKey(vendorKey: string) {
        this._vendorKeys.push(vendorKey);
    }

    private checkVendorResourceURL(resourceUrl: string): Promise<void> {
        if (CustomFeatures.isUnsupportedOMVendor(resourceUrl)) {
            this.sendErrorEvent(VerificationReasonCode.VERIFICATION_RESOURCE_REJECTED);
            return Promise.reject('verification resource rejected');
        } else if (!resourceUrl.endsWith('.js')) {
            this.sendErrorEvent(VerificationReasonCode.VERIFICATION_NOT_SUPPORTED);
            return Promise.reject('verification resource not supported');
        } else if (!Url.isValid(resourceUrl)) {
            this.sendErrorEvent(VerificationReasonCode.ERROR_RESOURCE_LOADING);
            return Promise.reject('verification resource is malformed');
        }

        return Promise.resolve();
    }

    private sendErrorEvent(reasonCode: VerificationReasonCode) {
        const adVerificationErrorURL = this._adVerifications[0].getFormattedVerificationTrackingEvent(reasonCode);
        if (adVerificationErrorURL) {
            this._request.get(adVerificationErrorURL);
        }
    }

    public injectAsString(resourceUrl: string, vendorKey: string) {
        let scriptTag = `<script id='verificationScript#${vendorKey}' src='${resourceUrl}' onerror='window.omid3p.postback("onEventProcessed", {
            eventType: "loadError"
        })'><`;
        scriptTag += '/script>';  // prevents needing escape char
        this._omIframe.srcdoc += scriptTag;
    }
}