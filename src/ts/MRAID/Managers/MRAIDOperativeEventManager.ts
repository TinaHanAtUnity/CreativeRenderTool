import { IOperativeEventManagerParams, IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Url } from 'Core/Utilities/Url';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';

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

    protected getInfoJson(params: IOperativeEventParams, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string): Promise<[string, unknown]> {
        return super.getInfoJson(params, eventId, gameSession, gamerSid, previousPlacementId).then(([id, infoJson]) => {
            if(params.asset) {
                infoJson.unityCreativeId = params.asset.getCreativeId();
            }

            return <[string, unknown]>[eventId, infoJson];
        });
    }
}
