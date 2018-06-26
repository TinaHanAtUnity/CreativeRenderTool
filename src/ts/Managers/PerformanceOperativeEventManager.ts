import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Url } from 'Utilities/Url';

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
}
