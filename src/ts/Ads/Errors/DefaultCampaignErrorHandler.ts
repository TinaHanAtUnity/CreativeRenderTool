import { ICampaignErrorHandler } from 'Ads/Errors/CampaignErrorHandlerFactory';
import { CampaignError } from 'Ads/Errors/CampaignError';

export class DefaultCampaignErrorHandler implements ICampaignErrorHandler {
    public handleCampaignError(campaignError: CampaignError): Promise<void> {
        // do nothing as CampaignRefreshManager log kibana handle_campaign_error for now
        return Promise.resolve();
    }
}
