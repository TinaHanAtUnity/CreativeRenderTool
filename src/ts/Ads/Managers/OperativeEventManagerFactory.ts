import { MRAIDOperativeEventManager } from 'Ads/Managers/MRAIDOperativeEventManager';
import { IOperativeEventManagerParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { PerformanceOperativeEventManager } from 'Ads/Managers/PerformanceOperativeEventManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Campaign } from 'Ads/Models/Campaign';
import { MRAIDCampaign } from 'Ads/Models/Campaigns/MRAIDCampaign';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

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
