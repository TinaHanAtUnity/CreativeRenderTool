import { Asset } from 'Ads/Models/Assets/Asset';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
import { Vast } from 'VAST/Models/Vast';
import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';

export interface IVastCampaign extends IProgrammaticCampaign {
    vast: Vast;
    video: Video;
    hasStaticEndscreen: boolean;
    hasIframeEndscreen: boolean;
    staticPortrait: Image | undefined;
    staticLandscape: Image | undefined;
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
            hasStaticEndscreen: ['boolean'],
            hasIframeEndscreen: ['boolean'],
            staticPortrait: ['object', 'undefined'],
            staticLandscape: ['object', 'undefined'],
            appCategory: ['string', 'undefined'],
            appSubcategory: ['string', 'undefined'],
            advertiserDomain: ['string', 'undefined'],
            advertiserCampaignId: ['string', 'undefined'],
            advertiserBundleId: ['string', 'undefined'],
            buyerId: ['string', 'undefined'],
            impressionUrls: ['array'],
            isMoatEnabled: ['boolean', 'undefined']
        }, campaign);

        this.addCustomTracking(campaign.trackingUrls);
    }

    public getVast(): Vast {
        return this.get('vast');
    }

    public getVideo() {
        if (!this.get('video')) {
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

    public hasStaticEndscreen(): boolean {
        return this.get('hasStaticEndscreen');
    }

    public hasIframeEndscreen(): boolean {
        return this.get('hasIframeEndscreen');
    }

    public getStaticLandscape(): Asset | undefined {
        return this.get('staticLandscape');
    }

    public getStaticPortrait(): Asset | undefined {
        return this.get('staticPortrait');
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

    public setTrackingUrls(trackingUrls: ICampaignTrackingUrls) {
        super.setTrackingUrls(trackingUrls);
        this.addCustomTracking(trackingUrls);
    }

    public getDTO(): { [key: string]: unknown } {
        let staticPortrait;
        const staticPortraitAsset = this.get('staticPortrait');
        if (staticPortraitAsset) {
            staticPortrait = staticPortraitAsset.getDTO();
        }

        let staticLandscape;
        const staticLandscapeAsset = this.get('staticLandscape');
        if (staticLandscapeAsset) {
            staticLandscape = staticLandscapeAsset.getDTO();
        }

        return {
            'campaign': super.getDTO(),
            'vast': this.getVast().getDTO(),
            'video': this.getVast().getDTO(),
            'hasStaticEndscreen': this.hasStaticEndscreen(),
            'hasIframeEndscreen': this.hasIframeEndscreen(),
            'staticPortrait': staticPortrait,
            'staticLandscape': staticLandscape
        };
    }

    private addCustomTracking(trackingUrls: ICampaignTrackingUrls) {
        if (trackingUrls) {
            Object.keys(trackingUrls).forEach((event) => {
                const eventUrls = trackingUrls[event];
                if (eventUrls) {
                    eventUrls.forEach((eventUrl) => {
                        this.getVast().addTrackingEventUrl(event, eventUrl);
                    });
                }
            });
        }
    }
}
