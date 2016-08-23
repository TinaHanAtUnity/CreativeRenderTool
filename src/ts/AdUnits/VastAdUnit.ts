import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { Overlay } from 'Views/Overlay';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { Vast } from 'Models/Vast/Vast';
import { VastCampaign } from 'Models/Vast/VastCampaign';
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

    public getDuration(): number | null {
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
        this.sendQuartileEvent(eventManager, sessionId, position, oldPosition, 1, 'firstQuartile');
        this.sendQuartileEvent(eventManager, sessionId, position, oldPosition, 2, 'midpoint');
        this.sendQuartileEvent(eventManager, sessionId, position, oldPosition, 3, 'thirdQuartile');
    }

    public getVideoClickThroughURL(): string | null {
        let url = this.getVast().getVideoClickThroughURL();
        let reg = new RegExp('^(https?)://.+$');
        if (url && reg.test(url)) {
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

    private sendQuartileEvent(eventManager: EventManager, sessionId: string, position: number, oldPosition: number, quartile: number, quartileEventName: string) {
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

    private getTrackingEventUrls(eventName: string): string[] | null {
        return this.getVast().getTrackingEventUrls(eventName);
    }

}
