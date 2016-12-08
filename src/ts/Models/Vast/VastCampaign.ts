import { Campaign } from 'Models/Campaign';
import { Vast } from 'Models/Vast/Vast';

export class VastCampaign extends Campaign {

    private _cacheTTL: number;
    private _campaignId: string;
    private _vast: Vast;
    private _hasEndscreen: boolean;

    constructor(vast: Vast, campaignId: string, gamerId: string, abGroup: number, cacheTTL?: number, tracking?: any) {
        const campaign = {
            endScreenPortrait: vast.getCompanionPortraitUrl(),
            endScreenLandscape: vast.getCompanionLandscapeUrl()
        };

        super(campaign, gamerId, abGroup);

        this._hasEndscreen = !!vast.getCompanionPortraitUrl() || !!vast.getCompanionLandscapeUrl();
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

    public hasEndscreen(): boolean {
        return this._hasEndscreen;
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
