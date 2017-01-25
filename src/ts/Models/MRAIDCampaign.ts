import { Campaign } from 'Models/Campaign';

export class MRAIDCampaign extends Campaign {

    private _resourceUrl: string;
    private _resource: string;

    constructor(campaign: any, gamerId: string, abGroup: number, resourceUrl: string, resource: string) {
        super(campaign, gamerId, abGroup);
        this._resourceUrl = resourceUrl;
        this._resource = resource;
    }

    public getResourceUrl(): string {
        return this._resourceUrl;
    }

    public setResourceUrl(url: string): void {
        this._resourceUrl = url;
    }

    public setResource(resource: string): void {
        this._resource = resource;
    }

    public getResource(): string {
        return this._resource;
    }

}
