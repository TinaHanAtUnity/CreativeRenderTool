import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { PerformanceOperativeEventManager } from 'Managers/PerformanceOperativeEventManager';
import { IXPromoCampaign, XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { XPromoOperativeEventManager } from 'Managers/XPromoOperativeEventManager';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { VastOperativeEventManager } from 'Managers/VastOperativeEventManager';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { MRAIDOperativeEventManager } from 'Managers/MRAIDOperativeEventManager';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitialOperativeEventManager } from 'Managers/DisplayInterstitialOperativeEventManager';
import { Campaign, ICampaign } from 'Models/Campaign';

export class OperativeEventManagerFactory {
    public static createOperativeEventManager(params: IOperativeEventManagerParams<Campaign>): OperativeEventManager {
        if(params.campaign instanceof PerformanceCampaign) {
            return new PerformanceOperativeEventManager(<IOperativeEventManagerParams<PerformanceCampaign>>params);
        } else if(params.campaign instanceof XPromoCampaign) {
            return new XPromoOperativeEventManager(<IOperativeEventManagerParams<XPromoCampaign>>params);
        } else if(params.campaign instanceof VastCampaign) {
            return new VastOperativeEventManager(<IOperativeEventManagerParams<VastCampaign>>params);
        } else if(params.campaign instanceof MRAIDCampaign) {
            return new MRAIDOperativeEventManager(<IOperativeEventManagerParams<MRAIDCampaign>>params);
        } else if(params.campaign instanceof DisplayInterstitialCampaign) {
            return new DisplayInterstitialOperativeEventManager(<IOperativeEventManagerParams<DisplayInterstitialCampaign>>params);
        } else {
            return new OperativeEventManager(params);
        }
    }
}
