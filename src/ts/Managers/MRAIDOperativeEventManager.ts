import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { Session } from 'Models/Session';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Url } from 'Utilities/Url';

export class MRAIDOperativeEventManager extends OperativeEventManager {
    private _mraidCampaign: MRAIDCampaign;

    constructor(params: IOperativeEventManagerParams<MRAIDCampaign>) {
        super(params);

        this._mraidCampaign = params.campaign;
    }

    protected createVideoEventUrl(type: string): string {
        const url = this._mraidCampaign.getVideoEventUrl(type);
        if(url) {
            return url;
        }

        return super.createVideoEventUrl(type);
    }

    protected createClickEventUrl(): string {
        const clickUrl = this._mraidCampaign.getClickUrl();
        if(clickUrl) {
            return Url.addParameters(clickUrl, { redirect: false });
        }

        return super.createClickEventUrl();
    }
}
