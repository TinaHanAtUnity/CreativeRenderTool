import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { OMID3pEvents, IVastProperties, InteractionType, IViewPort, IRectangle, ObstructionReasons, AdMobOmidEventBridge } from 'Ads/Views/OpenMeasurement/AdMobOmidEventBridge';
import { IImpressionValues, VideoPlayerState, IAdView, ISessionEvent, IVerificationScriptResource } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { Placement } from 'Ads/Models/Placement';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

enum OMState {
    PLAYING,
    PAUSED,
    COMPLETED,
    STOPPED
}

export class AdmobOpenMeasurementManager {

    private _omInstances: OpenMeasurement[] = [];
    private _state: OMState = OMState.STOPPED;
    private _deviceVolume: number;

    // only for admob:
    private _omBridge: AdMobOmidEventBridge;
    private _omAdSessionId: string;
    private _admobSlotElement: HTMLElement;
    private _admobVideoElement: HTMLElement;
    private _admobElementBounds: IRectangle;

    // base params:
    private _placement: Placement;
    private _platform: Platform;
    private _core: ICoreApi;
    private _clientInfo: ClientInfo;
    private _campaign: AdMobCampaign;
    private _deviceInfo: DeviceInfo;
    private _request: RequestManager;

    constructor(platform: Platform, core: ICoreApi, clientInfo: ClientInfo, campaign: AdMobCampaign, placement: Placement, deviceInfo: DeviceInfo, request: RequestManager) {
        this._platform = platform;
        this._core = core;
        this._clientInfo = clientInfo;
        this._campaign = campaign;
        this._placement = placement;
        this._deviceInfo = deviceInfo;
        this._request = request;

        this._omAdSessionId = JaegerUtilities.uuidv4();

        this._omBridge = new AdMobOmidEventBridge(core, {
            onImpression: (impressionValues: IImpressionValues) => this.impression(impressionValues),
            onLoaded: (vastProperties: IVastProperties) => this.loaded(vastProperties),
            onStart: (duration: number, videoPlayerVolume: number) => this.start(duration),
            onSendFirstQuartile: () => this.sendFirstQuartile(),
            onSendMidpoint: () =>  this.sendMidpoint(),
            onSendThirdQuartile: () => this.sendThirdQuartile(),
            onCompleted: () => this.completed(),
            onPause: () => this.pause(),
            onResume: () => this.resume(),
            onBufferStart: () => this.bufferStart(),
            onBufferFinish: () => this.bufferFinish(),
            onSkipped: () => this.skipped(),
            onVolumeChange: (videoPlayerVolume: number) => this.volumeChange(videoPlayerVolume),
            onPlayerStateChange: (playerState: VideoPlayerState) => this.playerStateChanged(playerState),
            onAdUserInteraction: (interactionType: InteractionType) => this.adUserInteraction(interactionType),
            onSlotElement: (element: HTMLElement) => { this._admobSlotElement = element; },
            onVideoElement: (element: HTMLElement) => { this._admobVideoElement = element; },
            onElementBounds: (elementBounds: IRectangle) => { this._admobElementBounds = elementBounds; },
            onInjectVerificationResources: (verifcationResources: IVerificationScriptResource[]) => this.injectVerificationResources(verifcationResources),
            onSessionStart: (sessionEvent: ISessionEvent) => this.sessionStart(),   // fired by us
            onSessionFinish: (sessionEvent: ISessionEvent) => this.sessionFinish(), // fired by us
            onSessionError: (sessionEvent: ISessionEvent) => this.sessionError(sessionEvent)
        }, this);
    }

    public getSlotElement(): HTMLElement {
        return this._admobSlotElement;
    }

    public getVideoElement(): HTMLElement {
        return this._admobVideoElement;
    }

    public getAdmobVideoElementBounds(): IRectangle {
        return this._admobElementBounds;
    }

    public getAdmobBridge(): AdMobOmidEventBridge {
        return this._omBridge;
    }

    public getSDKVersion() {
        return this._clientInfo.getSdkVersionName();
    }

    public injectVerificationResources(verificationResources: IVerificationScriptResource[]) {
        verificationResources.forEach((resource) => {
            const om = new OpenMeasurement(this._platform, this._core, this._clientInfo, this._campaign, this._placement, this._deviceInfo, this._request);
            this._omInstances.push(om);
            om.addToViewHierarchy();
            om.injectVerificationResources([resource]);
        });
    }

    public addToViewHierarchy(): void {
        this.addMessageListener();
    }

    public removeFromViewHieararchy(): void {
        this.removeMessageListener();
    }

    // only used above and test
    private addMessageListener() {
        if (this._omBridge) {
            this._omBridge.connect();
        }
    }

    // only used above and test
    private removeMessageListener() {
        if (this._omBridge) {
            this._omBridge.disconnect();
        }
    }

    // look at getting an individual session id from an om instance
    public getOMAdSessionId() {
        return this._omAdSessionId;
    }

    public impression(impressionValues: IImpressionValues) {
        this._omInstances.forEach((om) => {
            om.triggerAdEvent(OMID3pEvents.OMID_IMPRESSION, impressionValues);
        });
    }

    /**
     * Video-only event. The player has loaded and buffered the creative’s
     * media and assets either fully or to the extent that it is ready
     * to play the media. Corresponds to the VAST  loaded  event.
     */
    public loaded(vastProperties: IVastProperties) {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_LOADED, {vastProperties});
        });
    }

    /**
     * start event
     * Video-only event. The player began playback of the video ad creative.
     * Corresponds to the VAST  start event.
     */
    public start(duration: number) {
        if (this.getState() === OMState.STOPPED) {
            this.setState(OMState.PLAYING);

            this._omInstances.forEach((om) => {
                    om.triggerVideoEvent(OMID3pEvents.OMID_START, {
                    duration: duration,
                    videoPlayerVolume: this._placement.muteVideo() ? 0 : 1,
                    deviceVolume: this._deviceVolume
                });
            });
        }
    }

   /**
    * playerStateChanged
    * Assume NORMAL state at start
    * If playback begins when the player is in a "minimized" or "fullscreen" state
    * then this event is fired immediately following start in order to reflect the current state.
    */
    public playerStateChanged(videoPlayerState: VideoPlayerState) {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_PLAYER_STATE_CHANGE, { state: videoPlayerState });
        });
    }

    public sendFirstQuartile() {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_FIRST_QUARTILE);
        });
    }

    public sendMidpoint() {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_MIDPOINT);
        });
    }

    public sendThirdQuartile() {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_THIRD_QUARTILE);
        });
    }

    public completed() {
        this.setState(OMState.COMPLETED);
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_COMPLETE);
        });
    }

    public pause() {
        if (this.getState() === OMState.PLAYING) {
            this.setState(OMState.PAUSED);
            this._omInstances.forEach((om) => {
                om.triggerVideoEvent(OMID3pEvents.OMID_PAUSE);
            });
        }
    }

    public resume() {
        if (this.getState() !== OMState.STOPPED && this.getState() === OMState.PAUSED) {
            this.setState(OMState.PLAYING);
            this._omInstances.forEach((om) => {
                om.triggerVideoEvent(OMID3pEvents.OMID_RESUME);
            });
        }
    }

    public skipped() {
        this.setState(OMState.STOPPED);
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_SKIPPED);
        });
    }

    public setDeviceVolume(deviceVolume: number) {
        this._deviceVolume = deviceVolume;
    }

    public getDeviceVolume() {
        return this._deviceVolume;
    }

    public volumeChange(videoPlayerVolume: number) {
        if (this.getState() !== OMState.COMPLETED) {
            this._omInstances.forEach((om) => {
                    om.triggerVideoEvent(OMID3pEvents.OMID_VOLUME_CHANGE, {
                    videoPlayerVolume: videoPlayerVolume,
                    deviceVolume: this._deviceVolume
                });
            });
        }
    }

    /**
     * The user has interacted with the ad outside of any standard playback controls
     * (e.g. clicked the ad to load an ad landing page).
     */
    public adUserInteraction(interactionType: InteractionType) {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_AD_USER_INTERACTION, interactionType);
        });
    }

    // TODO: Not used at the moment
    public bufferStart() {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_BUFFER_START);
        });
    }

    // TODO: Not used at the moment
    public bufferFinish() {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_BUFFER_FINISH);
        });
    }

    /**
     * Must ensure this is only called once per background and foreground
     * Videos are in the STOPPED state before they begin playing and this gets called during the Foreground event
     * onContainerBackground and Foreground are subscribed to multiple events Activity.ts
     * Current Calculation Locations: VastAdUnit onContainerBackground, onContainerForeground
     * TODO: Calculate Geometry change for Privacy coverage
     */
    public geometryChange(viewPort: IViewPort, adView: IAdView) {
        if (this.getState() !== OMState.STOPPED && (this.getState() === OMState.PAUSED || this.getState() === OMState.PLAYING)) {
            this._omInstances.forEach((om) => {
                om.triggerAdEvent(OMID3pEvents.OMID_GEOMETRY_CHANGE, {viewPort, adView});
            });
        }
    }

    /*
    * SessionStart:
    * First event that MUST be fired for a session to begin
    * Has the necessary data to fill in the context and verificationParameters of the event data
    * If this is not fired prior to lifecycle events the lifecycle events will not be logged
    */
    public sessionStart() {
        this._omInstances.forEach((om) => {
            om.sessionStart();
        });
    }

    /**
     * SessionFinish:
     */
    public sessionFinish() {
        this._omInstances.forEach((om) => {
            om.sessionFinish();
        });
    }

    /**
     * sessionError - Fired on in-video-session errors
     */
    public sessionError(event: ISessionEvent, description?: string) {
        event.data = {
            errorType: 'video',
            message: description
        };

        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerSessionEvent(event);
        });
    }

    private getState(): OMState {
        return this._state;
    }

    private setState(state: OMState): void {
        this._state = state;
    }
}
