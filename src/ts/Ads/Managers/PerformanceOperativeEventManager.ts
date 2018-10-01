import {
    IOperativeEventManagerParams,
    IOperativeEventParams,
    OperativeEventManager
} from 'Ads/Managers/OperativeEventManager';
import { Url } from 'Core/Utilities/Url';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

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

    protected getInfoJson(params: IOperativeEventParams, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string): Promise<[string, unknown]> {
        return super.getInfoJson(params, eventId, gameSession, gamerSid, previousPlacementId).then(([id, infoJson]) => {
            if(params.asset) {
                infoJson.unityCreativeId = params.asset.getCreativeId();
            }

            return <[string, unknown]>[eventId, infoJson];
        });
    }
}
