import { NativeBridge } from 'Native/NativeBridge';
import { Vast } from 'Models/Vast/Vast';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { EventManager } from 'Managers/EventManager';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { VastEndScreen } from 'Views/VastEndScreen';
import { AdUnit } from 'Utilities/AdUnit';

export class VastAdUnit extends VideoAdUnit {

    private _endScreen: VastEndScreen | null;

    constructor(nativeBridge: NativeBridge, adUnit: AdUnit, videoAdUnitController: VideoAdUnitController, endScreen?: VastEndScreen) {
        super(nativeBridge, adUnit, videoAdUnitController);

        this._endScreen = endScreen || null;
    }

    public show(): Promise<void> {
        return this._videoAdUnitController.show();
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.hide();
            endScreen.remove();
        }

        return this._videoAdUnitController.hide();
    }

    public isShowing(): boolean {
        return this._videoAdUnitController.isShowing();
    }

    public getVast(): Vast {
        return (<VastCampaign> this.getCampaign()).getVast();
    }

    public getDuration(): number | null {
        return this.getVast().getDuration();
    }

    public sendImpressionEvent(eventManager: EventManager, sessionId: string, sdkVersion: string): void {
        const impressionUrls = this.getVast().getImpressionUrls();
        if (impressionUrls) {
            for (const impressionUrl of impressionUrls) {
                this.sendThirdPartyEvent(eventManager, 'vast impression', sessionId, sdkVersion, impressionUrl);
            }
        }
    }

    public sendTrackingEvent(eventManager: EventManager, eventName: string, sessionId: string, sdkVersion: string): void {
        const trackingEventUrls = this.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (const url of trackingEventUrls) {
                this.sendThirdPartyEvent(eventManager, `vast ${eventName}`, sessionId, sdkVersion, url);
            }
        }
    }

    public sendProgressEvents(eventManager: EventManager, sessionId: string, sdkVersion: string, position: number, oldPosition: number) {
        this.sendQuartileEvent(eventManager, sessionId, sdkVersion, position, oldPosition, 1, 'firstQuartile');
        this.sendQuartileEvent(eventManager, sessionId, sdkVersion, position, oldPosition, 2, 'midpoint');
        this.sendQuartileEvent(eventManager, sessionId, sdkVersion, position, oldPosition, 3, 'thirdQuartile');
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

    public sendVideoClickTrackingEvent(eventManager: EventManager, sessionId: string, sdkVersion: string): void {
        const clickTrackingEventUrls = this.getVast().getVideoClickTrackingURLs();

        if (clickTrackingEventUrls) {
            for (let i = 0; i < clickTrackingEventUrls.length; i++) {
                this.sendThirdPartyEvent(eventManager, 'vast video click', sessionId, sdkVersion, clickTrackingEventUrls[i]);
            }
        }
    }

    public getEndScreen(): VastEndScreen | null {
        return this._endScreen;
    }

    private sendQuartileEvent(eventManager: EventManager, sessionId: string, sdkVersion: string, position: number, oldPosition: number, quartile: number, quartileEventName: string) {
        if (this.getTrackingEventUrls(quartileEventName)) {
            const duration = this.getDuration();
            if (duration > 0 && position / 1000 > duration * 0.25 * quartile && oldPosition / 1000 < duration * 0.25 * quartile) {
                this.sendTrackingEvent(eventManager, quartileEventName, sessionId, sdkVersion);
            }
        }
    }

    private sendThirdPartyEvent(eventManager: EventManager, event: string, sessionId: string, sdkVersion: string, url: string): void {
        url = url.replace(/%ZONE%/, this.getPlacement().getId());
        url = url.replace(/%SDK_VERSION%/, sdkVersion);
        eventManager.thirdPartyEvent(event, sessionId, url);
    }

    private getTrackingEventUrls(eventName: string): string[] | null {
        return this.getVast().getTrackingEventUrls(eventName);
    }

    private isValidURL(url: string | null): boolean {
        const reg = new RegExp('^(https?)://.+$');
        return !!url && reg.test(url);
    }

}
