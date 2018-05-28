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
    protected _onPauseObserver: any;

    private _endScreen: VastEndScreen | null;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _moat?: MOAT;
    private _volume: number;
    private _muted: boolean = false;
    private _events: Array<[number, string]> = [[0.0, 'AdVideoStart'], [0.25, 'AdVideoFirstQuartile'], [0.5, 'AdVideoMidpoint'], [0.75, 'AdVideoThirdQuartile']];
    private _vastCampaign: VastCampaign;
    private _vastPlacement: Placement;

    constructor(nativeBridge: NativeBridge, parameters: IVastAdUnitParameters) {
        super(nativeBridge, parameters);
        this._onPauseObserver = this._container.onAndroidPause.subscribe(() => this.onSystemPause());

        parameters.overlay.setSpinnerEnabled(!parameters.campaign.getVideo().isCached());

        this._endScreen = parameters.endScreen || null;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._vastCampaign = parameters.campaign;
        this._vastPlacement = parameters.placement;
        this._moat = MoatViewabilityService.getMoat();

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

    public sendTrackingEvent(eventName: string, sessionId: string): void {
        const trackingEventUrls = this._vastCampaign.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (const url of trackingEventUrls) {
                this._thirdPartyEventManager.sendEvent(`vast ${eventName}`, sessionId, url);
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

    public getEndScreen(): VastEndScreen | null {
        return this._endScreen;
    }

    public sendCompanionTrackingEvent(sessionId: string): void {
        const companion = this.getCompanionForOrientation();
        if (companion) {
            const urls = companion.getEventTrackingUrls('creativeView');
            for (const url of urls) {
                this._thirdPartyEventManager.sendEvent('companion', sessionId, url);
            }
        }
    }

    public sendVideoClickTrackingEvent(sessionId: string): void {
        this.sendTrackingEvent('click', sessionId);

        const clickTrackingEventUrls = this._vastCampaign.getVast().getVideoClickTrackingURLs();

        if (clickTrackingEventUrls) {
            for (const clickTrackingEventUrl of clickTrackingEventUrls) {
                this._thirdPartyEventManager.sendEvent('vast video click', sessionId, clickTrackingEventUrl);
            }
        }
    }

    protected onSystemInterrupt(interruptStarted: boolean): void {
        super.onSystemInterrupt(interruptStarted);
        if (this._moat) {
            if (!interruptStarted) {
                this._moat.resume(this.getVolume());
            }
        }
    }

    protected onSystemPause(): void {
        if (this._moat && !this._container.isPaused()) {
            this._moat.pause(this.getVolume());
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

    private isValidURL(url: string | null): boolean {
        const reg = new RegExp('^(https?)://.+$');
        return !!url && reg.test(url);
    }
}
