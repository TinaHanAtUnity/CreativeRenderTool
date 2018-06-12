import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { PerformanceOperativeEventManager } from 'Managers/PerformanceOperativeEventManager';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { XPromoOperativeEventManager } from 'Managers/XPromoOperativeEventManager';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { MRAIDOperativeEventManager } from 'Managers/MRAIDOperativeEventManager';
import { Campaign } from 'Models/Campaign';
import { ProgrammaticOperativeEventManager } from 'Managers/ProgrammaticOperativeEventManager';

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
