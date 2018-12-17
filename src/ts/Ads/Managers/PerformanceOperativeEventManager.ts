import {
    IInfoJson,
    IOperativeEventManagerParams,
    IOperativeEventParams,
    OperativeEventManager
} from 'Ads/Managers/OperativeEventManager';
import { Url } from 'Core/Utilities/Url';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

export interface IPerformanceInfoJson extends IInfoJson {
    unityCreativeId?: string;
}

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

    protected getInfoJson(params: IOperativeEventParams, eventId: string, gameSession: number, previousPlacementId?: string): Promise<[string, IPerformanceInfoJson]> {
        return super.getInfoJson(params, eventId, gameSession, previousPlacementId).then(([id, infoJson]: [string, IPerformanceInfoJson]) => {
            if(params.asset) {
                infoJson.unityCreativeId = params.asset.getCreativeId();
            }
            return <[string, IInfoJson]>[eventId, infoJson];
        });
    }
}
