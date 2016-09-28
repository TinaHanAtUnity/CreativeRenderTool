import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { Vast } from 'Models/Vast/Vast';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Campaign } from 'Models/Campaign';
import { EventManager } from 'Managers/EventManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';

export class VastAdUnit extends AbstractAdUnit {

    private _videoAdUnit: VideoAdUnit;

    constructor(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit) {
        super(nativeBridge, videoAdUnit.getPlacement(), videoAdUnit.getCampaign());
        this._videoAdUnit = videoAdUnit;

        videoAdUnit.onClose.subscribe(() => this.onClose.trigger());
        videoAdUnit.onFinish.subscribe(() => this.onFinish.trigger());
        videoAdUnit.onStart.subscribe(() => this.onStart.trigger());
    }

    public show(): Promise<void> {
        return this._videoAdUnit.show();
    }

    public hide(): Promise<void> {
        return this._videoAdUnit.hide();
    }

    public isShowing(): boolean {
        return this._videoAdUnit.isShowing();
    }

    public getVast(): Vast {
        return (<VastCampaign> this.getCampaign()).getVast();
    }

    public getDuration(): number {
        return this.getVast().getDuration();
    }

    public sendImpressionEvent(eventManager: EventManager, sessionId: string): void {
        const impressionUrls = this.getVast().getImpressionUrls();
        if (impressionUrls) {
            for (let impressionUrl of impressionUrls) {
                this.sendThirdPartyEvent(eventManager, 'vast impression', sessionId, impressionUrl);
            }
        }
    }

    public sendTrackingEvent(eventManager: EventManager, eventName: string, sessionId: string): void {
        const trackingEventUrls = this.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (let url of trackingEventUrls) {
                this.sendThirdPartyEvent(eventManager, `vast ${eventName}`, sessionId, url);
            }
        }
    }

    public sendProgressEvents(eventManager: EventManager, sessionId: string, position: number, oldPosition: number) {
        this.sendQuartileEvent(eventManager, sessionId, position, oldPosition, 1);
        this.sendQuartileEvent(eventManager, sessionId, position, oldPosition, 2);
        this.sendQuartileEvent(eventManager, sessionId, position, oldPosition, 3);
    }

    public getVideoClickThroughURL(): string {
        let url = this.getVast().getVideoClickThroughURL();
        let reg = new RegExp('^(https?)://.+$');
        if (reg.test(url)) {
            return url;
        } else {
            // in the future, we want to send this event to our server and notify the advertiser of a broken link
            return null;
        }
    }

    public sendVideoClickTrackingEvent(eventManager: EventManager, sessionId: string): void {
        let clickTrackingEventUrls = this.getVast().getVideoClickTrackingURLs();

        if (clickTrackingEventUrls) {
            for (let i = 0; i < clickTrackingEventUrls.length; i++) {
                this.sendThirdPartyEvent(eventManager, 'vast video click', sessionId, clickTrackingEventUrls[i]);
            }
        }
    }

    private sendQuartileEvent(eventManager: EventManager, sessionId: string, position: number, oldPosition: number, quartile: number) {
        let quartileEventName: string;
        if (quartile === 1) {
            quartileEventName = 'firstQuartile';
        }
        if (quartile === 2) {
            quartileEventName = 'midpoint';
        }
        if (quartile === 3) {
            quartileEventName = 'thirdQuartile';
        }
        if (this.getTrackingEventUrls(quartileEventName)) {
            let duration = this.getDuration();
            if (duration > 0 && position / 1000 > duration * 0.25 * quartile && oldPosition / 1000 < duration * 0.25 * quartile) {
                this.sendTrackingEvent(eventManager, quartileEventName, sessionId);
            }
        }
    }

    private sendThirdPartyEvent(eventManager: EventManager, event: string, sessionId: string, url: string): void {
        url = url.replace(/%ZONE%/, this.getPlacement().getId());
        eventManager.thirdPartyEvent(event, sessionId, url);
    }

    private getTrackingEventUrls(eventName: string): string[] {
        return this.getVast().getTrackingEventUrls(eventName);
    }

}
