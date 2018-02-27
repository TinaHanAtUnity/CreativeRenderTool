import { Campaign, ICampaign } from 'Models/Campaign';
import { HTML } from 'Models/Assets/HTML';
import { Image } from 'Models/Assets/Image';
import { Asset } from 'Models/Assets/Asset';
import { StoreName } from 'Models/Campaigns/PerformanceCampaign';

export interface IMRAIDCampaign extends ICampaign {
    resourceAsset: HTML | undefined;
    resource: string | undefined;
    dynamicMarkup: string | undefined;
    additionalTrackingEvents: { [eventName: string]: string[] } | undefined;

    clickAttributionUrl?: string;
    clickAttributionUrlFollowsRedirects?: boolean;
    clickUrl: string | undefined;
    videoEventUrls: { [eventType: string]: string } | undefined;

    gameName: string | undefined;
    gameIcon: Image | undefined;
    rating: number | undefined;
    ratingCount: number | undefined;
    landscapeImage: Image | undefined;
    portraitImage: Image | undefined;
    bypassAppSheet: boolean | undefined;
    store: StoreName | undefined;
    appStoreId: string | undefined;
}

export class MRAIDCampaign extends Campaign<IMRAIDCampaign> {
    constructor(campaign: IMRAIDCampaign) {
        super('MRAIDCampaign', {
            ... Campaign.Schema,
            resourceAsset: ['object', 'undefined'],
            resource: ['string', 'undefined'],
            dynamicMarkup: ['string', 'undefined'],
            additionalTrackingEvents: ['object', 'undefined'],
            clickAttributionUrl: ['string', 'undefined'],
            clickAttributionUrlFollowsRedirects: ['boolean', 'undefined'],
            clickUrl: ['string', 'undefined'],
            videoEventUrls: ['object', 'undefined'],
            gameName: ['string', 'undefined'],
            gameIcon: ['object', 'undefined'],
            rating: ['number', 'undefined'],
            ratingCount: ['number', 'undefined'],
            landscapeImage: ['object', 'undefined'],
            portraitImage: ['object', 'undefined'],
            bypassAppSheet: ['boolean', 'undefined'],
            store: ['number', 'undefined'],
            appStoreId: ['string', 'undefined'],
        }, campaign);
    }

    public getResourceUrl(): HTML | undefined {
        return this.get('resourceAsset');
    }

    public setResourceUrl(url: string,): void {
        this.set('resourceAsset', new HTML(url, this.getSession()));
    }

    public setResource(resource: string): void {
        this.set('resource', resource);
    }

    public getResource(): string | undefined {
        return this.get('resource');
    }

    public getGameName(): string | undefined {
        return this.get('gameName');
    }

    public getGameIcon(): Image | undefined {
        return this.get('gameIcon');
    }

    public getRating(): number | undefined {
        return this.get('rating');
    }

    public getRatingCount(): number | undefined {
        return this.get('ratingCount');
    }

    public getPortrait(): Image | undefined {
        return this.get('portraitImage');
    }

    public getLandscape(): Image | undefined {
        return this.get('landscapeImage');
    }

    public getRequiredAssets() {
        const resourceUrl =  this.getResourceUrl();
        return resourceUrl ? [resourceUrl] : [];
    }

    public getOptionalAssets(): Asset[] {
        const assets: Asset[] = [];
        const gameIcon = this.getGameIcon();
        if(gameIcon) {
            assets.push(gameIcon);
        }
        const portrait = this.getPortrait();
        if(portrait) {
            assets.push(portrait);
        }
        const landscape = this.getLandscape();
        if(landscape) {
            assets.push(landscape);
        }

        return assets;
    }

    public getDynamicMarkup(): string | undefined {
        return this.get('dynamicMarkup');
    }

    public getTrackingEventUrls(): { [eventName: string]: string[] } | undefined {
        return this.get('additionalTrackingEvents');
    }

    public getClickAttributionUrl(): string | undefined {
        return this.get('clickAttributionUrl');
    }

    public getClickAttributionUrlFollowsRedirects(): boolean | undefined {
        return this.get('clickAttributionUrlFollowsRedirects');
    }

    public getClickUrl(): string | undefined {
        return this.get('clickUrl');
    }

    public getVideoEventUrls(): { [eventType: string]: string } | undefined {
        return this.get('videoEventUrls');
    }

    public getVideoEventUrl(eventType: string): string | undefined {
        const videoEventUrls = this.getVideoEventUrls();
        if(videoEventUrls) {
            return videoEventUrls[eventType];
        } else {
            return undefined;
        }
    }

    public getBypassAppSheet(): boolean | undefined {
        return this.get('bypassAppSheet');
    }

    public getStore(): StoreName | undefined {
        return this.get('store');
    }

    public getAppStoreId(): string | undefined {
        return this.get('appStoreId');
    }

    public isConnectionNeeded(): boolean {
        const resourceUrl = this.getResourceUrl();
        if(resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) {
            return false;
        }
        return true;
    }

    public getDTO(): { [key: string]: any } {
        let resourceUrlDTO: any;
        const resourceUrlAsset = this.getResourceUrl();
        if (resourceUrlAsset) {
            resourceUrlDTO = resourceUrlAsset.getDTO();
        }

        return {
            'campaign': super.getDTO(),
            'resourceUrl': resourceUrlDTO,
            'resource': this.getResource(),
            'dynamicMarkup': this.getDynamicMarkup(),
            'additionalTrackingEvents': this.getTrackingEventUrls()
        };
    }

    public getAbGroup(): number {
        return this.get('abGroup');
    }
}
