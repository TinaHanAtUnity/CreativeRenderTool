import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { Overlay } from 'Views/Overlay';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { Vast } from 'Models/Vast';
import { VastCampaign } from 'Models/VastCampaign';
import { EventManager } from 'Managers/EventManager';

export class VastAdUnit extends VideoAdUnit {

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: VastCampaign, overlay: Overlay) {
        super(nativeBridge, placement, campaign, overlay, null);
    }

    protected hideChildren() {
        const overlay = this.getOverlay();
        overlay.container().parentElement.removeChild(overlay.container());
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
                eventManager.thirdPartyEvent('vast impression', sessionId, impressionUrl);
            }
        }
    }

    public sendTrackingEvent(eventManager: EventManager, eventName: string, sessionId: string): void {
        const trackingEventUrls = this.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (let url of trackingEventUrls) {
                url = url.replace(/%ZONE%/, this.getPlacement().getId());
                eventManager.thirdPartyEvent(`vast ${eventName}`, sessionId, url);
            }
        }
    }

    public sendProgressEvents(eventManager: EventManager, sessionId: string, position: number, oldPosition: number) {
        this.sendQuartileEvent(eventManager, sessionId, position, oldPosition, 1);
        this.sendQuartileEvent(eventManager, sessionId, position, oldPosition, 2);
        this.sendQuartileEvent(eventManager, sessionId, position, oldPosition, 3);
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

    private getTrackingEventUrls(eventName: string): string[] {
        return this.getVast().getTrackingEventUrls(eventName);
    }

}