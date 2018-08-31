import { Vast } from 'Ads/Models/Vast/Vast';
import { Video } from 'Ads/Models/Assets/Video';
import { Asset } from 'Ads/Models/Assets/Asset';
import { Image } from 'Ads/Models/Assets/Image';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';

export interface IVastCampaign extends IProgrammaticCampaign {
    vast: Vast;
    video: Video;
    hasEndscreen: boolean;
    portrait: Image | undefined;
    landscape: Image | undefined;
    appCategory: string | undefined;
    appSubcategory: string | undefined;
    advertiserDomain: string | undefined;
    advertiserCampaignId: string | undefined;
    advertiserBundleId: string | undefined;
    buyerId: string | undefined;
    impressionUrls: string[];
    isMoatEnabled: boolean | undefined;
}

export class VastCampaign extends ProgrammaticCampaign<IVastCampaign> {
    constructor(campaign: IVastCampaign) {
        super('VastCampaign', {
            ... ProgrammaticCampaign.Schema,
            vast: ['object'],
            video: ['object'],
            hasEndscreen: ['boolean'],
            portrait: ['object', 'undefined'],
            landscape: ['object', 'undefined'],
            appCategory: ['string', 'undefined'],
            appSubcategory: ['string', 'undefined'],
            advertiserDomain: ['string', 'undefined'],
            advertiserCampaignId: ['string', 'undefined'],
            advertiserBundleId: ['string', 'undefined'],
            buyerId: ['string', 'undefined'],
            impressionUrls: ['array'],
            isMoatEnabled: ['boolean', 'undefined']
        }, campaign);

        this.processCustomTracking(campaign.trackingUrls);
    }

    public getVast(): Vast {
        return this.get('vast');
    }

    public getVideo() {
        if(!this.get('video')) {
            this.set('video', new Video(this.get('vast').getVideoUrl(), this.getSession()));
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

    public isConnectionNeeded(): boolean {
        return false;
    }

    public getCategory(): string | undefined {
        return this.get('appCategory');
    }

    public getSubcategory(): string | undefined {
        return this.get('appSubcategory');
    }

    public getBuyerId(): string | undefined {
        return this.get('buyerId');
    }

    public getAdvertiserDomain(): string | undefined {
        return this.get('advertiserDomain');
    }

    public getAdvertiserCampaignId(): string | undefined {
        return this.get('advertiserCampaignId');
    }

    public getAdvertiserBundleId(): string | undefined {
        return this.get('advertiserBundleId');
    }

    public getImpressionUrls(): string[] {
        return this.get('impressionUrls');
    }

    public isMoatEnabled(): boolean | undefined {
        return this.get('isMoatEnabled');
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
            'landscape': landscape
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
