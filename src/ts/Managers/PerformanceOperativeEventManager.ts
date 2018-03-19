import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { Session } from 'Models/Session';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { Placement } from 'Models/Placement';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Url } from 'Utilities/Url';

export class PerformanceOperativeEventManager extends OperativeEventManager {
    private _performanceCampaign: PerformanceCampaign;

    constructor(params: IOperativeEventManagerParams<PerformanceCampaign>) {
        super(params);

        this._performanceCampaign = params.campaign;
    }

    protected createVideoEventUrl(type: string): string {
        return this._performanceCampaign.getVideoEventUrl(type);
    }

    protected createClickEventUrl(): string {
        return Url.addParameters(this._performanceCampaign.getClickUrl(), { redirect: false });
    }
}
