import { Campaign } from 'Models/Campaign';

export class HtmlCampaign extends Campaign {

    private _resource: string;

    constructor(campaign: any, gamerId: string, abGroup: number, thirdPartyResource: string) {
        super(campaign, gamerId, abGroup);
        this._resource = thirdPartyResource;
    }

    public getResource(): string {
        return this._resource;
    }

    public setResource(resource: string): void {
        this._resource = resource;
    }

}
