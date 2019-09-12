import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { OMID3pEvents, IVastProperties, InteractionType, IViewPort, IRectangle, ObstructionReasons } from 'Ads/Views/OpenMeasurement/AdMobOmidEventBridge';
import { IImpressionValues, VideoPlayerState, IAdView, ISessionEvent } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { Placement } from 'Ads/Models/Placement';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';

enum OMState {
    PLAYING,
    PAUSED,
    COMPLETED,
    STOPPED
}

export class OpenMeasurementManager {

    private _omInstances: OpenMeasurement[];
    private _state: OMState = OMState.STOPPED;
    private _placement: Placement;
    private _deviceVolume: number;
    private _omAdSessionId: string;

    constructor(omInstances: OpenMeasurement[], placement: Placement) {
        this._omInstances = omInstances;
        this._placement = placement;
        this._omAdSessionId = JaegerUtilities.uuidv4();
    }

    public addToViewHierarchy(): void {
        this._omInstances.forEach((om) => {
            om.addToViewHierarchy();
        });
    }

    public removeFromViewHieararchy(): void {
        this._omInstances.forEach((om) => {
            om.removeFromViewHieararchy();
        });
    }

    public injectVerifications(): void {
        this._omInstances.forEach((om) => {
            om.injectAdVerifications();
        });
    }

    public getOMAdSessionId() {
        return this._omAdSessionId;
    }

    public impression(impressionValues: IImpressionValues) {
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerAdEvent(OMID3pEvents.OMID_IMPRESSION, impressionValues);
        });
    }

    /**
     * Video-only event. The player has loaded and buffered the creative’s
     * media and assets either fully or to the extent that it is ready
     * to play the media. Corresponds to the VAST  loaded  event.
     */
    public loaded(vastProperties: IVastProperties) {
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_LOADED, {vastProperties});
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
                    om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_START, {
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
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_PLAYER_STATE_CHANGE, { state: videoPlayerState });
        });
    }

    public sendFirstQuartile() {
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_FIRST_QUARTILE);
        });
    }

    public sendMidpoint() {
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_MIDPOINT);
        });
    }

    public sendThirdQuartile() {
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_THIRD_QUARTILE);
        });
    }

    public completed() {
        this.setState(OMState.COMPLETED);
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_COMPLETE);
        });
    }

    public pause() {
        if (this.getState() === OMState.PLAYING) {
            this.setState(OMState.PAUSED);
            this._omInstances.forEach((om) => {
                om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_PAUSE);
            });
        }
    }

    public resume() {
        if (this.getState() !== OMState.STOPPED && this.getState() === OMState.PAUSED) {
            this.setState(OMState.PLAYING);
            this._omInstances.forEach((om) => {
                om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_RESUME);
            });
        }
    }

    public skipped() {
        this.setState(OMState.STOPPED);
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_SKIPPED);
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
                    om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_VOLUME_CHANGE, {
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
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_AD_USER_INTERACTION, interactionType);
        });
    }

    // TODO: Not used at the moment
    public bufferStart() {
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_BUFFER_START);
        });
    }

    // TODO: Not used at the moment
    public bufferFinish() {
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerVideoEvent(OMID3pEvents.OMID_BUFFER_FINISH);
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
                om.getOmidBridge().triggerAdEvent(OMID3pEvents.OMID_GEOMETRY_CHANGE, {viewPort, adView});
            });
        }
    }

    /*
    * SessionStart:
    * First event that MUST be fired for a session to begin
    * Has the necessary data to fill in the context and verificationParameters of the event data
    * If this is not fired prior to lifecycle events the lifecycle events will not be logged
    */
    public sessionStart(event: ISessionEvent) {
        this._omInstances.forEach((om) => {
            om.sessionStart(event);
        });
    }

    /**
     * SessionFinish:
     */
    public sessionFinish(event: ISessionEvent) {
        this._omInstances.forEach((om) => {
            om.sessionFinish(event);
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
