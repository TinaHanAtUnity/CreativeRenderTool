import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { VideoPlayerState, InteractionType, ISessionEvent, IImpressionValues, IVastProperties, OMID3pEvents, IViewPort, IAdView } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';

interface IOMController {
    impression(impressionValues: IImpressionValues): void;
    loaded(vastPropeties: IVastProperties): void;
    start(duration: number, videoPlayerVolume: number): void;
    sendFirstQuartile(): void;
    sendMidpoint(): void;
    sendThirdQuartile(): void;
    completed(): void;
    pause(): void;
    resume(): void;
    bufferStart(): void;
    bufferFinish(): void;
    skipped(): void;
    volumeChange(videoPlayerVolume: number): void;
    playerStateChanged(videoPlayerState: VideoPlayerState): void;
    adUserInteraction(interactionType: InteractionType): void;
    sessionStart(): void;
    sessionFinish(): void;
    sessionError(event: ISessionEvent): void;
}

export enum OMState {
    PLAYING,
    PAUSED,
    COMPLETED,
    STOPPED
}

export class OpenMeasurementController implements IOMController {

    private _state: OMState = OMState.STOPPED;
    private _deviceVolume: number;
    private _omAdViewBuilder: OpenMeasurementAdViewBuilder;

    protected _placement: Placement;
    protected _omInstances: OpenMeasurement[] = [];

    constructor(placement: Placement, omAdViewBuilder: OpenMeasurementAdViewBuilder, omInstances?: OpenMeasurement[]) {
        this._placement = placement;
        this._omAdViewBuilder = omAdViewBuilder;

        if (omInstances) {
            this._omInstances = omInstances;
        }
    }

    public getOMAdViewBuilder(): OpenMeasurementAdViewBuilder {
        return this._omAdViewBuilder;
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
    public sessionStart(sessionEvent?: ISessionEvent) {
        // this._omInstances.forEach((om) => {
        //     om.sessionStart(sessionEvent);
        // });
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

    public getState(): OMState {
        return this._state;
    }

    private setState(state: OMState): void {
        this._state = state;
    }
}
