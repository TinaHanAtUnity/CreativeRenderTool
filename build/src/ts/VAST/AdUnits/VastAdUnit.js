import { VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { StreamType } from 'Core/Constants/Android/StreamType';
import { Platform } from 'Core/Constants/Platform';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
export class VastAdUnit extends VideoAdUnit {
    constructor(parameters) {
        super(parameters);
        this._muted = false;
        this._events = [[0, 'AdVideoStart'], [0.25, 'AdVideoFirstQuartile'], [0.5, 'AdVideoMidpoint'], [0.75, 'AdVideoThirdQuartile']];
        this._impressionSent = false;
        parameters.overlay.setSpinnerEnabled(!parameters.campaign.getVideo().isCached());
        this._endScreen = parameters.endScreen || null;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._vastCampaign = parameters.campaign;
        this._moat = MoatViewabilityService.getMoat();
        this._vastOMController = parameters.om;
        if (this._endScreen) {
            this._endScreen.render();
            this._endScreen.hide();
            document.body.appendChild(this._endScreen.container());
        }
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
    }
    show() {
        return super.show().then(() => {
            if (this.isShowing() && this.canShowVideo() && this._moat) {
                this._moat.play(this.getVolume());
            }
        });
    }
    hide() {
        // note: this timeout is required for the MOAT integration to function as expected
        return new Promise((resolve, reject) => {
            setTimeout(resolve, 500);
        }).then(() => {
            const endScreen = this.getEndScreen();
            if (endScreen) {
                endScreen.hide();
                endScreen.remove();
            }
            if (this._vastOMController) {
                this._vastOMController.removeFromViewHieararchy();
            }
            if (this._moat) {
                this._moat.removeMessageListener();
                const moatContainer = this._moat.container();
                if (moatContainer && moatContainer.parentElement) {
                    moatContainer.parentElement.removeChild(moatContainer);
                }
            }
            return super.hide();
        });
    }
    description() {
        return 'VAST';
    }
    getEvents() {
        return this._events;
    }
    setEvents(events) {
        this._events = events;
    }
    getVolume() {
        return this._volume;
    }
    setVolume(volume) {
        this._volume = volume;
    }
    setVideoPlayerMuted(muted) {
        this._muted = muted;
    }
    getVideoPlayerMuted() {
        return this._muted;
    }
    getEndScreen() {
        return this._endScreen;
    }
    sendTrackingEvent(eventName) {
        this._thirdPartyEventManager.sendTrackingEvents(this._vastCampaign, eventName, 'vast', this._vastCampaign.getUseWebViewUserAgentForTracking());
    }
    getOpenMeasurementController() {
        return this._vastOMController;
    }
    getVideoClickThroughURL() {
        const url = this._vastCampaign.getVast().getVideoClickThroughURL();
        if (this.isValidURL(url)) {
            return url;
        }
        else {
            return null;
        }
    }
    getCompanionClickThroughUrl() {
        const url = this._vastCampaign.getVast().getCompanionClickThroughUrl();
        if (this.isValidURL(url)) {
            return url;
        }
        else {
            return null;
        }
    }
    sendCompanionClickTrackingEvent(sessionId) {
        const companionClickTrackingUrls = this._vastCampaign.getVast().getCompanionClickTrackingUrls();
        for (const companionClickTrackingUrl of companionClickTrackingUrls) {
            this._thirdPartyEventManager.sendWithGet('vast companion click', sessionId, companionClickTrackingUrl, this._vastCampaign.getUseWebViewUserAgentForTracking());
        }
    }
    sendCompanionTrackingEvent(sessionId) {
        const companionTrackingUrls = this._vastCampaign.getVast().getCompanionCreativeViewTrackingUrls();
        for (const url of companionTrackingUrls) {
            this._thirdPartyEventManager.sendWithGet('companion', sessionId, url, this._vastCampaign.getUseWebViewUserAgentForTracking());
        }
    }
    sendVideoClickTrackingEvent(sessionId) {
        this.sendTrackingEvent(TrackingEvent.CLICK);
        const clickTrackingEventUrls = this._vastCampaign.getVast().getVideoClickTrackingURLs();
        if (clickTrackingEventUrls) {
            for (const clickTrackingEventUrl of clickTrackingEventUrls) {
                this._thirdPartyEventManager.sendWithGet('vast video click', sessionId, clickTrackingEventUrl, this._vastCampaign.getUseWebViewUserAgentForTracking());
            }
        }
    }
    onContainerBackground() {
        super.onContainerBackground();
        if (this.isShowing() && this.canShowVideo() && this._moat) {
            this._moat.pause(this.getVolume());
        }
        if (this.isShowing() && this.canShowVideo() && this._vastOMController) {
            this._vastOMController.pause();
            const adViewBuilder = this._vastOMController.getOMAdViewBuilder();
            if (!adViewBuilder.getVideoView()) {
                this.getVideoViewRectangle().then((rect) => {
                    const view = OpenMeasurementUtilities.createRectangle(rect[0], rect[1], rect[2], rect[3]);
                    if (this._platform === Platform.ANDROID) {
                        view.x = OpenMeasurementUtilities.pxToDp(view.x, this._deviceInfo);
                        view.y = OpenMeasurementUtilities.pxToDp(view.y, this._deviceInfo);
                        view.width = OpenMeasurementUtilities.pxToDp(view.width, this._deviceInfo);
                        view.height = OpenMeasurementUtilities.pxToDp(view.height, this._deviceInfo);
                    }
                    adViewBuilder.setVideoView(view);
                    const adView = adViewBuilder.buildVastAdView([ObstructionReasons.BACKGROUNDED]);
                    const viewPort = adViewBuilder.getViewPort();
                    if (this._vastOMController) {
                        this._vastOMController.geometryChange(viewPort, adView);
                    }
                });
            }
        }
    }
    onContainerForeground() {
        super.onContainerForeground();
        if (this.isShowing() && this.canShowVideo() && this._moat) {
            this._moat.play(this.getVolume());
        }
        if (this.isShowing() && this.canShowVideo() && this._vastOMController) {
            this._vastOMController.resume();
            const adViewBuilder = this._vastOMController.getOMAdViewBuilder();
            if (!adViewBuilder.getVideoView()) {
                this.getVideoViewRectangle().then((rect) => {
                    const view = OpenMeasurementUtilities.createRectangle(rect[0], rect[1], rect[2], rect[3]);
                    if (this._platform === Platform.ANDROID) {
                        view.x = OpenMeasurementUtilities.pxToDp(view.x, this._deviceInfo);
                        view.y = OpenMeasurementUtilities.pxToDp(view.y, this._deviceInfo);
                        view.width = OpenMeasurementUtilities.pxToDp(view.width, this._deviceInfo);
                        view.height = OpenMeasurementUtilities.pxToDp(view.height, this._deviceInfo);
                    }
                    adViewBuilder.setVideoView(view);
                    const adView = adViewBuilder.buildVastAdView([]);
                    const viewPort = adViewBuilder.getViewPort();
                    if (this._vastOMController) {
                        this._vastOMController.geometryChange(viewPort, adView);
                    }
                });
            }
        }
    }
    onVideoError() {
        const endScreen = this.getEndScreen();
        if (endScreen && this.hasImpressionOccurred()) {
            endScreen.show();
        }
        else {
            this.hide();
        }
    }
    setImpressionOccurred() {
        this._impressionSent = true;
    }
    hasImpressionOccurred() {
        return this._impressionSent;
    }
    isValidURL(url) {
        const reg = new RegExp('^(https?)://.+$');
        return !!url && reg.test(url);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL0FkVW5pdHMvVmFzdEFkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQTBCLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlFLE9BQU8sRUFBMEIsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDNUYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFOUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUluRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUN4RixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQVE5RixNQUFNLE9BQU8sVUFBVyxTQUFRLFdBQXlCO0lBV3JELFlBQVksVUFBaUM7UUFDekMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBUGQsV0FBTSxHQUFZLEtBQUssQ0FBQztRQUN4QixZQUFPLEdBQXVCLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQztRQUU5SSxvQkFBZSxHQUFHLEtBQUssQ0FBQztRQU01QixVQUFVLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRWpGLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUM7UUFDL0MsSUFBSSxDQUFD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