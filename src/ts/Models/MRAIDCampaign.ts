import { Campaign, ICampaign } from 'Models/Campaign';
import { HTML } from 'Models/Assets/HTML';

interface IMRAIDCampaign extends ICampaign {
    resourceAsset: HTML | undefined;
    resource: string | undefined;
}

export class MRAIDCampaign extends Campaign<IMRAIDCampaign> {
    constructor(campaign: any, gamerId: string, abGroup: number, resourceUrl?: string, resource?: string) {
        super({
            ... Campaign.Schema,
            resourceAsset: ['object', 'undefined'],
            resource: ['string', 'undefined']
        });

        this.set('id', campaign.id);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);

        this.set('resourceAsset', resourceUrl ? new HTML(resourceUrl) : undefined);
        this.set('resource', resource);
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
