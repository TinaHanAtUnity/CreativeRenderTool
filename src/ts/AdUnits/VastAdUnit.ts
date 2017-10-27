import { NativeBridge } from 'Native/NativeBridge';
import { Vast } from 'Models/Vast/Vast';
import { VastCreativeCompanionAd } from 'Models/Vast/VastCreativeCompanionAd';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { IVideoAdUnitParameters, VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';

enum Orientation {
    LANDSCAPE,
    PORTRAIT
}

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

    constructor(nativeBridge: NativeBridge, parameters: IVastAdUnitParameters) {
        super(nativeBridge, parameters);

        parameters.overlay.setSpinnerEnabled(!parameters.campaign.getVideo().isCached());

        this._endScreen = parameters.endScreen || null;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;

        if(this._endScreen) {
            this._endScreen.render();
            this._endScreen.hide();
            document.body.appendChild(this._endScreen.container());
        }
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.hide();
            endScreen.remove();
        }

        return super.hide();
    }

    public description(): string {
        return 'VAST';
    }

    public getVast(): Vast {
        return (<VastCampaign> this.getCampaign()).getVast();
    }

    public getDuration(): number | null {
        return this.getVast().getDuration();
    }

    public sendImpressionEvent(sessionId: string, sdkVersion: number): void {
        const impressionUrls = this.getVast().getImpressionUrls();
        if (impressionUrls) {
            for (const impressionUrl of impressionUrls) {
                this.sendThirdPartyEvent('vast impression', sessionId, sdkVersion, impressionUrl);
            }
        }
    }

    public sendTrackingEvent(eventName: string, sessionId: string, sdkVersion: number): void {
        const trackingEventUrls = this.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (const url of trackingEventUrls) {
                this.sendThirdPartyEvent(`vast ${eventName}`, sessionId, sdkVersion, url);
            }
        }
    }

    public sendProgressEvents(thirdPartyEventManager: ThirdPartyEventManager, sessionId: string, sdkVersion: number, position: number, oldPosition: number) {
        this.sendQuartileEvent(thirdPartyEventManager, sessionId, sdkVersion, position, oldPosition, 1, 'firstQuartile');
        this.sendQuartileEvent(thirdPartyEventManager, sessionId, sdkVersion, position, oldPosition, 2, 'midpoint');
        this.sendQuartileEvent(thirdPartyEventManager, sessionId, sdkVersion, position, oldPosition, 3, 'thirdQuartile');
    }

    public getVideoClickThroughURL(): string | null {
        const url = this.getVast().getVideoClickThroughURL();
        if (this.isValidURL(url)) {
            return url;
        } else {
            return null;
        }
    }

    public getCompanionClickThroughUrl(): string | null {
        const url = this.getVast().getCompanionClickThroughUrl();
        if (this.isValidURL(url)) {
            return url;
        } else {
            return null;
        }
    }

    public sendVideoClickTrackingEvent(sessionId: string, sdkVersion: number): void {
        const clickTrackingEventUrls = this.getVast().getVideoClickTrackingURLs();

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

    private getCompanionForOrientation(): VastCreativeCompanionAd | null {
        let orientation = DeviceOrientation.getDeviceOrientation();
        if (this._forceOrientation === ForceOrientation.LANDSCAPE) {
            orientation = Orientation.LANDSCAPE;
        } else if (this._forceOrientation === ForceOrientation.PORTRAIT) {
            orientation = Orientation.PORTRAIT;
        }

        if (orientation === Orientation.LANDSCAPE) {
            return this.getVast().getLandscapeOrientedCompanionAd();
        } else {
            return this.getVast().getPortraitOrientedCompanionAd();
        }
    }

    private sendQuartileEvent(thirdPartyEventManager: ThirdPartyEventManager, sessionId: string, sdkVersion: number, position: number, oldPosition: number, quartile: number, quartileEventName: string) {
        if (this.getTrackingEventUrls(quartileEventName)) {
            const duration = this.getDuration();
            if (duration && duration > 0 && position / 1000 > duration * 0.25 * quartile && oldPosition / 1000 < duration * 0.25 * quartile) {
                this.sendTrackingEvent(quartileEventName, sessionId, sdkVersion);
            }
        }
    }

    private sendThirdPartyEvent(event: string, sessionId: string, sdkVersion: number, url: string): void {
        url = url.replace(/%ZONE%/, this.getPlacement().getId());
        url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
        this._thirdPartyEventManager.sendEvent(event, sessionId, url);
    }

    private getTrackingEventUrls(eventName: string): string[] | null {
        return this.getVast().getTrackingEventUrls(eventName);
    }

    private isValidURL(url: string | null): boolean {
        const reg = new RegExp('^(https?)://.+$');
        return !!url && reg.test(url);
    }
}
