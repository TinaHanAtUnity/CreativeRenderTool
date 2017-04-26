import { Vast } from 'Models/Vast/Vast';
import { Video } from 'Models/Video';
import { Asset } from 'Models/Asset';
import { Campaign, ICampaign } from 'Models/Campaign';

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
            id: [campaignId, ['string']],
            gamerId: [gamerId, ['string']],
            abGroup: [abGroup, ['number']],
            timeout: [cacheTTL || 3600, ['number', 'undefined']],
            willExpireAt: [undefined, ['number', 'undefined']],
            vast: [vast, ['object']],
            video: [new Video(vast.getVideoUrl()), ['object']],
            hasEndscreen: [!!vast.getCompanionPortraitUrl() || !!vast.getCompanionLandscapeUrl(), ['boolean']],
            portrait: [portraitAsset, ['object', 'undefined']],
            landscape: [landscapeAsset, ['object', 'undefined']]
        });

        this.processCustomTracking(tracking);
    }

    public getVast(): Vast {
        return this.get('vast');
    }

    public getVideo() {
        if(!this.get('video')) {
            this.set('video', new Video(this.get('vast').getVideoUrl()));
        }
        return this.get('video');
    }

    public getOriginalVideoUrl(): string {
        return this.get('vast').getVideoUrl() || '';
    }

    public getRequiredAssets(): Asset[] {
        return [
            this.get('video')
        ];
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }

    public hasEndscreen(): boolean {
        return this.get('hasEndscreen');
    }

    public getLandscape(): Asset | undefined {
        return this.get('landscape');
    }

    public getPortrait(): Asset | undefined {
        return this.get('portrait');
    }

    public getDTO(): { [key: string]: any } {
        let portrait;
        const portraitAsset = this.get('portrait');
        if (portraitAsset) {
            portrait = portraitAsset.getDTO();
        }

        let landscape;
        const landscapeAsset = this.get('landscape');
        if (landscapeAsset) {
            landscape = landscapeAsset.getDTO();
        }

        return {
            'campaign': super.getDTO(),
            'vast': this.getVast().getDTO(),
            'video': this.getVast().getDTO(),
            'hasEndscreen': this.hasEndscreen(),
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
                            this.getVast().addTrackingEventUrl(trackingEventName, url);
                        });
                    }
                }
            }
        }
    }
}
