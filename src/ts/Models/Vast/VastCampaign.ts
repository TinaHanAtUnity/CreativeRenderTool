import { Campaign } from 'Models/Campaign';
import { Vast } from 'Models/Vast/Vast';

export class VastCampaign extends Campaign {

    private _cacheTTL: number;
    private _campaignId: string;
    private _vast: Vast;

    constructor(vast: Vast, campaignId: string, gamerId: string, abGroup: number, cacheTTL?: number, tracking?: any) {
        const campaign = {
            endScreenPortrait: vast.getCompanionPortraitUrl(),//'http://localhost:8000/PM_16441-RD-en_US-320x480@2X.jpg',
            endScreenLandscape: vast.getCompanionLandscapeUrl()//'http://localhost:8000/PM_16441-RD-en_US-480x320@2X.jpg'
        };

        super(campaign, gamerId, abGroup);
        this._campaignId = campaignId;
        this._vast = vast;
        this._cacheTTL = cacheTTL || 3600;
        this.processCustomTracking(tracking);
    }

    public getId(): string {
        return this._campaignId;
    }

    public getVast(): Vast {
        return this._vast;
    }

    public getVideoUrl(): string {
        const videoUrl = super.getVideoUrl();
        if (videoUrl) {
            return videoUrl;
        } else {
            return this._vast.getVideoUrl() || '';
        }
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
