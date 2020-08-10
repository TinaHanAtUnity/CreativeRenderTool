import { IVideoAdUnitParameters, VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { MOAT } from 'Ads/Views/MOAT';
import { StreamType } from 'Core/Constants/Android/StreamType';
import { Platform } from 'Core/Constants/Platform';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

export interface IVastAdUnitParameters extends IVideoAdUnitParameters<VastCampaign> {
    endScreen?: VastEndScreen;
    om?: VastOpenMeasurementController;
}

export class VastAdUnit extends VideoAdUnit<VastCampaign> {
    private _endScreen: VastEndScreen | null;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _moat?: MOAT;
    private _volume: number;
    private _muted: boolean = false;
    private _events: [number, string][] = [[0, 'AdVideoStart'], [0.25, 'AdVideoFirstQuartile'], [0.5, 'AdVideoMidpoint'], [0.75, 'AdVideoThirdQuartile']];
    private _vastCampaign: VastCampaign;
    private _impressionSent = false;
    private _vastOMController?: VastOpenMeasurementController;

    constructor(parameters: IVastAdUnitParameters) {
        super(parameters);

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
                parameters.core.DeviceInfo.Android!.getDeviceVolume(StreamType.STREAM_MUSIC),
                parameters.core.DeviceInfo.Android!.getDeviceMaxVolume(StreamType.STREAM_MUSIC)
            ]).then(([volume, maxVolume]) => {
                this.setVolume(volume / maxVolume);
            });
        } else if (parameters.platform === Platform.IOS) {
            parameters.core.DeviceInfo.Ios!.getDeviceVolume().then((volume) => {
                this.setVolume(volume);
            });
        }
    }

    public show() {
        return super.show().then(() => {
            if (this.isShowing() && this.canShowVideo() && this._moat) {
                this._moat.play(this.getVolume());
            }
        });
    }

    public hide(): Promise<void> {
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

    public description(): string {
        return 'VAST';
    }

    public getEvents() {
        return this._events;
    }

    public setEvents(events: [number, string][]) {
        this._events = events;
    }

    public getVolume() {
        return this._volume;
    }

    public setVolume(volume: number) {
        this._volume = volume;
    }

    public setVideoPlayerMuted(muted: boolean) {
        this._muted = muted;
    }

    public getVideoPlayerMuted() {
        return this._muted;
    }

    public getEndScreen(): VastEndScreen | null {
        return this._endScreen;
    }

    public sendTrackingEvent(eventName: TrackingEvent): void {
        this._thirdPartyEventManager.sendTrackingEvents(this._vastCampaign, eventName, 'vast', this._vastCampaign.getUseWebViewUserAgentForTracking());
    }

    public getOpenMeasurementController(): VastOpenMeasurementController | undefined {
        return this._vastOMController;
    }

    public getVideoClickThroughURL(): string | null {
        const url = this._vastCampaign.getVast().getVideoClickThroughURL();
        if (this.isValidURL(url)) {
            return url;
        } else {
            return null;
        }
    }

    public getCompanionClickThroughUrl(): string | null {
        const url = this._vastCampaign.getVast().getCompanionClickThroughUrl();
        if (this.isValidURL(url)) {
            return url;
        } else {
            return null;
        }
    }

    public sendCompanionClickTrackingEvent(sessionId: string): void {
        const companionClickTrackingUrls = this._vastCampaign.getVast().getCompanionClickTrackingUrls();
        for (const companionClickTrackingUrl of companionClickTrackingUrls) {
            this._thirdPartyEventManager.sendWithGet('vast companion click', sessionId, companionClickTrackingUrl, this._vastCampaign.getUseWebViewUserAgentForTracking());
        }
    }

    public sendCompanionTrackingEvent(sessionId: string): void {
        const companionTrackingUrls = this._vastCampaign.getVast().getCompanionCreativeViewTrackingUrls();
        for (const url of companionTrackingUrls) {
            this._thirdPartyEventManager.sendWithGet('companion', sessionId, url, this._vastCampaign.getUseWebViewUserAgentForTracking());
        }
    }

    public sendVideoClickTrackingEvent(sessionId: string): void {
        this.sendTrackingEvent(TrackingEvent.CLICK);

        const clickTrackingEventUrls = this._vastCampaign.getVast().getVideoClickTrackingURLs();
        if (clickTrackingEventUrls) {
            for (const clickTrackingEventUrl of clickTrackingEventUrls) {
                this._thirdPartyEventManager.sendWithGet('vast video click', sessionId, clickTrackingEventUrl, this._vastCampaign.getUseWebViewUserAgentForTracking());
            }
        }
    }

    public onContainerBackground(): void {
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
                        view.x = OpenMeasurementUtilities.pxToDp(view.x, <AndroidDeviceInfo> this._deviceInfo);
                        view.y = OpenMeasurementUtilities.pxToDp(view.y, <AndroidDeviceInfo> this._deviceInfo);
                        view.width = OpenMeasurementUtilities.pxToDp(view.width, <AndroidDeviceInfo> this._deviceInfo);
                        view.height = OpenMeasurementUtilities.pxToDp(view.height, <AndroidDeviceInfo> this._deviceInfo);
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

    public onContainerForeground(): void {
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
                        view.x = OpenMeasurementUtilities.pxToDp(view.x, <AndroidDeviceInfo> this._deviceInfo);
                        view.y = OpenMeasurementUtilities.pxToDp(view.y, <AndroidDeviceInfo> this._deviceInfo);
                        view.width = OpenMeasurementUtilities.pxToDp(view.width, <AndroidDeviceInfo> this._deviceInfo);
                        view.height = OpenMeasurementUtilities.pxToDp(view.height, <AndroidDeviceInfo> this._deviceInfo);
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

    public onVideoError(): void {
        const endScreen = this.getEndScreen();
        if (endScreen && this.hasImpressionOccurred()) {
            endScreen.show();
        } else {
            this.hide();
        }
    }

    public setImpressionOccurred(): void {
        this._impressionSent = true;
    }

    public hasImpressionOccurred(): boolean {
        return this._impressionSent;
    }

    private isValidURL(url: string | null): boolean {
        const reg = new RegExp('^(https?)://.+$');
        return !!url && reg.test(url);
    }
}
