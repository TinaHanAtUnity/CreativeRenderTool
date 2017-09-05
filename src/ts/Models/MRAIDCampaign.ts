import { Campaign, ICampaign } from 'Models/Campaign';
import { HTML } from 'Models/Assets/HTML';
import { Image } from 'Models/Assets/Image';
import { Asset } from 'Models/Assets/Asset';
import { StoreName } from 'Models/PerformanceCampaign';
import { Session } from 'Models/Session';

interface IMRAIDCampaign extends ICampaign {
    resourceAsset: HTML | undefined;
    resource: string | undefined;
    dynamicMarkup: string | undefined;
    additionalTrackingEvents: { [eventName: string]: string[] };

    clickAttributionUrl?: string;
    clickAttributionUrlFollowsRedirects?: boolean;

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
    constructor(campaign: any, session: Session, gamerId: string, abGroup: number, cacheTTL: number | undefined, resourceUrl?: string, resource?: string, additionalTrackingEvents?: { [eventName: string]: string[] }, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('MRAIDCampaign', {
            ... Campaign.Schema,
            resourceAsset: ['object', 'undefined'],
            resource: ['string', 'undefined'],
            dynamicMarkup: ['string', 'undefined'],
            additionalTrackingEvents: ['object', 'undefined'],
            clickAttributionUrl: ['string', 'undefined'],
            clickAttributionUrlFollowsRedirects: ['boolean', 'undefined'],
            gameName: ['string', 'undefined'],
            gameIcon: ['object', 'undefined'],
            rating: ['number', 'undefined'],
            ratingCount: ['number', 'undefined'],
            landscapeImage: ['object', 'undefined'],
            portraitImage: ['object', 'undefined'],
            bypassAppSheet: ['boolean', 'undefined'],
            store: ['number', 'undefined'],
            appStoreId: ['string', 'undefined'],
        });

        this.set('id', campaign.id);
        this.set('session', session);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);

        this.set('resourceAsset', resourceUrl ? new HTML(resourceUrl) : undefined);
        this.set('resource', resource);
        this.set('dynamicMarkup', campaign.dynamicMarkup);
        this.set('additionalTrackingEvents', additionalTrackingEvents || {});
        this.set('adType', adType || undefined);
        this.set('correlationId', correlationId || undefined);
        this.set('creativeId', creativeId || undefined);
        this.set('seatId', seatId || undefined);

        this.set('clickAttributionUrl', campaign.clickAttributionUrl);
        this.set('clickAttributionUrlFollowsRedirects', campaign.clickAttributionUrlFollowsRedirects);

        this.set('meta', campaign.meta);
        this.set('gameName', campaign.gameName);

        if(cacheTTL) {
            this.set('willExpireAt', Date.now() + cacheTTL * 1000);
        }

        if(campaign.gameIcon) {
            this.set('gameIcon', new Image(campaign.gameIcon));
        }
        this.set('rating', campaign.rating);
        this.set('ratingCount', campaign.ratingCount);

        if(campaign.endScreenLandscape) {
            this.set('landscapeImage', new Image(campaign.endScreenLandscape));
        }
        if(campaign.endScreenPortrait) {
            this.set('portraitImage', new Image(campaign.endScreenPortrait));
        }
        this.set('bypassAppSheet', campaign.bypassAppSheet);

        const campaignStore = typeof campaign.store !== 'undefined' ? campaign.store : '';
        switch(campaignStore) {
            case 'apple':
                this.set('store', StoreName.APPLE);
                break;
            case 'google':
                this.set('store', StoreName.GOOGLE);
                break;
            case 'xiaomi':
                this.set('store', StoreName.XIAOMI);
                break;
            default:
                break;
        }
        this.set('appStoreId', campaign.appStoreId);

    }

    public getResourceUrl(): HTML | undefined {
        return this.get('resourceAsset');
    }

    public setResourceUrl(url: string): void {
        this.set('resourceAsset', new HTML(url));
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

    public getTrackingEventUrls(): { [eventName: string]: string[] } {
        return this.get('additionalTrackingEvents');
    }

    public getClickAttributionUrl(): string | undefined {
        return this.get('clickAttributionUrl');
    }

    public getClickAttributionUrlFollowsRedirects(): boolean | undefined {
        return this.get('clickAttributionUrlFollowsRedirects');
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
}
