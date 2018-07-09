import { IOperativeEventManagerParams, IOperativeEventParams } from 'Managers/OperativeEventManager';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Url } from 'Utilities/Url';
import { ProgrammaticOperativeEventManager } from 'Managers/ProgrammaticOperativeEventManager';

export class MRAIDOperativeEventManager extends ProgrammaticOperativeEventManager {
    private _mraidCampaign: MRAIDCampaign;

    constructor(params: IOperativeEventManagerParams<MRAIDCampaign>) {
        super(params);

        this._mraidCampaign = params.campaign;
    }

    protected createVideoEventUrl(type: string): string | undefined {
        const url = this._mraidCampaign.getVideoEventUrl(type);
        if(url) {
            return url;
        }

        return super.createVideoEventUrl(type);
    }

    protected createClickEventUrl(): string | undefined {
        const clickUrl = this._mraidCampaign.getClickUrl();
        if(clickUrl) {
            return Url.addParameters(clickUrl, { redirect: false });
        }

        return super.createClickEventUrl();
    }

    protected getInfoJson(params: IOperativeEventParams, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string): Promise<[string, any]> {
        return super.getInfoJson(params, eventId, gameSession, gamerSid, previousPlacementId).then(([id, infoJson]) => {
            if(params.asset) {
                infoJson.unityCreativeId = params.asset.getCreativeId();
            }

            return <[string, any]>[eventId, infoJson];
        });
    }
}
