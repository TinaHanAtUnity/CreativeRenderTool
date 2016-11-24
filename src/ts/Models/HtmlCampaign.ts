import { Campaign } from 'Models/Campaign';

export class HtmlCampaign extends Campaign {

    private _resourceUrl: string;

    constructor(campaign: any, gamerId: string, abGroup: number, resourceUrl: string) {
        super(campaign.id, gamerId, abGroup);
        this._resourceUrl = resourceUrl;
    }

    public getResourceUrl(): string {
        return this._resourceUrl;
    }

    public setResourceUrl(url: string): void {
        this._resourceUrl = url;
    }

}
