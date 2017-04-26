import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';

interface IMRAIDCampaign extends ICampaign {
    resourceUrl: [Asset | undefined, string[]];
    resource: [string | undefined, string[]];
}

export class MRAIDCampaign extends Campaign<IMRAIDCampaign> {
    constructor(campaign: any, gamerId: string, abGroup: number, resourceUrl?: string, resource?: string) {
        super({
            id: [campaign, ['string']],
            gamerId: [gamerId, ['string']],
            abGroup: [abGroup, ['number']],
            timeout: [undefined, ['number', 'undefined']],
            willExpireAt: [undefined, ['number', 'undefined']],
            resourceUrl: [undefined, ['object', 'undefined']],
            resource: [undefined, ['string', 'undefined']]
        });

        this.set('resourceUrl', resourceUrl ? new Asset(resourceUrl) : undefined);
        this.set('resource', resource);
    }

    public getResourceUrl(): Asset | undefined {
        return this.get('resourceUrl');
    }

    public setResourceUrl(url: string): void {
        this.set('resourceUrl', new Asset(url));
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
