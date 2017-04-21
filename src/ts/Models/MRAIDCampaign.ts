import { Campaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';

export class MRAIDCampaign extends Campaign {

    private _resourceUrl: Asset | undefined;
    private _resource: string | undefined;

    constructor(campaign: any, gamerId: string, abGroup: number, resourceUrl?: string, resource?: string) {
        super(campaign.id, gamerId, abGroup);
        this._resourceUrl = resourceUrl ? new Asset(resourceUrl) : undefined;
        this._resource = resource;
    }

    public getResourceUrl(): Asset | undefined {
        return this._resourceUrl;
    }

    public setResourceUrl(url: string): void {
        this._resourceUrl = new Asset(url);
    }

    public setResource(resource: string): void {
        this._resource = resource;
    }

    public getResource(): string | undefined {
        return this._resource;
    }

    public getRequiredAssets() {
        return this._resourceUrl ? [this._resourceUrl] : [];
    }

    public getOptionalAssets() {
        return [];
    }

    public getDTO(): { [key: string]: any } {
        let resourceUrl: any;
        if (this._resourceUrl) {
            resourceUrl = this._resourceUrl.getDTO();
        }

        return {
            'campaign': super.getDTO(),
            'resourceUrl': resourceUrl,
            'resource': this._resource
        };
    }
}
