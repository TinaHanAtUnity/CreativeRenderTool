import { Asset } from 'Ads/Models/Assets/Asset';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
import { Vast } from 'VAST/Models/Vast';
import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';

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

    // Overidden function so tracking urls can combined with tracking urls from vast creative
    public setTrackingUrls(trackingUrls: ICampaignTrackingUrls) {
        this.set('trackingUrls', trackingUrls);
        this.processCustomTracking(trackingUrls);
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

    private processCustomTracking(trackingUrls: ICampaignTrackingUrls) {
        if (trackingUrls) {
            Object.keys(trackingUrls).forEach((event) => {
                const eventUrls = this.getTrackingUrlsForEvent(event);
                eventUrls.forEach((eventUrl) => {
                    this.getVast().addTrackingEventUrl(event, eventUrl);
                });
            });
        }
    }
}
