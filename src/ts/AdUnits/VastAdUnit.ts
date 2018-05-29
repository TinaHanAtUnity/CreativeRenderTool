import { NativeBridge } from 'Native/NativeBridge';
import { VastCreativeCompanionAd } from 'Models/Vast/VastCreativeCompanionAd';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { IVideoAdUnitParameters, VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { MOAT } from 'Views/MOAT';
import { MoatViewabilityService } from 'Utilities/MoatViewabilityService';
import { StreamType } from 'Constants/Android/StreamType';
import { Platform } from 'Constants/Platform';
import { Placement } from 'Models/Placement';
import { DeviceInfo } from 'Native/Backend/Api/DeviceInfo';
import { Closer } from 'Views/Closer';
import { Overlay } from 'Views/Overlay';

class DeviceOrientation {
    public static getDeviceOrientation(): Orientation {
        let height = window.innerHeight;
        if (height <= 0) {
            height = 1;
        }
        const aspectRatio = window.innerWidth / height;
        return aspectRatio >= 1.0 ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
    }
}

export interface IVastAdUnitParameters extends IVideoAdUnitParameters<VastCampaign> {
    endScreen?: VastEndScreen;
}

export class VastAdUnit extends VideoAdUnit<VastCampaign> {
    private _endScreen: VastEndScreen | null;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _moat?: MOAT;
    private _volume: number;
    private _muted: boolean = false;
    private _events: Array<[number, string]> = [[0.0, 'AdVideoStart'], [0.25, 'AdVideoFirstQuartile'], [0.5, 'AdVideoMidpoint'], [0.75, 'AdVideoThirdQuartile']];
    private _vastCampaign: VastCampaign;
    private _vastPlacement: Placement;
    private _showGDPRBanner: boolean = false;
    private _screenWidth: number;
    private _screenHeight: number;

    constructor(nativeBridge: NativeBridge, parameters: IVastAdUnitParameters, showGDPRBanner: boolean) {
        super(nativeBridge, parameters);

        parameters.overlay.setSpinnerEnabled(!parameters.campaign.getVideo().isCached());

        this._endScreen = parameters.endScreen || null;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._vastCampaign = parameters.campaign;
        this._vastPlacement = parameters.placement;
        this._moat = MoatViewabilityService.getMoat();
        this._showGDPRBanner = showGDPRBanner;

        if(this._endScreen) {
            this._endScreen.render();
            this._endScreen.hide();
            document.body.appendChild(this._endScreen.container());
        }

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            Promise.all([
                nativeBridge.DeviceInfo.Android.getDeviceVolume(StreamType.STREAM_MUSIC),
                nativeBridge.DeviceInfo.Android.getDeviceMaxVolume(StreamType.STREAM_MUSIC)
            ]).then(([volume, maxVolume]) => {
                this.setVolume(volume / maxVolume);
            });
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.DeviceInfo.Ios.getDeviceVolume().then((volume) => {
                this.setVolume(volume);
            });
        }
    }

    public show() {
        return super.show().then(() => {
            (<Overlay>this._overlay)!.choosePrivacyShown();
            if (this._showGDPRBanner && this._forceOrientation === Orientation.LANDSCAPE) {
                return Promise.all([
                    this._deviceInfo.getScreenWidth(),
                    this._deviceInfo.getScreenHeight()
                ]).then(([screenWidth, screenHeight]) => {
                    this._screenWidth = screenWidth;
                    this._screenHeight = screenHeight;
                    if (this._forceOrientation === Orientation.LANDSCAPE) {
                        this._container.setViewFrame('videoplayer', 0, 0, screenWidth, Math.floor(screenHeight * .8));
                    }
                });
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

            if(this._moat) {
                this._moat.removeMessageListener();
                this._moat.container().parentElement!.removeChild(this._moat.container());
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

    public setEvents(events: Array<[number, string]>) {
        this._events = events;
    }

    public getVolume() {
        if(this._muted) {
            return 0;
        }
        return this._volume;
    }

    public setVolume(volume: number) {
        this._volume = volume;
    }

    public setMuted(muted: boolean) {
        this._muted = muted;
    }

    public getMuted() {
        return this._muted;
    }

    public sendTrackingEvent(eventName: string, sessionId: string, sdkVersion: number): void {
        const trackingEventUrls = this._vastCampaign.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (const url of trackingEventUrls) {
                this.sendThirdPartyEvent(`vast ${eventName}`, sessionId, sdkVersion, url);
            }
        }
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

    public sendVideoClickTrackingEvent(sessionId: string, sdkVersion: number): void {
        this.sendTrackingEvent('click', sessionId, sdkVersion);

        const clickTrackingEventUrls = this._vastCampaign.getVast().getVideoClickTrackingURLs();

        if (clickTrackingEventUrls) {
            for (const clickTrackingEventUrl of clickTrackingEventUrls) {
                this.sendThirdPartyEvent('vast video click', sessionId, sdkVersion, clickTrackingEventUrl);
            }
        }
    }

    public getEndScreen(): VastEndScreen | null {
        return this._endScreen;
    }

    public sendCompanionTrackingEvent(sessionId: string, sdkVersion: number): void {
        const companion = this.getCompanionForOrientation();
        if (companion) {
            const urls = companion.getEventTrackingUrls('creativeView');
            for (const url of urls) {
                this.sendThirdPartyEvent('companion', sessionId, sdkVersion, url);
            }
        }
    }

    public onContainerBackground(): void {
        super.onContainerBackground();
        if (this.isShowing() && this.canShowVideo() && this._moat) {
            this._moat.pause(this.getVolume());
        }
    }

    public onContainerForeground(): void {
        super.onContainerForeground();
        if (this.isShowing() && this.canShowVideo() && this._moat) {
            this._moat.play(this.getVolume());
        }
    }

    private getCompanionForOrientation(): VastCreativeCompanionAd | null {
        let orientation = DeviceOrientation.getDeviceOrientation();
        if (this._forceOrientation === Orientation.LANDSCAPE) {
            orientation = Orientation.LANDSCAPE;
        } else if (this._forceOrientation === Orientation.PORTRAIT) {
            orientation = Orientation.PORTRAIT;
        }

        if (orientation === Orientation.LANDSCAPE) {
            return this._vastCampaign.getVast().getLandscapeOrientedCompanionAd();
        } else {
            return this._vastCampaign.getVast().getPortraitOrientedCompanionAd();
        }
    }

    private sendThirdPartyEvent(event: string, sessionId: string, sdkVersion: number, url: string): void {
        url = url.replace(/%ZONE%/, this._vastPlacement.getId());
        url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
        this._thirdPartyEventManager.sendEvent(event, sessionId, url, this._vastCampaign.getUseWebViewUserAgentForTracking());
    }

    private isValidURL(url: string | null): boolean {
        const reg = new RegExp('^(https?)://.+$');
        return !!url && reg.test(url);
    }
}
