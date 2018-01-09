import { Vast } from 'Models/Vast/Vast';
import { Video } from 'Models/Assets/Video';
import { Asset } from 'Models/Assets/Asset';
import { Campaign, ICampaign } from 'Models/Campaign';
import { Image } from 'Models/Assets/Image';

export interface IVastCampaign extends ICampaign {
    vast: Vast;
    video: Video;
    hasEndscreen: boolean;
    portrait: Image | undefined;
    landscape: Image | undefined;
    tracking: any | undefined;
}

export class VastCampaign extends Campaign<IVastCampaign> {
    constructor(campaign: IVastCampaign) {
        super('VastCampaign', {
            ... Campaign.Schema,
            vast: ['object'],
            video: ['object'],
            hasEndscreen: ['boolean'],
            portrait: ['object', 'undefined'],
            landscape: ['object', 'undefined'],
            tracking: ['object', 'undefined']
        });

        this.set('vast', campaign.vast);
        this.set('video', campaign.video);
        this.set('hasEndscreen', campaign.hasEndscreen);
        this.set('portrait', campaign.portrait);
        this.set('landscape', campaign.landscape);

        this.set('id', campaign.id);
        this.set('session', campaign.session);
        this.set('gamerId', campaign.gamerId);
        this.set('abGroup', campaign.abGroup);
        this.set('useWebViewUserAgentForTracking', campaign.useWebViewUserAgentForTracking);
        this.set('willExpireAt', campaign.willExpireAt);
        this.set('adType', campaign.adType);
        this.set('correlationId', campaign.correlationId || undefined);
        this.set('creativeId', campaign.creativeId || undefined);
        this.set('appCategory', campaign.appCategory || undefined);
        this.set('appSubCategory', campaign.appSubCategory || undefined);
        this.set('seatId', campaign.seatId || undefined);
        this.set('advertiserDomain', campaign.advertiserDomain || undefined);
        this.set('advertiserCampaignId', campaign.advertiserCampaignId || undefined);
        this.set('advertiserBundleId', campaign.advertiserBundleId || undefined);
        this.set('buyerId', campaign.buyerId || undefined);

        this.processCustomTracking(campaign.tracking);
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
