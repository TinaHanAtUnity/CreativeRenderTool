import { Campaign, ICampaign } from 'Models/Campaign';
import { Session } from 'Models/Session';
import { Asset, IAsset } from 'Models/Assets/Asset';

export class RealtimeCampaign extends Campaign<ICampaign> {
    constructor(session: Session) {
        super('RealtimeCampaign', {
            ... Campaign.Schema,
        });

        this.set('session', session);
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
