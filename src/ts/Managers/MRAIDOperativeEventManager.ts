import { IOperativeEventManagerParams } from 'Managers/OperativeEventManager';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Url } from 'Utilities/Url';
import { ProgrammaticOperativeEventManager } from 'Managers/ProgrammaticOperativeEventManager';

export class MRAIDOperativeEventManager extends ProgrammaticOperativeEventManager {
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
