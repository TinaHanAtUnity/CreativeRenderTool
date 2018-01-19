import { Campaign, ICampaign } from 'Models/Campaign';
import { Session } from 'Models/Session';
import { Asset, IAsset } from 'Models/Assets/Asset';

export class RealtimeCampaign extends Campaign<ICampaign> {
    constructor(session: Session) {
        super('RealtimeCampaign', {
            ... Campaign.Schema,
        }, {
            id: '',
            gamerId: '',
            abGroup: 0,
            willExpireAt: undefined,
            adType: undefined,
            correlationId: undefined,
            creativeId: undefined,
            seatId: undefined,
            meta: undefined,
            appCategory: undefined,
            appSubCategory: undefined,
            advertiserDomain: undefined,
            advertiserCampaignId: undefined,
            advertiserBundleId: undefined,
            useWebViewUserAgentForTracking: undefined,
            buyerId: undefined,
            session: session,
            mediaId: ''
        });
    }

    public getRequiredAssets(): Array<Asset<IAsset>> {
        return [];
    }

    public getOptionalAssets(): Array<Asset<IAsset>> {
        return [];
    }

    public isConnectionNeeded(): boolean {
        return false;
    }
}
