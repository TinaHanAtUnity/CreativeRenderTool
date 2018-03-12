import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { PerformanceOperativeEventManager } from 'Managers/PerformanceOperativeEventManager';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { XPromoOperativeEventManager } from 'Managers/XPromoOperativeEventManager';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { VastOperativeEventManager } from 'Managers/VastOperativeEventManager';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { MRAIDOperativeEventManager } from 'Managers/MRAIDOperativeEventManager';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitialOperativeEventManager } from 'Managers/DisplayInterstitialOperativeEventManager';

export class OperativeEventManagerFactory {
    public static createOperativeEventManager(params: IOperativeEventManagerParams): OperativeEventManager {
        if(params.campaign instanceof PerformanceCampaign) {
            return new PerformanceOperativeEventManager(params);
        } else if(params.campaign instanceof XPromoCampaign) {
            return new XPromoOperativeEventManager(params);
        } else if(params.campaign instanceof VastCampaign) {
            return new VastOperativeEventManager(params);
        } else if(params.campaign instanceof MRAIDCampaign) {
            return new MRAIDOperativeEventManager(params);
        } else if(params.campaign instanceof DisplayInterstitialCampaign) {
            return new DisplayInterstitialOperativeEventManager(params);
        } else {
            return new OperativeEventManager(params);
        }
    }
}
