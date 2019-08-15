import { VastCampaignErrorHandler } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { DefaultCampaignErrorHandler } from 'Ads/Errors/DefaultCampaignErrorHandler';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';

export interface ICampaignErrorHandler {
    handleCampaignError(campaignError: CampaignError): Promise<void>;
}

export class CampaignErrorHandlerFactory {
    public static getCampaignErrorHandler(contentType: string, core: ICoreApi, request: RequestManager): ICampaignErrorHandler {
        switch (contentType) {
            case CampaignContentTypes.ProgrammaticVast:
                return new VastCampaignErrorHandler(core, request);
            default:
                return new DefaultCampaignErrorHandler();
        }
    }
}
