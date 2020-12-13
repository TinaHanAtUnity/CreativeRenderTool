import { OMID3pEvents } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
export var OMState;
(function (OMState) {
    OMState[OMState["PLAYING"] = 0] = "PLAYING";
    OMState[OMState["PAUSED"] = 1] = "PAUSED";
    OMState[OMState["COMPLETED"] = 2] = "COMPLETED";
    OMState[OMState["STOPPED"] = 3] = "STOPPED";
})(OMState || (OMState = {}));
export class OpenMeasurementController {
    constructor(placement, omAdViewBuilder, omInstances) {
        this._state = OMState.STOPPED;
        this._omInstances = [];
        this._placement = placement;
        this._omAdViewBuilder = omAdViewBuilder;
        if (omInstances) {
            this._omInstances = omInstances;
        }
    }
    getOMAdViewBuilder() {
        return this._omAdViewBuilder;
    }
    impression(impressionValues) {
        this._omInstances.forEach((om) => {
            om.triggerAdEvent(OMID3pEvents.OMID_IMPRESSION, impressionValues);
        });
    }
    /**
     * Video-only event. The player has loaded and buffered the creative’s
     * media and assets either fully or to the extent that it is ready
     * to play the media. Corresponds to the VAST  loaded  event.
     */
    loaded(vastProperties) {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_LOADED, vastProperties);
        });
    }
    /**
     * start event
     * Video-only event. The player began playback of the video ad creative.
     * Corresponds to the VAST  start event.
     */
    start(duration) {
        if (this.getState() === OMState.STOPPED) {
            this.setState(OMState.PLAYING);
            this._omInstances.forEach((om) => {
                om.triggerVideoEvent(OMID3pEvents.OMID_START, {
                    duration: Math.trunc(duration / 1000),
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
    playerStateChanged(videoPlayerState) {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_PLAYER_STATE_CHANGE, { state: videoPlayerState });
        });
    }
    sendFirstQuartile() {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_FIRST_QUARTILE);
        });
    }
    sendMidpoint() {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_MIDPOINT);
        });
    }
    sendThirdQuartile() {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_THIRD_QUARTILE);
        });
    }
    completed() {
        this.setState(OMState.COMPLETED);
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_COMPLETE);
        });
    }
    pause() {
        if (this.getState() === OMState.PLAYING) {
            this.setState(OMState.PAUSED);
            this._omInstances.forEach((om) => {
                om.triggerVideoEvent(OMID3pEvents.OMID_PAUSE);
            });
        }
    }
    resume() {
        if (this.getState() !== OMState.STOPPED && this.getState() === OMState.PAUSED) {
            this.setState(OMState.PLAYING);
            this._omInstances.forEach((om) => {
                om.triggerVideoEvent(OMID3pEvents.OMID_RESUME);
            });
        }
    }
    skipped() {
        this.setState(OMState.STOPPED);
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_SKIPPED);
        });
    }
    setDeviceVolume(deviceVolume) {
        this._deviceVolume = deviceVolume;
    }
    getDeviceVolume() {
        return this._deviceVolume;
    }
    volumeChange(videoPlayerVolume) {
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
    adUserInteraction(interactionType) {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_AD_USER_INTERACTION, { interactionType: interactionType });
        });
    }
    // TODO: Not used at the moment
    bufferStart() {
        this._omInstances.forEach((om) => {
            om.triggerVideoEvent(OMID3pEvents.OMID_BUFFER_START);
        });
    }
    // TODO: Not used at the moment
    bufferFinish() {
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
    geometryChange(viewport, adView) {
        if (this.getState() !== OMState.STOPPED && (this.getState() === OMState.PAUSED || this.getState() === OMState.PLAYING)) {
            this._omInstances.forEach((om) => {
                om.triggerAdEvent(OMID3pEvents.OMID_GEOMETRY_CHANGE, { viewport, adView });
            });
        }
    }
    /**
     * SessionFinish:
     */
    sessionFinish() {
        this._omInstances.forEach((om) => {
            om.sessionFinish();
        });
    }
    /**
     * sessionError - Fired on in-video-session errors
     */
    sessionError(event, description) {
        event.data = {
            errorType: 'video',
            message: description
        };
        this._omInstances.forEach((om) => {
            om.getOmidBridge().triggerSessionEvent(event);
        });
    }
    getState() {
        return this._state;
    }
    setState(state) {
        this._state = state;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3Blbk1lYXN1cmVtZW50Q29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvT3Blbk1lYXN1cmVtZW50L09wZW5NZWFzdXJlbWVudENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUF3RixZQUFZLEVBQXNCLE1BQU0sb0RBQW9ELENBQUM7QUF5QjVMLE1BQU0sQ0FBTixJQUFZLE9BS1g7QUFMRCxXQUFZLE9BQU87SUFDZiwyQ0FBTyxDQUFBO0lBQ1AseUNBQU0sQ0FBQTtJQUNOLCtDQUFTLENBQUE7SUFDVCwyQ0FBTyxDQUFBO0FBQ1gsQ0FBQyxFQUxXLE9BQU8sS0FBUCxPQUFPLFFBS2xCO0FBRUQsTUFBTSxPQUFnQix5QkFBeUI7SUFTM0MsWUFBWSxTQUFvQixFQUFFLGVBQTZDLEVBQUUsV0FBeUM7UUFQbEgsV0FBTSxHQUFZLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFLaEMsaUJBQVksR0FBZ0MsRUFBRSxDQUFDO1FBR3JELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7UUFFeEMsSUFBSSxXQUFXLEVBQUU7WUFDYixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztTQUNuQztJQUNMLENBQUM7SUFFTSxrQkFBa0I7UUFDckIsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7SUFDakMsQ0FBQztJQUVNLFVBQVUsQ0FBQyxnQkFBbUM7UUFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUM3QixFQUFFLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksTUFBTSxDQUFDLGNB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