import { Campaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';

export class MRAIDCampaign extends Campaign {

    private _resourceUrl: Asset;
    private _resource: string;

    constructor(campaign: any, gamerId: string, abGroup: number, resourceUrl: string, resource: string) {
        super(campaign, gamerId, abGroup);
        this._resourceUrl = new Asset(resourceUrl);
        this._resource = resource;
    }

    public getResourceUrl(): Asset {
        return this._resourceUrl;
    }

    public setResourceUrl(url: string): void {
        this._resourceUrl = new Asset(url);
    }

    public setResource(resource: string): void {
        this._resource = resource;
    }

    public getResource(): string {
        return this._resource;
    }

    public getRequiredAssets() {
        return this._resourceUrl ? [this._resourceUrl] : [];
    }

    public getOptionalAssets() {
        return [];
    }

}
