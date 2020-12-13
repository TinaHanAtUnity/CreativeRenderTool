import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { SensorDelay } from 'Core/Constants/Android/SensorDelay';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Double } from 'Core/Utilities/Double';
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
import { StreamType } from 'Core/Constants/Android/StreamType';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
export class AdMobAdUnit extends AbstractAdUnit {
    constructor(parameters) {
        super(parameters);
        this._foregroundTime = 0;
        this._startTime = 0;
        this._requestToViewTime = 0;
        this._geometryCalled = false;
        this._operativeEventManager = parameters.operativeEventManager;
        this._view = parameters.view;
        this._options = parameters.options;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._operativeEventManager = parameters.operativeEventManager;
        this._keyDownListener = (kc) => this.onKeyDown(kc);
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._clientInfo = parameters.clientInfo;
        this._isRewardedPlacement = !parameters.placement.allowSkip();
        if (parameters.platform === Platform.ANDROID) {
            Promise.all([
                parameters.core.DeviceInfo.Android.getDeviceVolume(StreamType.STREAM_MUSIC),
                parameters.core.DeviceInfo.Android.getDeviceMaxVolume(StreamType.STREAM_MUSIC)
            ]).then(([volume, maxVolume]) => {
                this.setVolume(volume / maxVolume);
            });
        }
        else if (parameters.platform === Platform.IOS) {
            parameters.core.DeviceInfo.Ios.getDeviceVolume().then((volume) => {
                this.setVolume(volume);
            });
        }
        // TODO, we skip initial because the AFMA grantReward event tells us the video
        // has been completed. Is there a better way to do this with AFMA right now?
        this.setFinishState(this._isRewardedPlacement ? FinishState.SKIPPED : FinishState.COMPLETED);
    }
    show() {
        this._requestToViewTime = Date.now() - SdkStats.getAdRequestTimestamp();
        this.setShowing(true);
        if (this._isRewardedPlacement) {
            SDKMetrics.reportMetricEvent(AdmobMetric.AdmobRewardedVideoStart);
        }
        this.sendTrackingEvent(TrackingEvent.SHOW);
        if (this._platform === Platform.ANDROID) {
            this._ads.Android.AdUnit.onKeyDown.subscribe(this._keyDownListener);
        }
        this._container.addEventHandler(this);
        return this._container.open(this, ['webview'], true, this._forceOrientation, true, false, true, false, this._options).then(() => {
            this.onStart.trigger();
            if (this._startTime === 0) {
                this._startTime = Date.now();
            }
            this._foregroundTime = Date.now();
            this.startAccelerometerUpdates();
            this.showView();
        });
    }
    hide() {
        this.onHide();
        this.hideView();
        this._container.removeEventHandler(this);
        return this._container.close();
    }
    description() {
        return 'AdMob';
    }
    sendClickEvent() {
        this._ads.Listener.sendClickEvent(this._placement.getId());
        this.sendTrackingEvent(TrackingEvent.CLICK);
        this._operativeEventManager.sendClick(this.getOperativeEventParams());
        UserCountData.getClickCount(this._core).then((clickCount) => {
            if (typeof clickCount === 'number') {
                UserCountData.setClickCount(clickCount + 1, this._core);
            }
        }).catch(() => {
            Diagnostics.trigger('request_count_failure', {
                signal: 'requestCount'
            });
        });
    }
    sendVideoCanPlayEvent() {
        const omController = this._view.getOpenMeasurementController();
        if (omController) {
            omController.setDeviceVolume(this._deviceVolume);
        }
        this.sendPTSCanPlay();
    }
    sendVolumeChange(volume, maxVolume) {
        this.setVolume(volume / maxVolume);
        const omController = this._view.getOpenMeasurementController();
        if (omController) {
            // TODO: Add volume change for muted value 0
            omController.setDeviceVolume(this._deviceVolume);
            omController.volumeChange(this._view.getVideoPlayerVolume());
        }
    }
    sendStartEvent() {
        this.sendPTSStart();
        this._ads.Listener.sendStartEvent(this._placement.getId());
        this.sendTrackingEvent(TrackingEvent.START);
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
            this.onStartProcessed.trigger();
        });
    }
    sendSkipEvent() {
        if (this._isRewardedPlacement) {
            SDKMetrics.reportMetricEvent(AdmobMetric.AdmobUserSkippedRewardedVideo);
        }
        this.sendTrackingEvent(TrackingEvent.SKIP);
        this._operativeEventManager.sendSkip(this.getOperativeEventParams());
    }
    sendRewardEvent() {
        const params = this.getOperativeEventParams();
        this._operativeEventManager.sendThirdQuartile(params);
        this._operativeEventManager.sendView(params);
        this.sendTrackingEvent(TrackingEvent.COMPLETE);
        if (this._isRewardedPlacement) {
            SDKMetrics.reportMetricEvent(AdmobMetric.AdmobUserWasRewarded);
        }
    }
    sendOpenableIntentsResponse(response) {
        this._view.sendOpenableIntentsResponse(response);
    }
    getTimeOnScreen() {
        return Date.now() - this._foregroundTime;
    }
    getStartTime() {
        return this._startTime;
    }
    sendTrackingEvent(event, useWebviewUserAgentForTracking, headers) {
        return this._thirdPartyEventManager.sendTrackingEvents(this._campaign, event, 'admob', useWebviewUserAgentForTracking, headers);
    }
    sendClickSignalResponse(response) {
        this._view.sendClickSignalResponse(response);
    }
    sendMuteChange(isMuted) {
        this._view.sendMuteChange(isMuted);
    }
    getRequestToViewTime() {
        return this._requestToViewTime;
    }
    onContainerShow() {
        if (this._platform === Platform.IOS) {
            this._core.SensorInfo.Ios.startAccelerometerUpdates(new Double(0.01));
        }
    }
    onContainerForeground() {
        this._foregroundTime = Date.now();
        this.startAccelerometerUpdates();
        const omController = this._view.getOpenMeasurementController();
        if (omController && this.isShowing()) {
            const adViewBuilder = omController.getOMAdViewBuilder();
            const rect = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            const adView = adViewBuilder.buildAdmobAdView([], omController, rect);
            const viewPort = adViewBuilder.getViewPort();
            this.geometryChangeDebounce(viewPort, adView, omController);
        }
    }
    onContainerBackground() {
        this._core.SensorInfo.stopAccelerometerUpdates();
        if (this.isShowing() && CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
        const omController = this._view.getOpenMeasurementController();
        if (omController) {
            const adViewBuilder = omController.getOMAdViewBuilder();
            const rect = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            const adView = adViewBuilder.buildAdmobAdView([ObstructionReasons.BACKGROUNDED], omController, rect);
            const viewPort = adViewBuilder.getViewPort();
            this.geometryChangeDebounce(viewPort, adView, omController);
        }
    }
    geometryChangeDebounce(viewPort, adView, omController) {
        const later = () => {
            if (!this._geometryCalled) {
                omController.geometryChange(viewPort, adView);
                this._geometryCalled = true;
            }
        };
        later();
        setTimeout(() => this._geometryCalled = false, 500);
    }
    onContainerDestroy() {
        if (this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }
    onContainerSystemMessage(message) {
        // EMPTY
    }
    startAccelerometerUpdates() {
        if (this._platform === Platform.ANDROID) {
            this._core.SensorInfo.Android.startAccelerometerUpdates(SensorDelay.SENSOR_DELAY_FASTEST);
            this._ads.Android.AdUnit.startMotionEventCapture(10000);
        }
        else {
            this._core.SensorInfo.Ios.startAccelerometerUpdates(new Double(0.01));
        }
    }
    showView() {
        this._view.show();
        document.body.appendChild(this._view.container());
    }
    onHide() {
        this.setShowing(false);
        this._ads.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this.onClose.trigger();
        if (this._platform === Platform.ANDROID) {
            this._ads.Android.AdUnit.onKeyDown.unsubscribe(this._keyDownListener);
        }
        this._core.SensorInfo.stopAccelerometerUpdates();
        if (this._platform === Platform.ANDROID) {
            this._ads.Android.AdUnit.endMotionEventCapture();
            this._ads.Android.AdUnit.clearMotionEventCapture();
        }
        if (this.getFinishState() === FinishState.SKIPPED) {
            this.sendSkipEvent();
        }
    }
    getVolume() {
        return this._deviceVolume;
    }
    setVolume(volume) {
        this._deviceVolume = volume;
    }
    hideView() {
        this._view.hide();
        if (this._view.container()) {
            document.body.removeChild(this._view.container());
        }
    }
    onKeyDown(key) {
        if (key === 4 /* BACK */) {
            this._view.onBackPressed();
        }
    }
    getOperativeEventParams() {
        return {
            placement: this._placement
        };
    }
    sendPTSCanPlay() {
        // TODO: Add Tagging to remove the below logic
        SDKMetrics.reportMetricEvent(AdmobMetric.AdmobVideoCanPlay);
    }
    sendPTSStart() {
        // TODO: Add Tagging to remove the below logic
        SDKMetrics.reportMetricEvent(AdmobMetric.AdmobVideoStarted);
        if (this._view.getOpenMeasurementController()) {
            SDKMetrics.reportMetricEvent(AdmobMetric.AdmobOMVideoStart);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JBZFVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRNb2IvQWRVbml0cy9BZE1vYkFkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsY0FBYyxFQUFxQixNQUFNLDRCQUE0QixDQUFDO0FBRy9FLE9BQU8sRUFBMEIsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFNUYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFNUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQWtDLE1BQU0sb0RBQW9ELENBQUM7QUFReEgsTUFBTSxPQUFPLFdBQVksU0FBUSxjQUFjO0lBaUIzQyxZQUFZLFVBQWtDO1FBQzFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQVRkLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBQzVCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFDdkIsdUJBQWtCLEdBQVcsQ0FBQyxDQUFDO1FBSS9CLG9CQUFlLEdBQUcsS0FBSyxDQUFD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