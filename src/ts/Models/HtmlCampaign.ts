import { Campaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';

export class HtmlCampaign extends Campaign {

    private _resource: Asset;

    constructor(campaign: any, gamerId: string, abGroup: number, resourceUrl: string) {
        super(campaign.id, gamerId, abGroup);
        this._resource = new Asset(resourceUrl);
    }

    public getResource() {
        return this._resource;
    }

    public getRequiredAssets() {
        return [
            this._resource
        ];
    }

    public getOptionalAssets() {
        return [];
    }

}
