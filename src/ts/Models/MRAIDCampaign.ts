import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';

interface IMRAIDCampaign extends ICampaign {
    resourceUrl: Asset | undefined;
    resource: string | undefined;
}

export class MRAIDCampaign extends Campaign<IMRAIDCampaign> {
    constructor(campaign: any, gamerId: string, abGroup: number, resourceUrl?: string, resource?: string) {
        super({
            id: ['string'],
            gamerId: ['string'],
            abGroup: ['number'],
            timeout: ['number'],
            willExpireAt: ['number'],
            resourceUrl: ['object', 'undefined'],
            resource: ['string']
        });

        this.set('id', campaign.id);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);

        this.set('resourceUrl', resourceUrl ? new Asset({
            url: ['string'],
            cachedUrl: ['string', 'undefined'],
            fileId: ['string', 'undefined']},resourceUrl) : undefined);
        this.set('resource', resource);
    }

    public getResourceUrl(): Asset | undefined {
        return this.get('resourceUrl');
    }

    public setResourceUrl(url: string): void {
        this.set('resourceUrl', new Asset({
            url: ['string'],
            cachedUrl: ['string', 'undefined'],
            fileId: ['string', 'undefined']}, url));
    }

    public setResource(resource: string): void {
        this.set('resource', resource);
    }

    public getResource(): string | undefined {
        return this.get('resource');
    }

    public getRequiredAssets() {
        const resourceUrl =  this.getResourceUrl();
        return resourceUrl ? [resourceUrl] : [];
    }

    public getOptionalAssets() {
        return [];
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
            'resource': this.getResource()
        };
    }
}
