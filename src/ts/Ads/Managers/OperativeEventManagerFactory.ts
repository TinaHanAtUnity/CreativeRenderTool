import { IOperativeEventManagerParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { PerformanceOperativeEventManager } from 'Ads/Managers/PerformanceOperativeEventManager';
import { XPromoCampaign } from 'Ads/Models/Campaigns/XPromoCampaign';
import { XPromoOperativeEventManager } from 'Ads/Managers/XPromoOperativeEventManager';
import { MRAIDCampaign } from 'Ads/Models/Campaigns/MRAIDCampaign';
import { MRAIDOperativeEventManager } from 'Ads/Managers/MRAIDOperativeEventManager';
import { Campaign } from 'Ads/Models/Campaign';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';

export class OperativeEventManagerFactory {
    public static createOperativeEventManager(params: IOperativeEventManagerParams<Campaign>): OperativeEventManager {
        if(params.campaign instanceof PerformanceCampaign) {
            return new PerformanceOperativeEventManager(<IOperativeEventManagerParams<PerformanceCampaign>>params);
        } else if(params.campaign instanceof XPromoCampaign) {
            return new XPromoOperativeEventManager(<IOperativeEventManagerParams<XPromoCampaign>>params);
        } else if(params.campaign instanceof MRAIDCampaign) {
            return new MRAIDOperativeEventManager(<IOperativeEventManagerParams<MRAIDCampaign>>params);
        } else {
            return new ProgrammaticOperativeEventManager(params);
        }
    }
}
