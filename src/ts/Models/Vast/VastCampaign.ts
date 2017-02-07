import { Campaign } from 'Models/Campaign';
import { Vast } from 'Models/Vast/Vast';
import { Video } from 'Models/Video';
import { Asset } from 'Models/Asset';

export class VastCampaign extends Campaign {

    private _vast: Vast;
    private _video: Video;
    private _hasEndscreen: boolean;
    private _portrait: Asset | undefined;
    private _landscape: Asset | undefined;

    constructor(vast: Vast, campaignId: string, gamerId: string, abGroup: number, cacheTTL?: number, tracking?: any) {
        super(campaignId, gamerId, abGroup, cacheTTL || 3600);

        this._hasEndscreen = !!vast.getCompanionPortraitUrl() || !!vast.getCompanionLandscapeUrl();
        const portraitUrl = vast.getCompanionPortraitUrl();
        if(portraitUrl) {
            this._portrait = new Asset(portraitUrl);
        }

        const landscapeUrl = vast.getCompanionLandscapeUrl();
        if(landscapeUrl) {
            this._landscape = new Asset(landscapeUrl);
        }

        this._vast = vast;
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

    public getOriginalVideoUrl(): string {
        return this._vast.getVideoUrl() || '';
    }

    public getRequiredAssets() {
        return [
            this._video
        ];
    }

    public getOptionalAssets() {
        return [];
    }

    public hasEndscreen(): boolean {
        return this._hasEndscreen;
    }

    public getLandscape(): Asset | undefined {
        return this._landscape;
    }

    public getPortrait(): Asset | undefined {
        return this._portrait;
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
