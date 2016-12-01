import { Campaign } from 'Models/Campaign';
import { Vast } from 'Models/Vast/Vast';
import { Video } from 'Models/Video';

export class VastCampaign extends Campaign {

    private _cacheTTL: number;
    private _vast: Vast;
    private _video: Video;

    constructor(vast: Vast, campaignId: string, gamerId: string, abGroup: number, cacheTTL?: number, tracking?: any) {
        super(campaignId, gamerId, abGroup);
        this._vast = vast;
        this._cacheTTL = cacheTTL || 3600;
        this.processCustomTracking(tracking);
    }

    public getVast(): Vast {
        return this._vast;
    }

    public getVideo() {
        if(!this._video) {
            this._video = new Video(this._vast.getVideoUrl());
        }
        return this._video;
    }

    public getTimeoutInSeconds(): number {
        return this._cacheTTL;
    }

    public getRequiredAssets() {
        return [
            this._video
        ];
    }

    public getOptionalAssets() {
        return [];
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
