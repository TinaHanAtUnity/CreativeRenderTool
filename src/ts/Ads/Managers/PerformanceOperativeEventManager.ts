import {
    IOperativeEventManagerParams,
    IOperativeEventParams,
    OperativeEventManager
} from 'Ads/Managers/OperativeEventManager';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { Url } from 'Core/Utilities/Url';

export class PerformanceOperativeEventManager extends OperativeEventManager {
    private _performanceCampaign: PerformanceCampaign;

    constructor(params: IOperativeEventManagerParams<PerformanceCampaign>) {
        super(params);

        this._performanceCampaign = params.campaign;
    }

    protected createVideoEventUrl(type: string): string | undefined {
        return this._performanceCampaign.getVideoEventUrl(type);
    }

    protected createClickEventUrl(): string | undefined {
        return Url.addParameters(this._performanceCampaign.getClickUrl(), { redirect: false });
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
