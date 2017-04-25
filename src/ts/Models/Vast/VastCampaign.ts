import { Campaign, ICampaign } from 'Models/Campaign';
import { Vast } from 'Models/Vast/Vast';
import { Video } from 'Models/Video';
import { Asset } from 'Models/Asset';

interface IVastCampaign extends ICampaign {
    vast: [Vast, string[]];
    video: [Video, string[]];
    hasEndscreen: [boolean, string[]];
    portrait: [Asset | undefined, string[]];
    landscape: [Asset | undefined, string[]];
}

export class VastCampaign extends Campaign<IVastCampaign> {
    constructor(vast: Vast, campaignId: string, gamerId: string, abGroup: number, cacheTTL?: number, tracking?: any) {
        const portraitUrl = vast.getCompanionPortraitUrl();
        let portraitAsset = undefined;
        if(portraitUrl) {
            portraitAsset = new Asset(portraitUrl);
        }

        const landscapeUrl = vast.getCompanionLandscapeUrl();
        let landscapeAsset = undefined;
        if(landscapeUrl) {
            landscapeAsset = new Asset(landscapeUrl);
        }

        super({
            id: ['', ['string']],
            gamerId: ['', ['string']],
            abGroup: [0, ['number']],
            timeout: [cacheTTL || 3600, ['number']],
            willExpireAt: [0, ['number']],
            vast: [vast, ['object']],
            video: [new Video(vast.getVideoUrl()), ['object']],
            hasEndscreen: [!!vast.getCompanionPortraitUrl() || !!vast.getCompanionLandscapeUrl(), ['boolean']],
            portrait: [portraitAsset, ['object', 'undefined']],
            landscape: [landscapeAsset, ['object', 'undefined']]
        });

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

    public getDTO(): { [key: string]: any } {
        let portrait;
        if (this._portrait) {
            portrait = this._portrait.getDTO();
        }

        let landscape;
        if (this._landscape) {
            landscape = this._landscape.getDTO();
        }

        return {
            'campaign': super.getDTO(),
            'vast': this._vast.getDTO(),
            'video': this._video.getDTO(),
            'hasEndscreen': this._hasEndscreen,
            'portrait': portrait,
            'landscape': landscape,
        };
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
