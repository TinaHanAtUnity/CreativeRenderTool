import { Campaign } from 'Models/Campaign';
import { Vast } from 'Models/Vast/Vast';

export class VastCampaign extends Campaign {

    private _cacheTTL: number;
    private _vast: Vast;

    constructor(vast: Vast, campaignId: string, gamerId: string, abGroup: number, cacheTTL?: number, tracking?: any) {
        super(campaignId, gamerId, abGroup);
        this._vast = vast;
        this._cacheTTL = cacheTTL || 3600;
        this.processCustomTracking(tracking);
    }

    public getVast(): Vast {
        return this._vast;
    }

    public getVideoUrl(): string {
        return this._vast.getVideoUrl();
    }

    public getTimeoutInSeconds(): number {
        return this._cacheTTL;
    }

    private processCustomTracking(tracking: any) {
        if (tracking) {
            for (const trackingEventName in tracking) {
                if (tracking.hasOwnProperty(trackingEventName)) {
                    const urls = tracking[trackingEventName];
                    if (urls) {
                        urls.forEach((url: string) => {
                            this._vast.addTrackingEventUrl(trackingEventName, url);
                        });
                    }
                }
            }
        }
    }
}
